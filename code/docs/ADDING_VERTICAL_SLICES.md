# Adding a Vertical Slice to DearDiary

This guide documents the pattern for adding a new vertical slice (feature) to the DearDiary app. A "vertical slice" means a feature that spans from the database layer all the way up to the UI.

We'll use the `LinkPreview` feature as a running example.

## Overview

A vertical slice typically touches these layers:

1. **Database Schema** (`packages/persistence-drizzle/src/schema.ts`)
2. **Types & Interfaces** (`packages/persistence/src/`)
3. **Service Implementation** (`packages/persistence-drizzle/src/services/`)
4. **Tauri Backend** (`apps/DearDiary/src-tauri/src/`)
5. **Persistence Tauri Glue** (`packages/persistence-tauri/src/`)
6. **Frontend Store** (`apps/DearDiary/src/lib/stores/`)
7. **UI Component** (`apps/DearDiary/src/lib/components/`)

---

## Step-by-Step Guide

### Step 1: Add Database Schema

**File:** `packages/persistence-drizzle/src/schema.ts`

Define your table using Drizzle's sqliteTable:

```typescript
export const linkPreviews = sqliteTable('link_previews', {
  url: text('url').primaryKey(),
  title: text('title'),
  description: text('description'),
  imageUrl: text('image_url'),
  siteName: text('site_name'),
  fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' }).notNull(),
  error: text('error')
});
```

**Generate migration:**
```bash
cd packages/persistence-drizzle
pnpm db:generate
```

---

### Step 2: Define Types & Service Interface

**File:** `packages/persistence/src/types.ts`

Add your entity type:

```typescript
export interface CachedLinkPreview {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  fetchedAt: Date;
  error?: string;
}
```

**File:** `packages/persistence/src/services.ts`

Add the service interface:

```typescript
export interface ILinkPreviewService {
  getForURL(url: string): Promise<CachedLinkPreview>;
  getCached(url: string): Promise<CachedLinkPreview | null>;
  store(preview: CachedLinkPreview): Promise<void>;
  deleteOlderThan(maxAgeMs: number): Promise<void>;
}
```

Update `IPersistenceServices` to include the new service:

```typescript
export interface IPersistenceServices {
  post: IPostService;
  view: IViewService;
  session: ISessionService;
  person: IPersonService;
  linkPreview: ILinkPreviewService;  // Add this
}
```

---

### Step 3: Implement Service in persistence-drizzle

**File:** `packages/persistence-drizzle/src/services/linkPreview.service.ts`

```typescript
import { eq, lt } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { CachedLinkPreview, ILinkPreviewService } from '@repo/persistence';
import { linkPreviews } from '../schema.js';

// For external fetching (injected from Tauri layer)
export type FetchLinkPreviewFn = (url: string) => Promise<{
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
}>;

export class LinkPreviewService implements ILinkPreviewService {
  private inFlight = new Map<string, Promise<CachedLinkPreview>>();
  
  constructor(
    private db: BaseSQLiteDatabase<any, any>,
    private fetcher?: FetchLinkPreviewFn
  ) {}

  async getForURL(url: string): Promise<CachedLinkPreview> {
    // Deduplication: return existing promise if already fetching
    const existing = this.inFlight.get(url);
    if (existing) return existing;
    
    const promise = this.fetchPreview(url);
    this.inFlight.set(url, promise);
    
    try {
      return await promise;
    } finally {
      this.inFlight.delete(url);
    }
  }
  
  // ... other methods
}
```

**Export from index:**

**File:** `packages/persistence-drizzle/src/services/index.ts`
```typescript
export { LinkPreviewService } from './linkPreview.service.js';
```

**Update createServices:**

**File:** `packages/persistence-drizzle/src/index.ts`
```typescript
export function createServices(
  db: BaseSQLiteDatabase<any, any>,
  options?: {
    linkPreviewFetcher?: FetchLinkPreviewFn;
  }
): IPersistenceServices {
  return {
    post: new PostService(db),
    view: new ViewService(db),
    session: new SessionService(db),
    person: new PersonService(db),
    linkPreview: new LinkPreviewService(db, options?.linkPreviewFetcher)
  };
}
```

---

### Step 4: Add Tauri Backend Command

**File:** `apps/DearDiary/src-tauri/Cargo.toml`

Add required crates:
```toml
[dependencies]
webpage = { version = "2.0", features = ["serde"] }
```

**File:** `apps/DearDiary/src-tauri/src/link_preview.rs`

```rust
use serde::Serialize;
use webpage::{Webpage, WebpageOptions};

#[derive(Serialize)]
pub struct LinkPreviewJSON {
    pub title: Option<String>,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub site_name: Option<String>,
}

#[tauri::command]
pub async fn link_preview_json(url: String) -> Result<LinkPreviewJSON, String> {
    let options = WebpageOptions::default();
    let webpage = Webpage::from_url(&url, options)
        .map_err(|e| format!("Failed to fetch: {}", e))?;
    
    let html = webpage.html;
    let meta = html.meta;
    
    Ok(LinkPreviewJSON {
        title: meta.get("og:title").map(|s| s.to_string()),
        description: meta.get("og:description").map(|s| s.to_string()),
        image_url: meta.get("og:image").map(|s| s.to_string()),
        site_name: meta.get("og:site_name").map(|s| s.to_string()),
    })
}
```

**Register command:**

