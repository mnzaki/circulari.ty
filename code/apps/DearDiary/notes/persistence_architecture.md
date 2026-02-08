# Persistence Architecture: The Core Layer

> "The foundation must be deeper than the building is tall."

## Philosophy

The persistence layer is **not** part of DearDiary. It is a separate concern—a
library that DearDiary consumes. This library will eventually migrate to the
shared monorepo and power Hal-loW, Circulari.ty, and tools yet unnamed.

### Core Principles

1. **Platform Agnostic**: Pure TypeScript. No Svelte, no React, no DOM.
   Runnable in Node, Bun, Deno, browser workers, embedded devices.

2. **Backend Agnostic**: The service layer defines *what* to store. Adapters
   define *how* to store it. SQLite today, IPFS tomorrow, your NAS next week.

3. **Schema as Code**: The database schema is TypeScript. Types are derived
   from schema. Migrations are derived from schema versions.

4. **Explicit Over Implicit**: No magic ORM. You write the SQL (or equivalent)
   in the adapter. The types ensure it's correct.

5. **Continuity is Sacred**: Migration paths are first-class. Old data never
   dies, it transforms.

## Directory Structure

```
src/lib/core/                    # The Core Layer (framework-agnostic)
  schema/                        # Database schema definitions
    v1.ts                        # Version 1 schema
    v2.ts                        # Version 2 schema (when needed)
    index.ts                     # Current schema + migration chain
    types.ts                     # Derived types from schemas
    
  persistence/                   # Persistence interfaces & adapters
    interfaces.ts                # IPersistenceAdapter contract
    errors.ts                    # Persistence-specific errors
    
    adapters/                    # Backend implementations
      memory.adapter.ts          # In-memory (testing/dev)
      sqlite.adapter.ts          # SQLite via Tauri/sql.js
      # ipfs.adapter.ts          # Future: IPFS/OrbitDB
      # http.adapter.ts          # Future: REST API backend
      
  services/                      # Business logic layer
    post.service.ts              # Post CRUD + queries
    view.service.ts              # View management
    session.service.ts           # Session state persistence
    
    interfaces.ts                # IService contracts
    
  migrations/                    # Migration system
    migrator.ts                  # Migration runner
    rules/                       # Migration rule definitions
      v1-to-v2.ts                # Specific migration logic
      
  index.ts                       # Public API exports

src/lib/stores/                  # Svelte Integration (thin wrappers)
  posts.svelte.ts                # Adapts PostService to Svelte reactivity
  views.svelte.ts                # Adapts ViewService
  session.svelte.ts              # Adapts SessionService
  # Old stores replaced gradually
```

## Layer Responsibilities

### 1. Schema Layer (`core/schema/`)

Defines *what* can be stored in a type-safe way:

```typescript
// schema/v1.ts
export const PostTable = {
  name: 'posts',
  version: 1,
  columns: {
    id: { type: 'TEXT', primary: true },
    bits: { type: 'JSON', notNull: true },      // AccumulableBit[]
    links: { type: 'JSON', default: '[]' },     // XanaduLink[]
    createdAt: { type: 'INTEGER', notNull: true }, // Unix ms
    contentHash: { type: 'TEXT', nullable: true } // Future: CID
  }
} as const;

export const ViewsTable = {
  name: 'views',
  version: 1,
  columns: {
    id: { type: 'TEXT', primary: true },
    index: { type: 'INTEGER', notNull: true },
    filters: { type: 'JSON', notNull: true },
    sortBy: { type: 'TEXT', notNull: true },
    label: { type: 'TEXT', nullable: true },
    createdAt: { type: 'INTEGER', notNull: true }
  }
} as const;

// schema/index.ts - exports current schema + version
export const CURRENT_SCHEMA_VERSION = 1;
export const TABLES = [PostTable, ViewsTable, /* ... */] as const;
```

### 2. Persistence Layer (`core/persistence/`)

Defines *how* to talk to storage:

```typescript
// interfaces.ts
export interface IPersistenceAdapter {
  readonly name: string;
  readonly version: number;
  
  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Schema
  getSchemaVersion(): Promise<number>;
  setSchemaVersion(version: number): Promise<void>;
  
  // CRUD (table-agnostic via table name)
  create(table: string, data: unknown): Promise<void>;
  read<T>(table: string, id: string): Promise<T | null>;
  readAll<T>(table: string, options?: QueryOptions): Promise<T[]>;
  update(table: string, id: string, data: Partial<unknown>): Promise<void>;
  delete(table: string, id: string): Promise<void>;
  
  // Transactions
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

export interface QueryOptions {
  where?: Record<string, unknown>;
  orderBy?: { column: string; direction: 'ASC' | 'DESC' };
  limit?: number;
  offset?: number;
}
```

### 3. Service Layer (`core/services/`)

Business logic, backend-agnostic:

