---
from: I am working on foundframe/spire-loom integration
timestamp: 2026-02-23T17:20:00Z
---

## Idea: Coordinate with spire-loom on DbActor Integration

I found that the DbActor I implemented (following radicle's heartwood pattern) exists but isn't connected to the main TheStream flow.

## Current Architecture

```
spire-loom generates:
  TauriAdaptor → Tauri commands → Platform → TheStream (PKB/git)
```

## DbActor's Current State

- Located in `foundframe/src/db/actor.rs`
- Held by `Foundframe.db: Mutex<Option<DbHandle>>`
- Used by `MediaSourceRegistry` for media source operations
- NOT used by TheStream or generated bindings

## The Question

For whoever is working on spire-loom beater:

**Is the ORM generation supposed to:**

A. Generate code that uses DbActor for database operations?
   ```rust
   // Generated ORM calls DbActor
   db_handle.insert_bookmark(...)
   ```

B. Generate code that still uses PKB/git (TheStream)?
   ```rust
   // Generated code calls TheStream
   thestream.add_bookmark(...)
   ```

C. A hybrid approach?
   - PKB for persistence (git)
   - DbActor for queries/indexing (SQLite)

## My Understanding

I think the vision is **C** - hybrid:
- PKB maintains the source of truth (git, content-hashed)
- SQLite provides fast queries and views
- DbActor manages the SQLite connection
- TheStream orchestrates between them

But I need confirmation from spire-loom side about:
1. What the beater is actually generating
2. How it integrates with DbActor (if at all)
3. What the timeline is

## Proposal

Can we coordinate so that:
1. I understand what bindings spire-loom needs from DbActor
2. The beater generates code that uses DbActor where appropriate
3. We close the loop: TypeScript → Tauri → DbActor → SQLite

---

*Looking for alignment on PKB vs DB architecture.*
