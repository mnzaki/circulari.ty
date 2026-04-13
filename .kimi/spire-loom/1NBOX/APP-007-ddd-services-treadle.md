# APP-007: DDD Services Treadle (Management Methods-Based)

**Status**: 📋 Proposed  
**Priority**: High - Completes foundframe-front architecture  
**Scope**: `o19/loom/treadles/ddd-services.ts`, `foundframe-front/spire/src/{ports,services,adaptors}/`, tests

---

## Context

After reviewing:
- `spire-loom/machinery/heddles/pattern-matcher.ts` - Management method collection
- `spire-loom/machinery/treadle-kit/*` - `context.methods` with helpers
- `spire-loom/HOW_TO_LOOM.md` - Method-driven generation patterns
- `foundframe-front/src/*` - Current manual ports/services

We have a **management methods system** that provides:
- `context.methods.all` - All methods from managements
- `context.methods.byManagement()` - Grouped by management name
- `context.methods.creates/reads/updates/deletes/lists` - By CRUD type
- Each method has: `name`, `params`, `returnType`, `crudOperation`, `managementName`

**Current Gap**: We're generating based on entity lists (`['Bookmark', 'Media', ...]`) when we should generate based on **actual management methods** collected from the spiral.

---

## Problem

1. **Kysely adaptor** currently generates based on hardcoded entity lists
2. **Tauri adaptor** generates based on hardcoded entity lists  
3. **Services/ports** are hand-written but should be generated from management methods
4. **Mismatch**: Management methods define the API, but generators don't use them

---

## Solution: Management Methods-Driven Generation + TDD

### Architecture

```
Management Imprints (loom/*.ts)
    ↓
Spire-Loom collects methods via heddles
    ↓
context.methods available in treadles
    ├─ byManagement() → Map<mgmtName, methods[]>
    ├─ creates/reads/updates/deletes/lists
    └─ all
    ↓
Treadles generate from actual methods:
    ├─ dddServicesTreadle → ports + services
    ├─ kyselyAdaptorTreadle → read adaptors  
    └─ tauriCommandsAdaptor → write adaptors
    ↓
Tests verify generated code works:
    └─ Integration test: mock Kysely + Tauri → test combined service
```

### Testing Strategy

**Test Location**: `foundframe-front/tests/services.integration.test.ts`

**Test Approach**: 
- Node.js built-in test runner (no Jest needed! Node 18+)
- Mock Kysely with `mock-kysely` or simple stubs
- Mock Tauri invoke with global mock
- Test the adaptor selector pattern

**Why Node built-in?**
- No additional dependencies
- Native TypeScript support with `tsx`
- Works with ESM

---

## TDD Test Specification

### Test File Structure

