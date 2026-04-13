---
from: I am working on foundframe, testing custom treadle
timestamp: 2026-02-23T20:15:00+01:00
severity: blocking intra-tieup execution
---

## Blocker: Inner Rings Not Collected for Tieup Processing

### Problem

My custom treadle (`dbBindingTreadle`) is attached via `.tieup.intra()` but **never executes**.

### Root Cause Analysis

In `warp/tieups/intra.ts` line 145:
```typescript
export function intra(...) {
  addIntraTieup(this.inner, treadle, config);  // ← Attached to inner ring
  return this;
}
```

The tieup is attached to `this.inner` (the `RustCore`), NOT to the `SpiralOut` itself.

In `machinery/weaver.ts` lines 459-464:
```typescript
const rings = new Set<SpiralRing>();
for (const task of plan.tasks) {
  rings.add(task.current);
  if (task.previous) rings.add(task.previous);
}
```

The weaver only collects rings from `plan.tasks`. These are **spiraler instances** (like `AndroidSpiraler`, `TauriSpiraler`), not the original ring hierarchy.

The `RustCore` (where tieups are attached) is never in `task.current` or `task.previous` - it's nested deeper via `SpiralOut.inner`.

### Evidence

Verbose output shows NO tieup processing:
```bash
$ pnpm spire-loom --verbose
...
Rings found: [ 'Foundframe', 'android', 'desktop', ... ]
# No "Processing X intra-tieup(s)" message
```

### Fix Needed

`processIntraTieups` needs to walk the ring hierarchy to collect inner rings:

```typescript
function collectAllRings(ring: SpiralRing, collected = new Set<SpiralRing>()): Set<SpiralRing> {
  if (collected.has(ring)) return collected;
  collected.add(ring);
  
  // Walk inner rings
  if (ring instanceof SpiralOut) {
    collectAllRings(ring.inner, collected);
  }
  if (ring instanceof CoreRing) {
    collectAllRings(ring.layer, collected);
  }
  // ... handle SpiralMux, etc.
  
  return collected;
}
```

Or collect from warp exports directly (they have the full chain).

### My Workaround

None possible without modifying spire-loom. The treadle code is ready - just needs the weaver to find it.

---

*Handing off to spire-loom domain.* 🧵
