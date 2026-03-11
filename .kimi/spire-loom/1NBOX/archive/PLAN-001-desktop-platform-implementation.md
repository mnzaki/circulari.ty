# PLAN-001: Desktop Platform Real Implementation

**Stream**: spire-loom  
**Status**: Proposed  
**Created**: 2026-03-02  

## Current State

Generated `desktop.rs` uses stubs that return `Default::default()` with warning logs:

```rust
fn bookmark_get_bookmark(&self, id: i64) -> Bookmark {
  tracing::warn!("bookmark_get_bookmark: stub implementation");
  // Entity type: Bookmark
  Default::default()
}
```

## Goal

Generate real implementations that call foundframe's database services using the `with_db` pattern.

## Architecture

### 1. Add `with_db` to Foundframe (foundframe/src/lib.rs)

Similar to existing `with_thestream()` and `with_device_manager()`:

```rust
pub fn with_db<T, E, F>(&self, f: F) -> std::result::Result<T, E>
where
  F: FnOnce(&db::DbHandle) -> std::result::Result<T, E>,
  E: From<Error>,
{
  let guard = self.db.lock().unwrap();
  match guard.as_ref() {
    Some(db) => f(db),
    None => Err(Error::DatabaseConnection("DB not initialized".into()).into()),
  }
}
```

### 2. Make Platform Methods Async

Change platform trait methods to async with proper Result wrapping:

```rust
// From:
fn bookmark_get_bookmark(&self, id: i64) -> Bookmark;

// To:
async fn bookmark_get_bookmark(&self, id: i64) -> Result<Bookmark, Error>;
```

### 3. Template Generation (desktop.rs.ejs)

Generate real service calls:

```rust
async fn <%= method.name %>(&self, <%= method.params %>) -> Result<<%= method.rsReturnType %>, Error> {
  let foundframe = self.foundframe()
    .lock()
    .map_err(|_| Error::Other("Mutex poisoned".into()))?
    .as_ref()
    .ok_or_else(|| Error::Other("Foundframe not initialized".into()))?;
  
  foundframe.with_db(|db| {
    db.<%= method.serviceMethod %>(<%= method.params %>)
  }).map_err(|e| Error::Other(e.to_string()))
}
```

## Implementation Steps

| Step | Task | Files |
|------|------|-------|
| 1 | Add `with_db` method to Foundframe | `foundframe/src/lib.rs` |
| 2 | Update `RustMethod` for async + Result | `code-generator.ts` |
| 3 | Generate real service calls | `desktop.rs.ejs` |
| 4 | Add error conversion | `error.rs` |
| 5 | Refactor other platform templates | `mobile/android.rs.ejs`, `mobile/ios.rs.ejs` |

## Questions for Advice

1. **Async strategy**: Use `tokio::task::block_in_place` or make everything async?
2. **Error types**: Add `From<foundframe::Error>` to the spire error enum?
3. **Service mapping**: How to map method names to DbHandle methods (bookmark_get → get_bookmark)?

## Dependencies

- Requires `with_db` pattern implementation in foundframe core
- Needs async runtime coordination between Tauri and foundframe

---

> *"The loom weaves what the warp intends."*
