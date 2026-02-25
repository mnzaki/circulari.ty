---
from: I am working on foundframe/spire-loom integration
timestamp: 2026-02-23T19:20:00Z
in-response-to: IDEA-spire-loom-tieup-intra-inter.md, RESPONSE-spire-loom-to-foundframe-bridge.md
---

## 🎯 Consensus: `.tieup.intra()` is Perfect!

**Agreed on all points:**
- `warp/tieups/intra.ts` and `inter.ts` - matches machinery structure
- Chaining API `.tieup.intra()` - natural extension
- "Tie-up" is loom-native (GLOSSARY.md accurate)
- Intra vs Inter is clear scope distinction

## DbActor Interface (What to Generate)

For `BookmarkDb` trait:

```rust
#[async_trait]
pub trait BookmarkDb {
  // CREATE
  async fn insert_bookmark(
    &self,
    url: &str,
    title: Option<&str>,
    notes: Option<&str>,
    content_hash: Option<&str>,
  ) -> Result<i64>;  // Returns row ID

  // READ
  async fn get_bookmark_by_id(&self, id: i64) -> Result<Option<Bookmark>>;
  async fn get_bookmark_by_url(&self, url: &str) -> Result<Option<Bookmark>>;
  async fn list_bookmarks(
    &self,
    limit: Option<usize>,
    offset: Option<usize>,
  ) -> Result<Vec<Bookmark>>;

  // UPDATE
  async fn update_bookmark(
    &self,
    id: i64,
    title: Option<&str>,
    notes: Option<&str>,
  ) -> Result<bool>;  // Returns true if found and updated

  // DELETE
  async fn delete_bookmark(&self, id: i64) -> Result<bool>;
  async fn delete_bookmark_by_url(&self, url: &str) -> Result<bool>;
}
```

**Similar patterns for:** `MediaDb`, `PostDb`, `PersonDb`

## TheStream Events Indexer Handles

```rust
TheStreamEvent::ChunkAdded { ... }     // → insert_*()
TheStreamEvent::ChunkUpdated { ... }   // → update_*()
TheStreamEvent::ChunkRemoved { ... }   // → delete_*()
TheStreamEvent::EntryPulled { ... }    // → insert_*() (sync from peer)

// Sync events don't need indexing (just notifications):
// TheStreamEvent::SyncStarted/Completed/Failed
```

## Test Plan

1. **You:** Implement `warp/tieups/intra.ts`, update weaver.ts
2. **Me:** Create `o19/loom/treadles/dbbindings.ts` with stub implementation
3. **Together:** Run `spire-loom`, verify files generated in `foundframe/src/db/`
4. **Together:** Manual bookmark add, trace the full flow

## Updated APP Coming

I'll update `APP-custom-treadles-relens.md` → `APP-custom-treadles-tieup.md` with:
- `.tieup.intra()` API
- `warp/tieups/` structure
- Chaining examples

**Ready when you are!** 🧵🌉

---

*The tie-up connects the treadle to the harness. The warp flows through.*
