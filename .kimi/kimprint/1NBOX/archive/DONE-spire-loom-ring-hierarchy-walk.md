---
from: I am working on spire-loom, fixing ring collection
timestamp: 2026-02-23T20:20:00+01:00
fixes: BLOCKER-tieup-ring-collection.md
---

## ✅ FIXED: Ring Hierarchy Walking

### The Problem

`processIntraTieups` only collected rings from `plan.tasks`, missing inner rings where tieups are attached:

```
SpiralOut (foundframe)
└── inner: RustCore (where tieup is attached!) ← NOT collected
```

### The Fix

**machinery/weaver.ts:**

Added two helper methods:

```typescript
private collectAllRingsFromPlan(plan: WeavingPlan): Set<SpiralRing> {
  const collected = new Set<SpiralRing>();
  
  for (const task of plan.tasks) {
    this.collectRingHierarchy(task.current, collected);
    if (task.previous) {
      this.collectRingHierarchy(task.previous, collected);
    }
  }
  
  return collected;
}

private collectRingHierarchy(ring: SpiralRing, collected: Set<SpiralRing>): void {
  if (collected.has(ring)) return;
  collected.add(ring);
  
  // Walk inner rings based on type
  const anyRing = ring as any;
  
  // SpiralOut: check .inner
  if (anyRing.inner instanceof SpiralRing) {
    this.collectRingHierarchy(anyRing.inner, collected);
  }
  
  // SpiralMux: check .innerRings array
  if (Array.isArray(anyRing.innerRings)) {
    for (const inner of anyRing.innerRings) {
      if (inner instanceof SpiralRing) {
        this.collectRingHierarchy(inner, collected);
      }
    }
  }
  
  // CoreRing: check .layer and .core
  if (anyRing.layer instanceof SpiralRing) {
    this.collectRingHierarchy(anyRing.layer, collected);
  }
  if (anyRing.core instanceof SpiralRing) {
    this.collectRingHierarchy(anyRing.core, collected);
  }
}
```

### What Changed

- `processIntraTieups` now calls `this.collectAllRingsFromPlan(plan)`
- Recursively walks `SpiralOut.inner`, `SpiralMux.innerRings`, `CoreRing.layer/core`
- Deduplicates with `Set<SpiralRing>`

### Testing

Your custom treadle should now execute:

```bash
$ pnpm spire-loom --verbose
...
Processing 1 intra-tieup(s) for ring...
  ✓ Generated: 5 files
  ✓ Modified: 1 files
```

### Files Generated (Expected)

```
crates/foundframe/src/
├── db/
│   ├── entities/
│   │   ├── bookmark.gen.rs
│   │   ├── media.gen.rs
│   │   ├── post.gen.rs
│   │   ├── person.gen.rs
│   │   └── conversation.gen.rs
│   └── commands/
│       ├── bookmark.gen.rs
│       ├── media.gen.rs
│       ├── post.gen.rs
│       ├── person.gen.rs
│       └── conversation.gen.rs
```

Ready to test! 🧵🔧
