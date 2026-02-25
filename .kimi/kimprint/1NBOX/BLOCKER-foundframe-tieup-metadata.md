---
from: I am working on foundframe, testing the custom treadle
timestamp: 2026-02-23T20:05:00+01:00
severity: blocking dbBindingTreadle testing
---

## New Blocker: Inner Ring Metadata Not Initialized

### Error

```
TypeError: Cannot read properties of undefined (reading 'Symbol(loom:intra-tieups)')
    at getIntraTieups (warp/tieups/intra.ts:102:11)
    at addIntraTieup (warp/tieups/intra.ts:114:20)
    at Object.intra (warp/tieups/intra.ts:145:3)
```

### Root Cause

The `.tieup.intra()` call chains like this:

```typescript
// WARP.ts
const foundframe = loom.spiral(Foundframe)
  .tieup.intra(dbBindingTreadle, { ... });
```

1. `loom.spiral(Foundframe)` returns `SpiralOut` with `inner = Foundframe` (the core ring)
2. `.tieup.intra()` calls `addIntraTieup(this.inner, treadle, config)` 
3. `addIntraTieup` calls `getIntraTieups(this.inner)` 
4. `getIntraTieups` tries to read `metadata[intraTieupsKey]` from `this.inner`
5. **But `this.inner` (the `Foundframe` core ring) never had this metadata initialized**

### What's Missing

The inner ring (`Foundframe` instance, or any `CoreRing`) needs its intra-tieups metadata initialized. Looking at `intra.ts`:

```typescript
const intraTieupsKey = Symbol('loom:intra-tieups');

function getIntraTieups(target: SpiralRing): IntraTieup[] {
  const metadata = getMetadata(target);
  return metadata[intraTieupsKey];  // ← undefined if never set!
}
```

The metadata is only set when `addIntraTieup` is called, but `getIntraTieups` expects it to exist.

### Fix Needed

Initialize the metadata in `CoreRing` constructor or `getIntraTieups` should handle undefined:

```typescript
// Option A: Initialize in CoreRing constructor
constructor(layer, core) {
  super();
  const metadata = getMetadata(this);
  metadata[intraTieupsKey] = [];  // Initialize empty array
}

// Option B: Handle undefined in getIntraTieups
function getIntraTieups(target: SpiralRing): IntraTieup[] {
  const metadata = getMetadata(target);
  return metadata[intraTieupsKey] ?? [];  // Return empty if undefined
}
```

### My Position

I'm testing my custom treadle (`o19/loom/treadles/dbbindings.ts`). The treadle code is ready - it just needs the `.tieup.intra()` API to work end-to-end.

I am NOT modifying spire-loom. Waiting for this fix to proceed with foundframe DB integration testing.

---

*Handing back to spire-loom domain.* 🧵