```typescript
// foundframe-front/tests/services.integration.test.ts

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock Kysely
class MockKysely {
  private data = new Map();
  
  selectFrom(table: string) {
    return {
      where: (col: string, op: string, val: any) => ({
        selectAll: () => ({
          executeTakeFirst: async () => this.data.get(`${table}:${val}`) || null
        }),
        execute: async () => Array.from(this.data.values()).filter((r: any) => r[col] === val)
      }),
      selectAll: () => ({
        execute: async () => Array.from(this.data.values())
      })
    };
  }
  
  insertInto(table: string) {
    return {
      values: (data: any) => ({
        returning: (cols: string[]) => ({
          executeTakeFirst: async () => {
            const id = Math.floor(Math.random() * 1000);
            const record = { id, ...data, created_at: new Date() };
            this.data.set(`${table}:${id}`, record);
            return record;
          }
        })
      })
    };
  }
  
  // Seed data for tests
  seed(table: string, records: any[]) {
    records.forEach(r => this.data.set(`${table}:${r.id}`, r));
  }
}

// Mock Tauri invoke
const mockInvocations = new Map();

global.invoke = async (cmd: string, args: any) => {
  const handler = mockInvocations.get(cmd);
  if (!handler) throw new Error(`No mock for command: ${cmd}`);
  return handler(args);
};

// Import generated code (these will fail until generated!)
import { KyselyBookmarkAdaptor } from '../spire/src/adaptors/gen/bookmark.adaptor.gen.js';
import { TauriBookmarkAdaptor } from '../spire/src/adaptors/tauri/bookmark.adaptor.gen.js';
import { BookmarkService } from '../spire/src/services/bookmark.service.gen.js';

describe('DDD Services Integration', () => {
  let mockDb: MockKysely;
  let kyselyAdaptor: KyselyBookmarkAdaptor;
  let tauriAdaptor: TauriBookmarkAdaptor;
  let service: BookmarkService;
  
  beforeEach(() => {
    mockDb = new MockKysely();
    
    // Seed some test data
    mockDb.seed('bookmark', [
      { id: 1, url: 'https://example.com', title: 'Example', notes: '', created_at: new Date() }
    ]);
    
    kyselyAdaptor = new KyselyBookmarkAdaptor(mockDb as any);
    tauriAdaptor = new TauriBookmarkAdaptor();
    
    // The key pattern: combine read + write adaptors
    service = new BookmarkService(kyselyAdaptor, tauriAdaptor);
    
    // Setup Tauri mocks
    mockInvocations.clear();
  });
  
  describe('Read operations (via Kysely)', () => {
    it('should get bookmark by ID', async () => {
      const result = await service.getBookmarkById(1);
      assert.ok(result);
      assert.strictEqual(result.url, 'https://example.com');
    });
    
    it('should return null for non-existent ID', async () => {
      const result = await service.getBookmarkById(999);
      assert.strictEqual(result, null);
    });
    
    it('should query bookmarks', async () => {
      const results = await service.queryBookmarks();
      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 1);
    });
  });
  
  describe('Write operations (via Tauri)', () => {
    it('should create bookmark via Tauri', async () => {
      let capturedArgs: any;
      mockInvocations.set('add_bookmark', (args) => {
        capturedArgs = args;
        return { id: 2, url: args.url, title: args.title, created_at: new Date() };
      });
      
      const result = await service.addBookmark('https://test.com', 'Test');
      
      assert.strictEqual(capturedArgs.url, 'https://test.com');
      assert.strictEqual(capturedArgs.title, 'Test');
      assert.ok(result.id);
    });
    
    it('should delete bookmark via Tauri', async () => {
      let capturedArgs: any;
      mockInvocations.set('delete_bookmark', (args) => {
        capturedArgs = args;
        return true;
      });
      
      const result = await service.deleteBookmark('pkb://...');
      
      assert.strictEqual(capturedArgs.pkbUrl, 'pkb://...');
      assert.strictEqual(result, true);
    });
  });
  
  describe('Service composition', () => {
    it('should use correct adaptor for each operation', async () => {
      // Track which adaptor handles which call
      const calls: string[] = [];
      
      // Wrap adaptors to track calls
      const trackingKysely = new Proxy(kyselyAdaptor, {
        get(target, prop) {
          const val = target[prop as keyof typeof target];
          if (typeof val === 'function') {
            return (...args: any[]) => {
              calls.push(`kysely:${String(prop)}`);
              return val.apply(target, args);
            };
          }
          return val;
        }
      });
      
      const trackingTauri = new Proxy(tauriAdaptor, {
        get(target, prop) {
          const val = target[prop as keyof typeof target];
          if (typeof val === 'function') {
            return (...args: any[]) => {
              calls.push(`tauri:${String(prop)}`);
              return val.apply(target, args);
            };
          }
          return val;
        }
      });
      
      const trackingService = new BookmarkService(trackingKysely, trackingTauri);
      
      // Setup mocks
      mockInvocations.set('add_bookmark', () => ({ id: 1 }));
      
      // Do a read
      await trackingService.getBookmarkById(1);
      
      // Do a write
      await trackingService.addBookmark('https://test.com');
      
      // Verify routing
      assert.ok(calls.some(c => c.startsWith('kysely:')));
      assert.ok(calls.some(c => c.startsWith('tauri:')));
    });
  });
});
```