**File:** `apps/DearDiary/src-tauri/src/lib.rs`
```rust
mod link_preview;

.invoke_handler(tauri::generate_handler![
    drizzle_proxy::run_sql,
    link_preview::link_preview_json  // Add this
])
```

---

### Step 5: Wire Up in persistence-tauri

**File:** `packages/persistence-tauri/src/index.ts`

```typescript
import { invoke } from '@tauri-apps/api/core';
import { createServices as createDrizzleServices, type FetchLinkPreviewFn } from '@repo/persistence-drizzle';

const linkPreviewFetcher: FetchLinkPreviewFn = async (url: string) => {
  const result = await invoke<{
    title?: string;
    description?: string;
    image_url?: string;
    site_name?: string;
  }>('link_preview_json', { url });
  
  return {
    title: result.title,
    description: result.description,
    imageUrl: result.image_url,
    siteName: result.site_name
  };
};

export function createServices(dbName = "database.db"): IPersistenceServices {
  return createDrizzleServices(createDrizzleProxy(dbName), {
    linkPreviewFetcher
  });
}
```

---

### Step 6: Create Frontend Store

**File:** `apps/DearDiary/src/lib/stores/linkPreview.svelte.ts`

```typescript
import type { CachedLinkPreview, ILinkPreviewService } from '@repo/persistence';

let linkPreviewService: ILinkPreviewService | null = null;
let previews = $state<Map<string, CachedLinkPreview>>(new Map());
let loading = $state<Set<string>>(new Set());

export function setLinkPreviewService(service: ILinkPreviewService): void {
  linkPreviewService = service;
}

export async function getPreview(url: string): Promise<CachedLinkPreview | null> {
  if (!linkPreviewService) return null;
  
  loading = new Set([...loading, url]);
  
  try {
    const preview = await linkPreviewService.getForURL(url);
    previews = new Map([...previews, [url, preview]]);
    return preview;
  } finally {
    const newLoading = new Set(loading);
    newLoading.delete(url);
    loading = newLoading;
  }
}

export function isLoading(url: string): boolean {
  return loading.has(url);
}
```

**Wire up in app initialization:**

**File:** `apps/DearDiary/src/lib/stores/app.svelte.ts`
```typescript
import { setLinkPreviewService } from './linkPreview.svelte';

// In initializeApp:
setLinkPreviewService(services.linkPreview);
```

---

### Step 7: Use in UI Components

**File:** `apps/DearDiary/src/lib/components/inputs/InputArea.svelte`

```svelte
<script>
  import { getPreview, isLoading } from '$lib/stores/linkPreview.svelte';
  
  let currentPreview = $state<LinkPreview | null>(null);
  
  // Fetch preview when URL changes
  $effect(() => {
    if (linkValue && isValidUrl(linkValue)) {
      getPreview(linkValue).then(preview => {
        if (preview) {
          currentPreview = {
            title: preview.title,
            description: preview.description,
            imageUri: preview.imageUrl,
            siteName: preview.siteName
          };
        }
      });
    }
  });
</script>

{#if currentPreview}
  <div class="link-preview">
    <strong>{currentPreview.title}</strong>
    <span>{currentPreview.description}</span>
  </div>
{/if}
```

---

## Key Patterns

### 1. Deduplication of Concurrent Requests

The service should return the same promise for multiple simultaneous requests:

```typescript
private inFlight = new Map<string, Promise<Result>>();

async getForURL(url: string): Promise<Result> {
  const existing = this.inFlight.get(url);
  if (existing) return existing;
  
  const promise = this.fetch(url);
  this.inFlight.set(url, promise);
  
  try {
    return await promise;
  } finally {
    this.inFlight.delete(url);
  }
}
```

### 2. Separation of Concerns

- **persistence**: Pure types and interfaces
- **persistence-drizzle**: Database operations using Drizzle ORM
- **persistence-tauri**: Tauri-specific glue (commands, invoke)
- **DearDiary stores**: Reactive frontend state

### 3. Dependency Injection

External dependencies (like Tauri commands) are injected via constructor or options:

```typescript
// persistence-drizzle accepts a fetcher function
new LinkPreviewService(db, fetcher);

// persistence-tauri provides the Tauri-specific fetcher
const fetcher = (url) => invoke('link_preview_json', { url });
```

### 4. Error Handling

Store errors in the cache to avoid retrying failed requests too often:

```typescript
const errorPreview = {
  url,
  fetchedAt: new Date(),
  error: error.message
};
await this.store(errorPreview);
```

---

## Testing Checklist

- [ ] TypeScript builds without errors (`pnpm check`)
- [ ] Tauri builds without errors (`cargo build`)
- [ ] Database migrations run successfully
- [ ] Service methods work as expected
- [ ] UI displays data correctly
- [ ] Concurrent requests are deduplicated
- [ ] Errors are handled gracefully

---

## Summary

Adding a vertical slice requires:

1. **Schema** - Define the database table
2. **Types** - Define entities and service interfaces
3. **Service** - Implement business logic with Drizzle
4. **Tauri** - Add backend commands
5. **Glue** - Wire up Tauri commands to the service
6. **Store** - Create reactive frontend state
7. **UI** - Display and interact with the data

The key insight is the **clean separation** between layers:
- Core types know nothing about the database
- Drizzle services know nothing about Tauri
- Tauri glue knows nothing about the UI
- UI only talks to stores
