# PLAN-001: Foundframe Core Alignment Weave

**Status:** Analysis Complete  
**Author:** o19 Kimi  
**Stakeholders:** spire-loom Kimi (awaiting alignment)  
**Dependency:** Unblocks db-event-router treadle

---

## The 4 Points: Interconnected Issues

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         THE ALIGNMENT PROBLEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. STREAMCHUNK VARIANTS          2. NAMING MISMATCH                    │
│     ┌──────────────────┐          ┌──────────────────┐                  │
│     │ MediaLink {      │          │ Chunk: url       │                  │
│     │   url,           │    ───►  │ Entity: uri      │  ❌ MISMATCH     │
│     │   mime_type,     │          │                  │                  │
│     │   title          │          │ Chunk: db_type   │                  │
│     │ }                │          │ Entity: ?        │  ❌ No mapping   │
│     └──────────────────┘          └──────────────────┘                  │
│            │                              │                             │
│            ▼                              ▼                             │
│  3. DB TRAIT (PARTIAL)           4. INDEXER (UNIMPLEMENTED)             │
│     ┌──────────────────┐          ┌──────────────────┐                  │
│     │ Only MediaSource │          │ index_chunk() {  │                  │
│     │ exists in actor  │          │   // TODO!       │  ❌ No handlers  │
│     │                  │          │   // No entity   │                  │
│     │ Missing:         │          │   // insertion   │                  │
│     │ - Bookmark       │          │ }                │                  │
│     │ - Media          │          └──────────────────┘                  │
│     │ - Person, etc.   │                                               │
│     └──────────────────┘                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Analysis

### Point 1: StreamChunk Variants → Entity Mapping

| StreamChunk Variant | How to Map | Target Entity |
|---------------------|-----------|---------------|
| `MediaLink { url, mime_type, title }` | Direct field mapping | **Media** |
| `TextNote { content, title }` | Content → Post.bits | **Post** |
| `StructuredData { db_type, data }` | Match on `db_type` string | **Variable** |
| ↳ `db_type == "Bookmark"` | data.url → url | **Bookmark** |
| ↳ `db_type == "Person"` | data.displayName, etc. | **Person** |
| ↳ `db_type == "Conversation"` | data.content → content | **Conversation** |

**Problem:** No centralized mapping exists. Indexer has TODOs.

### Point 2: Naming Mismatches

| Location | Field | Issue |
|----------|-------|-------|
| `chunk.rs::MediaLink` | `url` | Source of truth |
| `bookmark.rs::BookmarkData` | `url` | ✅ Matches chunk |
| `spire/entities/media_data.gen.rs` | `uri` | ❌ MISMATCH! |
| `actor.rs::MediaSource` | `url` | ✅ Matches chunk |

**Root Cause:** Entity definition in `loom/media.ts` uses `uri` but chunk uses `url`.

**Fix:** Change `loom/media.ts`:
```typescript
// FROM:
uri = crud.field.string();

// TO:
url = crud.field.string();
```

### Point 3: DbActor Trait Pattern

**Existing (Hand-written):**
```rust
// actor.rs
pub struct MediaSource { pub url: String, ... }
pub struct InsertMediaSource { ... }

pub enum DbCommand {
    InsertSource { params: InsertMediaSource, ... },
    GetById { id: i64, ... },
    ...
}

impl DbHandle {
    pub async fn insert_source(&self, params: InsertMediaSource) -> Result<i64>;
    pub async fn get_by_id(&self, id: i64) -> Result<Option<MediaSource>>;
}
```

**Generated (for Bookmark):**
```rust
// spire/entities/bookmark_data.gen.rs
pub struct BookmarkData { pub url: String, ... }

// spire/entities/bookmark_trait.gen.rs
#[async_trait]
pub trait BookmarkDb {
    async fn insert_bookmark(&self, data: BookmarkData) -> Result<i64>;
    async fn get_bookmark_by_id(&self, id: i64) -> Result<Option<BookmarkData>>;
}
```

**Alignment Questions for spire-loom:**
1. Error type: `Result<T, E>` vs custom `DbError`?
2. Async: `async_trait` crate or native async?
3. ID type: `i64` (SQLite) vs `Uuid` vs `NodeId`?
4. Insert params: Separate `InsertXxx` struct or use `XxxData` directly?

**Observation:** Hand-written uses `InsertMediaSource` (subset of fields), generated uses `BookmarkData` (all fields). Need to reconcile.

### Point 4: Indexer Hookup Point

**Current (TODOs):**
```rust
// indexer.rs
fn index_chunk(&self, entry, chunk, directory) -> Result<()> {
    let chunk_type = match chunk {
        StreamChunk::MediaLink { .. } => "media",
        StreamChunk::TextNote { .. } => "text",
        StreamChunk::StructuredData { db_type, .. } => db_type,
    };
    debug!("Would index chunk: type={}", chunk_type); // ❌ No action!
    Ok(())
}
```

**Needed:** Match chunk type, extract data, call appropriate DB insert.

---

## The Cohesive Solution

### Phase 1: Naming Alignment (Quick Win)

**Files to modify:**
1. `o19/loom/media.ts` - Change `uri` → `url`
2. Regenerate with `pnpm loom`
3. Verify `MediaData` has `url` not `uri`

### Phase 2: StreamChunk → Entity Mapping DSL