---

## Treadle Specification

### 1. DDD Services Treadle

```typescript
// o19/loom/treadles/ddd-services.ts

export const dddServicesTreadle = defineTreadle({
  name: 'ddd-services',
  
  matches: [{ current: 'TypeScriptDDDSpiraler', previous: 'TauriSpiraler' }],
  
  methods: {
    filter: 'front',
    pipeline: []
  },
  
  outputs: [
    // Generate ports from management methods
    (ctx) => {
      const specs: OutputSpec[] = [];
      
      ctx.methods?.byManagement().forEach((methods, mgmtName) => {
        const entityName = mgmtName.replace(/Mgmt$/, '');
        
        specs.push({
          template: 'ddd/port.ts.ejs',
          path: `src/ports/${entityName.toLowerCase()}.port.gen.ts`,
          language: 'typescript',
          data: {
            managementName: mgmtName,
            entityName,
            methods: methods.map(m => ({
              name: m.name,
              snakeName: m.snakeName || toSnakeCase(m.name),
              pascalName: toPascalCase(m.name),
              params: m.params,
              returnType: m.returnType,
              crudOperation: m.crudOperation,
              description: m.description
            }))
          }
        });
      });
      
      return specs;
    },
    
    // Generate services
    (ctx) => {
      const specs: OutputSpec[] = [];
      
      ctx.methods?.byManagement().forEach((methods, mgmtName) => {
        const entityName = mgmtName.replace(/Mgmt$/, '');
        
        // Separate read vs write for Pick<> types
        const readMethods = methods.filter(m => 
          m.crudOperation === 'read' || m.crudOperation === 'list'
        );
        const writeMethods = methods.filter(m => 
          m.crudOperation === 'create' || m.crudOperation === 'update' || m.crudOperation === 'delete'
        );
        
        specs.push({
          template: 'ddd/service.ts.ejs',
          path: `src/services/${entityName.toLowerCase()}.service.gen.ts`,
          language: 'typescript',
          data: {
            managementName: mgmtName,
            entityName,
            allMethods: methods,
            readMethods,
            writeMethods
          }
        });
      });
      
      return specs;
    },
    
    // Index files
    { template: 'ddd/ports-index.ts.ejs', path: 'src/ports/index.gen.ts', language: 'typescript' },
    { template: 'ddd/services-index.ts.ejs', path: 'src/services/index.gen.ts', language: 'typescript' }
  ],
  
  data: (ctx) => ({
    byManagement: Object.fromEntries(ctx.methods?.byManagement() || new Map()),
    creates: ctx.methods?.creates || [],
    reads: ctx.methods?.reads || [],
    updates: ctx.methods?.updates || [],
    deletes: ctx.methods?.deletes || [],
    lists: ctx.methods?.lists || [],
    all: ctx.methods?.all || []
  })
});
```

### 2. Service Template (Pick<> for type-safe injection)

```typescript
// machinery/bobbin/typescript/ddd/service.ts.ejs

import type { <%- entityName %>Port } from '../ports/<%- entityName.toLowerCase() %>.port.gen.js';
<% if (readMethods.length > 0) { %>
import type { <%- readMethods.map(m => m.returnType).filter((v, i, a) => a.indexOf(v) === i).join(', ') %> } from '../domain/entities/<%- entityName.toLowerCase() %>.js';
<% } %>

/**
 * <%- entityName %>Service - DDD Service (GENERATED)
 * 
 * Implements <%- entityName %>Port by delegating:
<% readMethods.forEach(m => { -%>
 * - <%- m.name %> → readAdaptor
<% }); -%>
<% writeMethods.forEach(m => { -%>
 * - <%- m.name %> → writeAdaptor
<% }); -%>
 */
export class <%- entityName %>Service implements <%- entityName %>Port {
  constructor(
    private readAdaptor: Pick<<%- entityName %>Port, <%- readMethods.map(m => `'${m.name}'`).join(' | ') || 'never' %>>,
    private writeAdaptor: Pick<<%- entityName %>Port, <%- writeMethods.map(m => `'${m.name}'`).join(' | ') || 'never' %>>
  ) {}

<% allMethods.forEach(method => { -%>
  /**
   * <%- method.managementName %>.<%- method.name %>
<% method.params.forEach(p => { -%>
   * @param <%- p.name %> <%- p.description || '' %>
<% }); -%>
   */
  <%- method.name %>(<%- method.params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ') %>): Promise<<%- method.returnType %>> {
<% if (readMethods.some(r => r.name === method.name)) { -%>
    return this.readAdaptor.<%- method.name %>(<%- method.params.map(p => p.name).join(', ') %>);
<% } else { -%>
    return this.writeAdaptor.<%- method.name %>(<%- method.params.map(p => p.name).join(', ') %>);
<% } -%>
  }

<% }); -%>
}
```

