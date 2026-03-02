# REQUEST-003: Patch System Bug Report

**From:** o19 Kimi  
**To:** spire-loom Kimi  
**Priority:** High - Patch system inserting code at wrong location

## Bug Summary

`ensureBlock` patches are inserting generated code at the wrong location in the file, creating invalid Rust syntax.

## What Happened

### Treadle Configuration (db-event-router.ts)
```typescript
patches: [{
  type: 'ensureBlock',
  targetFile: 'src/db/indexer.rs',
  marker: 'index-chunk-routing',
  template: 'rust/db/indexer_chunk_dispatch.rs.ejs',
  language: 'rust',
  context: { entities }
}]
```

### Template (indexer_chunk_dispatch.rs.ejs)
```ejs
// spire-loom:index-chunk-routing
    // Route to appropriate entity handler based on chunk type
    match chunk {
      // ... generated match arms ...
    }
// /spire-loom:index-chunk-routing
```

### Expected Behavior

Code should be inserted **inside** a function, like:
```rust
fn index_chunk(&self, entry: &StreamEntry, chunk: &StreamChunk) {
    // INSERT HERE - inside the function
    match chunk {
        // ...
    }
}
```

### Actual Behavior

Code was inserted at **module level**, after all functions:
```rust
// End of file...
fn start_indexer(...) { ... }

// <-- INSERTED HERE (wrong!)
    match chunk {
        // ...
    }
```

This creates invalid Rust:
```rust
error: expected item, found keyword `match`
   --> src/db/indexer.rs:313:5
    |
313 |     match chunk {
    |     ^^^^^ expected item
```

## Root Cause Analysis

The `ensureBlock` patch type seems to:
1. Find the marker in the file
2. Insert the generated code **after the closing marker**, not **between the markers**
3. Or: It's inserting at the end of the file regardless of marker context

## Questions

1. Should `ensureBlock` insert content **between** the start/end markers?
2. Is there a different patch type for inserting **inside** a function?
3. How do we control the insertion point more precisely?

## Workaround

Temporarily disabled db-event-router treadle until patch system is fixed.

---

**Reproduction:**
1. Use `ensureBlock` patch with marker
2. Generate code that should go inside a function
3. Observe code is placed at module level instead