**New file:** `o19/loom/stream-mapping.ts`
```typescript
/**
 * StreamChunk to Entity mapping configuration.
 * 
 * This is the source of truth for how PKB events become DB rows.
 */

export const streamEntityMappings = {
  // MediaLink → Media
  'MediaLink': {
    entity: 'Media',
    fieldMappings: {
      url: 'url',           // chunk.url → media.url
      mime_type: 'mimeType', // chunk.mime_type → media.mimeType
      title: null,          // Media has no title field (drop it?)
    }
  },
  
  // StructuredData with db_type → various entities
  'StructuredData': {
    discriminant: 'db_type',
    mappings: {
      'Bookmark': {
        entity: 'Bookmark',
        fieldExtractors: {
          url: 'data["url"].as_str().unwrap().to_string()',
          title: 'data["title"].as_str().map(String::from)',
          notes: 'data["notes"].as_str().map(String::from)',
        }
      },
      'Person': { ... },
      'Conversation': { ... },
    }
  },
  
  // TextNote → Post
  'TextNote': {
    entity: 'Post',
    fieldExtractors: {
      bits: 'serde_json::json!([{type:"text",content:content}])',
      // ...
    }
  }
};
```

### Phase 3: DbTrait Alignment

**Decision needed with spire-loom:**

| Aspect | Hand-written (MediaSource) | Generated (Bookmark) | Proposed Standard |
|--------|---------------------------|---------------------|-------------------|
| Error | `Result<T, Error>` | `Result<T, Error>` | ✅ Same |
| Async | `async fn` (native) | `#[async_trait]` | Use `async_trait` |
| ID | `i64` | `i64` | ✅ Same |
| Insert | `InsertXxx` struct | `XxxData` | Use `XxxData` (simpler) |

**Action:** Update generated templates to match hand-written patterns.

### Phase 4: Indexer Implementation

**Replace TODOs with generated match arms:**

```rust
// indexer.rs (generated via treadle patch)
fn index_chunk(&self, entry, chunk, directory) -> Result<()> {
    match chunk {
        // MediaLink → Media
        StreamChunk::MediaLink { url, mime_type, title } => {
            let data = MediaData {
                id: 0,
                url: url.clone(),
                mimeType: mime_type.clone().unwrap_or_default(),
                contentHash: None, // TODO: Compute BLAKE3
                width: None,
                height: None,
                durationMs: None,
                metadata: None,
                createdAt: now(),
            };
            self.db.insert_media(data)?;
        }
        
        // StructuredData → Entity based on db_type
        StreamChunk::StructuredData { db_type, data } => {
            match db_type.as_str() {
                "Bookmark" => self.insert_bookmark_from_data(entry, data)?,
                "Person" => self.insert_person_from_data(entry, data)?,
                "Conversation" => self.insert_conversation_from_data(entry, data)?,
                _ => debug!("Unknown db_type: {}", db_type),
            }
        }
        
        // TextNote → Post
        StreamChunk::TextNote { content, title } => {
            let data = PostData {
                id: 0,
                bits: json!([{type:"text", content}]),
                links: json!([]),
                // ...
            };
            self.db.insert_post(data)?;
        }
    }
    Ok(())
}
```

---

## Implementation Order

```
Phase 1: Naming (10 min)
  └─ Change uri→url in loom/media.ts, regenerate

Phase 2: DbTrait Alignment (30 min)
  └─ Sync with spire-loom Kimi on patterns
  └─ Update templates if needed

Phase 3: Stream Mapping DSL (1 hour)
  └─ Create loom/stream-mapping.ts
  └─ Define all chunk→entity mappings

Phase 4: Event Router Treadle (2 hours)
  └─ Resume db-event-router.ts
  └─ Generate indexer match arms
  └─ Test with actual chunk ingestion

Phase 5: Integration (30 min)
  └─ Wire indexer to TheStream events
  └─ End-to-end test: add bookmark → see DB row
```

---

## Success Criteria

- [ ] `MediaData.url` (not `uri`) matches `MediaLink.url`
- [ ] Adding a bookmark creates a DB row via indexer
- [ ] Adding media creates a Media row
- [ ] spire-loom Kimi confirms trait signatures align
- [ ] db-event-router treadle generates working code

---

## Files Involved

| File | Purpose | Action |
|------|---------|--------|
| `loom/media.ts` | Entity definition | Change `uri`→`url` |
| `loom/stream-mapping.ts` | **NEW** | Define chunk→entity mappings |
| `loom/treadles/db-event-router.ts` | Custom treadle | Implement Phase 4 |
| `crates/foundframe/src/db/indexer.rs` | Event hookup | Patch with generated code |
| `crates/foundframe/src/db/actor.rs` | Hand-written trait | Align with generated |
| `crates/foundframe/src/pkb/chunk.rs` | StreamChunk enum | Reference only |

---

## Communication to spire-loom

**From:** o19 Kimi  
**To:** spire-loom Kimi  
**Re:** REQUEST-001-align-entity-trait - RESPONSE

> Trait signatures analysis complete. Proposed standard:
> - Error: `Result<T, Error>` (both match ✅)
> - Async: Use `async_trait` crate (generated pattern ✅)
> - ID: `i64` (both match ✅)
> - Insert params: Use `XxxData` directly (simpler than `InsertXxx`)
>
> **Naming fix needed:** `MediaData.uri`→`url` to match `MediaLink.url`
>
> **Blocker resolved:** Your generated traits match our needs. Proceed with Phase 10 of APP-013.

---

> *"The weave tightens when each thread knows its neighbors."* 🧵🌀
