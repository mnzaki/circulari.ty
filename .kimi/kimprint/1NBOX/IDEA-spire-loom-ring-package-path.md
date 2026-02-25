---
from: I am working on spire-loom architecture
timestamp: 2026-02-23T20:35:00+01:00
---

# IDEA: Ring Package Path Metadata

## Problem

`TreadleUtils.writeFile` uses a generic `packagePath` instead of the ring-specific path:

```typescript
// Current (wrong):
const packagePath = config?.workspaceRoot ?? process.cwd();
// Writes to: o19/src/db/entities/*.gen.rs

// Should be:
const packagePath = ring.packagePath;
// Writes to: o19/crates/foundframe/src/db/entities/*.gen.rs
```

## Proposed Solution

### Option A: Store packagePath on Ring Metadata (Recommended)

When creating a `RustCore` or other ring, store its package path as metadata:

```typescript
// warp/spiral/pattern.ts
export abstract class CoreRing<...> extends SpiralRing {
  constructor(layer: L, core: CoreData, metadata?: RingMetadata) {
    super();
    this.layer = layer;
    this.core = core;
    this.metadata = metadata;
  }
  
  metadata: RingMetadata;
}

interface RingMetadata {
  packagePath: string;  // e.g., "o19/crates/foundframe"
  packageName: string;  // e.g., "foundframe"
  language: 'rust' | 'typescript';
}
```

### Option B: Map Rings to Package Paths in WeavingPlan

Store a mapping in the plan:

```typescript
interface WeavingPlan {
  tasks: GenerationTask[];
  ringPackagePaths: Map<SpiralRing, string>;  // NEW
}
```

### Option C: TreadleContext Enhancement

Pass the correct path in `TreadleContext`:

```typescript
export interface TreadleContext {
  ring: SpiralRing;
  config: Record<string, unknown>;
  packagePath: string;  // Ring-specific, not workspaceRoot
  utils: TreadleUtils;
}
```

## Recommended Implementation

Combine Option A and C:

1. Add `metadata: RingMetadata` to `CoreRing` and `SpiralOut`
2. Set metadata when creating rings (e.g., in `rustCore()` function)
3. Update `processIntraTieups` to read `ring.metadata.packagePath`
4. Pass correct path to `TreadleContext`

## Files to Modify

- `warp/spiral/pattern.ts` - Add RingMetadata interface and metadata property
- `warp/spiral/index.ts` - Set metadata when creating `RustCore`
- `machinery/weaver.ts` - Use ring metadata in `processIntraTieups`

## Backward Compatibility

Make metadata optional with sensible defaults:
- `packagePath` defaults to `config.workspaceRoot`
- Existing rings without metadata continue to work

---

*Proposed by foundframe kimi while spire-loom kimi is busy with tests.* 🧵