```typescript
// post.service.ts
export class PostService {
  constructor(private adapter: IPersistenceAdapter) {}
  
  async create(post: CreatePostInput): Promise<Post> {
    // Business logic: validate, generate hash, etc.
    const validated = validatePost(post);
    await this.adapter.create('posts', validated);
    return validated;
  }
  
  async getById(id: string): Promise<Post | null> {
    return this.adapter.read<Post>('posts', id);
  }
  
  async getAll(filters?: PostFilters): Promise<Post[]> {
    // Translate domain filters to query options
    const options = this.buildQueryOptions(filters);
    return this.adapter.readAll<Post>('posts', options);
  }
  
  async update(id: string, updates: Partial<Post>): Promise<void> {
    // Business logic: merge bits, update modifiedAt
    await this.adapter.update('posts', id, updates);
  }
  
  async delete(id: string): Promise<void> {
    await this.adapter.delete('posts', id);
  }
  
  // Domain-specific queries
  async searchByKeyword(keyword: string): Promise<Post[]> {
    // Full-text search logic
  }
  
  async getByDateRange(from: Date, to: Date): Promise<Post[]> {
    // Date filtering logic
  }
}
```

### 4. Migration Layer (`core/migrations/`)

Schema evolution without data loss:

```typescript
// migrator.ts
export class SchemaMigrator {
  constructor(
    private adapter: IPersistenceAdapter,
    private migrations: Migration[]
  ) {}
  
  async migrate(): Promise<void> {
    const currentVersion = await this.adapter.getSchemaVersion();
    const targetVersion = Math.max(...this.migrations.map(m => m.toVersion));
    
    if (currentVersion >= targetVersion) return;
    
    for (const migration of this.migrations) {
      if (migration.fromVersion === currentVersion) {
        console.log(`Migrating: v${migration.fromVersion} → v${migration.toVersion}`);
        await migration.execute(this.adapter);
        await this.adapter.setSchemaVersion(migration.toVersion);
      }
    }
  }
}

// rules/v1-to-v2.ts (hypothetical future migration)
export const v1ToV2Migration: Migration = {
  fromVersion: 1,
  toVersion: 2,
  async execute(adapter) {
    // Add new column
    await adapter.exec(`ALTER TABLE posts ADD COLUMN signature TEXT`);
    
    // Migrate existing data
    const posts = await adapter.readAll('posts');
    for (const post of posts) {
      const signature = await generateSignature(post);
      await adapter.update('posts', post.id, { signature });
    }
  }
};
```

### 5. Svelte Integration (`stores/`)

Thin reactive wrappers—Svelte knows about services, services don't know about Svelte:

```typescript
// posts.svelte.ts
import { PostService } from '$lib/core/services/post.service';
import { getAdapter } from './adapter.instance'; // Singleton adapter

const service = new PostService(getAdapter());

// Reactive state backed by service
let posts = $state<Post[]>([]);

// Load on mount
$effect(() => {
  service.getAll().then(data => posts = data);
});

// Actions that mutate through service
export async function addPost(post: CreatePostInput) {
  const created = await service.create(post);
  posts = [created, ...posts]; // Optimistic update
  return created;
}

export async function removePost(id: string) {
  await service.delete(id);
  posts = posts.filter(p => p.id !== id);
}
```

## Naming Conventions

| Concept | Pattern | Example |
|---------|---------|---------|
| Schema | `*Table` (const) | `PostTable`, `ViewsTable` |
| Adapter | `*.adapter.ts` | `sqlite.adapter.ts` |
| Service | `*Service` (class) | `PostService`, `ViewService` |
| Migration | `v{N}-to-v{N+1}.ts` | `v1-to-v2.ts` |
| Error | `*Error` (class) | `PersistenceError`, `MigrationError` |
| Interface | `I*` prefix | `IPersistenceAdapter`, `IPostService` |

## Adapter Implementation Strategy

### SQLite (Tauri)
- Uses `@tauri-apps/plugin-sql` or `sql.js` in web
- Creates tables from schema definitions
- JSON columns stored as TEXT with JSON functions
- Migrations run SQL `ALTER TABLE` statements

### Memory (Testing)
- Simple Map-based storage
- Fast, ephemeral
- Perfect for unit tests

### Future: IPFS
- Content-addressed (hash as key)
- OrbitDB for indexing/querying
- CRDT for conflict resolution

### Future: HTTP
- REST API client
- Offline queue for mutations
- Sync when online

## Integration Path

1. **Phase 1**: Create core layer alongside existing stores
2. **Phase 2**: Implement SQLite adapter, test with memory adapter
3. **Phase 3**: Rewrite Svelte stores as thin service wrappers
4. **Phase 4**: Remove old stores, core layer owns all persistence
5. **Phase 5**: Extract core to shared package

## The Vision

This architecture lets us:
- Swap SQLite for IPFS without touching business logic
- Test services with memory adapter (fast, no setup)
- Sync across devices by adding a sync adapter
- Share code between DearDiary, Hal-loW, and Circulari.ty
- Migrate schemas gracefully as we evolve

The core layer is the **lingua franca** of our ecosystem—pure, typed, timeless.
