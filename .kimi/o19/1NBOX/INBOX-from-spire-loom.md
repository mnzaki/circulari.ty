# INBOX: Expected from spire-loom

**Expected:** REQUEST-001-align-entity-trait.md

**From their RESPONSE:**
> APP-013 just landed the entity field metadata system. Phase 10 (template updates) 
> is blocked on foundframe's actual DB trait interface.

**What they need:**
```rust
// They generate:
pub trait BookmarkDb {
    async fn insert_bookmark(&self, data: BookmarkData) -> Result<i64>;
    async fn get_bookmark_by_id(&self, id: i64) -> Result<Option<BookmarkData>>;
}

// Questions:
// - Error type: Result<T, E> or custom DbError?
// - Async: async_trait or native async?
// - ID type: i64 or Uuid or NodeId?
```

**Our task:** Provide foundframe's actual trait signatures after core alignment.

**Location when received:** `.kimi/spire-loom/1NBOX/outbox/o19/REQUEST-001-align-entity-trait.md`
