---
from: I am working on spire-loom architecture
timestamp: 2026-02-23T18:10:00+01:00
completes: APP-foundframe-spire-loom-cleanup.md Phase 2
---

## ✅ Phase 2 Complete: OperationMux & Sley Integration

### New Files Created

**warp/spiral/operation-mux.ts**
```typescript
export class OperationMux<O extends Partial<Spiralers> = Spiralers> extends SpiralRing {
  constructor(
    public routing: OperationRouting,  // read | write | custom
    spiralers: O
  )
  
  getRingForOperation(operation: CrudOperation): SpiralRing | undefined
  getInnerRings(): SpiralRing[]
}

export function operationMux(routing, spiralers?)
export function hybridAdaptor(readAdaptor, writeAdaptor)
```

**machinery/sley/operation-router.ts**
```typescript
export function routeOperation(operation, ring): SpiralRing
export function routeOperations(operations, ring): Map<SpiralRing, CrudOperation[]>
export function analyzeRouting(ring): RoutingInfo[]
export function isHybridRouting(ring): boolean
export function getReadAdaptor(ring): SpiralRing | undefined
export function getWriteAdaptor(ring): SpiralRing | undefined
```

### DSL for WARP.ts

```typescript
// Option 1: Direct operationMux
const front = loom.operationMux({
  read: drizzleRing,    // → Drizzle → SQLite queries
  write: tauriRing      // → Tauri → TheStream → PKB
});

// Option 2: Convenience helper
const front = loom.hybridAdaptor(drizzleRing, tauriRing);

// Option 3: Custom per-operation routing
const front = loom.operationMux({
  read: drizzleRing,
  write: tauriRing,
  custom: new Map([
    ['list', drizzleRing],
    ['delete', softDeleteRing]  // custom handler
  ])
});
```

### Integration Points

**Exports added:**
- `warp/index.ts` - `loom.operationMux`, `loom.hybridAdaptor`
- `warp/spiral/index.ts` - All OperationMux types
- `machinery/sley/index.ts` - Operation routing functions

### Type Safety

- ✅ Full TypeScript support
- ✅ Preserves Spiraler types through OperationMuxType<O>
- ✅ Compatible with existing SpiralRing hierarchy

### Usage Example

```typescript
// In WARP.ts
const foundframe = loom.spiral(loom.rustCore());
const android = foundframe.android.foregroundService();
const desktop = foundframe.desktop.direct();
const tauri = loom.spiral(android, desktop).tauri.plugin();

// Create hybrid frontend
const drizzle = tauri.typescript.drizzle_adaptors();
const tauriWrite = tauri.typescript.tauri_adaptors();

const front = loom.hybridAdaptor(drizzle, tauriWrite);
// front.read → Drizzle
// front.write → Tauri
```

### Next: Phase 3

Ready for composite adaptor generation. The sley router provides:
- `analyzeRouting()` - For treadle generation
- `routeOperation()` - For runtime routing (if needed)
- `isHybridRouting()` - To detect when to generate composite

---

*The reed routes the warp through different heddles.* 🧵🎮
