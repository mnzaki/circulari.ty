# APP: Foundframe/Spire-Loom Code Cleanup & Mux Extension

**From:** I am working on foundframe/spire-loom integration  
**Date:** 2026-02-23  
**Status:** Analysis complete, ready for implementation  

---

## Phase 0: Understanding (Completed)

### Current Architecture Confusion

**Two directories for refinements:**
```
warp/refine/          # Public API (@loom.refine.*)
├── decorator.ts      # Implementation
├── index.ts          # Re-exports
└── prisma.ts         # Specific refinement

warp/refinement/      # Core types (imported by refine/)
├── index.ts          # Re-exports types
└── types.ts          # Core interfaces
```

**Problem:** Split is confusing. `refine/decorator.ts` imports from `refinement/types.ts`.

### SpiralMux Current State

**What it does:** Aggregates multiple platform rings (Android + Desktop → Tauri)

**What we need:** Route by operation type (read → drizzle adaptor, write → tauri adaptor)

**Current usage:**
```typescript
// TauriSpiraler extends MuxSpiraler
const tauri = loom.spiral(android, desktop).tauri.plugin();
// Creates SpiralMux that routes at runtime by platform
```

**What we need:**
```typescript
// Some kind of OperationMux
const front = tauri.typescript.ddd();
// front.read → drizzle adaptor
// front.write → tauri commands → TheStream
```

---

## Phase 1: Code Cleanup - Flatten refine/refinement

### Step 1.1: Merge into warp/refine/

**Files to modify:**
- `warp/refine/index.ts` - Add type exports
- `warp/refine/types.ts` - Move from refinement/
- `warp/index.ts` - Update exports
- Delete `warp/refinement/` directory

**New structure:**
```
warp/refine/
├── index.ts          # Public API + types
├── decorator.ts      # @loom.refine.* implementation
├── types.ts          # RefinementProvider, etc.
└── prisma.ts         # Specific refinement
```

### Step 1.2: Update Imports

**Files using refinement:**
- `warp/index.ts` - Line 21-26
- `warp/refine/index.ts` - Currently imports from refinement/
- Any machinery files using refinements

---

## Phase 2: Extend SpiralMux for Operation Routing

### Step 2.1: Design OperationMux

**Concept:** A mux that routes based on CRUD operation type

```typescript
// New: OperationMux or extend SpiralMux
export class OperationMux extends SpiralMux {
  constructor(
    innerRings: SpiralRing[],
    routing: {
      read?: SpiralRing;      // → drizzle adaptor
      write?: SpiralRing;     // → tauri/TheStream
      custom?: Map<string, SpiralRing>;
    },
    spiralers: Spiralers
  ) {
    super(innerRings, spiralers);
  }
}
```

### Step 2.2: DSL Design

**WARP.ts usage:**

```typescript
// Current (platform mux)
const tauri = loom.spiral(android, desktop).tauri.plugin();

// Proposed (operation mux)
const drizzle = front.typescript.drizzle_adaptors({ filter: ['read'] });
const tauriWrite = front.typescript.tauri_adaptors({ filter: ['write'] });

// Combine into operation-routed front
const front = loom.operationMux({
  read: drizzle,
  write: tauriWrite
});
```

### Step 2.3: Sley Integration

**Sley** handles binding resolution. Currently resolves "where does this bind?"

**Extension:** Add operation-type routing to sley:

```typescript
// machinery/sley/operation-router.ts
export function routeOperation(
  operation: CrudOperation,
  mux: OperationMux
): SpiralRing {
  if (operation === 'read' || operation === 'list') {
    return mux.routing.read;
  }
  return mux.routing.write;
}
```

---

## Phase 3: Generate Composite Adaptors

### Step 3.1: Generation Target

**Current:** Generated code goes to separate packages
- `foundframe-drizzle/src/adaptors/`
- `foundframe-tauri/spire/ts/adaptors/`

**Proposed:** Generate combined adaptor in `foundframe-tauri/ts/composite/`

```typescript
// generated: foundframe-tauri/ts/composite/bookmark.adaptor.ts
export class CompositeBookmarkAdaptor implements BookmarkPort {
  constructor(
    private readAdaptor: DrizzleBookmarkAdaptor,
    private writeAdaptor: TauriBookmarkAdaptor
  ) {}

  async create(data: CreateBookmark): Promise<Bookmark> {
    // WRITE → Tauri → TheStream → PKB → event → DB update
    return this.writeAdaptor.create(data);
  }

  async getById(id: number): Promise<Bookmark | null> {
    // READ → Drizzle → SQL → DbActor → SQLite
    return this.readAdaptor.getById(id);
  }

  // ... etc
}
```

### Step 3.2: Event Coordination

**The full circle Mina described:**

```
WRITE path:
  Frontend → CompositeAdaptor.create()
    → TauriAdaptor → invoke('bookmark_add')
      → Tauri command → foundframe.thestream.add_bookmark()
        → PKB (git) + emit event
          → Tauri-plugin receives event
            → Write to SQLite (DbActor)
              → Forward event to frontend
                → Frontend refreshes via READ path

READ path:
  Frontend → CompositeAdaptor.getById()
    → DrizzleAdaptor → SQL query
      → Tauri invoke('run_sql')
        → DbActor.query()
          → Return result
```

---

## Implementation Order

### Priority 1: Cleanup (Phase 1)
- Flatten refine/refinement
- Update all imports
- Test spire-loom still works

### Priority 2: OperationMux Design (Phase 2.1-2.2)
- Add OperationMux class
- Design WARP.ts DSL
- Extend sley with operation routing

### Priority 3: Composite Generation (Phase 3)
- New treadle for composite adaptors
- Generate combined read/write adaptor
- Test the full circle

---

## Open Questions

1. **Naming:** `OperationMux` vs extending `SpiralMux` vs `CrudRouter`?
2. **Location:** Generate composite in foundframe-tauri/ts/ or new package?
3. **Configuration:** How to express in WARP.ts elegantly?
4. **Coordination:** Need input from spire-kimi on beater integration

---

## Related Work

- **spire-kimi** working on beater ORM generation
- Need alignment on how DbActor fits into the picture
- May need to extend beater to generate composite adaptors

---

*"The loom that weaves a loom is the loom that lives forever."* 🧵🌀