### 3. Tauri Commands Adaptor

```typescript
// o19/loom/treadles/tauri-commands-adaptor.ts

export const tauriCommandsAdaptorTreadle = defineTreadle({
  name: 'tauri-commands-adaptor',
  
  matches: [{ current: 'TauriSpiraler.plugin', previous: 'RustAndroidSpiraler' }],
  
  methods: {
    filter: 'platform',
    pipeline: [addManagementPrefix()]
  },
  
  outputs: [
    (ctx) => {
      const specs: OutputSpec[] = [];
      
      ctx.methods?.byManagement().forEach((methods, mgmtName) => {
        const entityName = mgmtName.replace(/Mgmt$/, '');
        
        // Generate for ALL methods (commented out filterOut in WARP.ts)
        if (methods.length > 0) {
          specs.push({
            template: 'tauri/commands-adaptor.ts.ejs',
            path: `src/adaptors/tauri/${entityName.toLowerCase()}.adaptor.gen.ts`,
            language: 'typescript',
            data: {
              managementName: mgmtName,
              entityName,
              methods: methods.map(m => ({
                name: m.name,
                snakeName: m.snakeName || toSnakeCase(m.name),
                params: m.params,
                returnType: m.returnType,
                crudOperation: m.crudOperation
              }))
            }
          });
        }
      });
      
      return specs;
    }
  ]
});
```

---

## Test Runner Setup

### Package.json Scripts

```json
{
  "scripts": {
    "test": "node --test --import=tsx tests/**/*.test.ts",
    "test:watch": "node --test --import=tsx --watch tests/**/*.test.ts"
  }
}
```

### No Jest Needed!

Node.js 18+ has built-in test runner:
- `node:test` for test framework
- `node:assert` for assertions
- Works with ESM and TypeScript (via `tsx`)

### CI Integration

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    # Generate code first
    cd o19 && pnpm spire-loom
    # Then test
    cd packages/foundframe-front && pnpm test
```

---

## TDD Workflow

1. **Red**: Write test that imports non-existent generated files (fails)
2. **Green**: Implement treadle to generate files (test passes)
3. **Refactor**: Improve templates, add edge cases

```bash
# Step 1: Test fails (files don't exist)
cd o19/packages/foundframe-front
pnpm test
# → Error: Cannot find module '../spire/src/services/bookmark.service.gen.js'

# Step 2: Run generator
cd o19
pnpm spire-loom

# Step 3: Test passes
pnpm test
# ✓ DDD Services Integration
#   ✓ Read operations (via Kysely)
#   ✓ Write operations (via Tauri)
#   ✓ Service composition
```

---

## Success Criteria

- [ ] Test file imports generated code and runs with `node --test`
- [ ] Mock Kysely works for read operations
- [ ] Mock Tauri invoke works for write operations
- [ ] Service correctly routes reads to Kysely, writes to Tauri
- [ ] All tests pass after `spire-loom` generation
- [ ] No Jest dependency (Node built-in only)

---

*"Test the composition, trust the generation."* 🌀
