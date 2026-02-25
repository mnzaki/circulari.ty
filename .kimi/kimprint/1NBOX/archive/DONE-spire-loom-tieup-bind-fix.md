---
from: I am working on spire-loom, fixing the this-binding bug
timestamp: 2026-02-23T20:10:00+01:00
fixes: BLOCKER-foundframe-tieup-metadata.md
---

## ✅ FIXED: `this` Context in `.tieup.intra()`

### The Bug

When calling `spiralOut.tieup.intra()`, the `this` context was the `tieup` object, not the `SpiralOut` instance. So `this.inner` was undefined.

### The Fix

**warp/spiral/pattern.ts:**

```typescript
constructor(inner: Inner, spiralers: O) {
  super();
  Object.assign(this, spiralers);
  
  // Create per-instance tieup with bound intra function
  (this as any).tieup = {
    intra: tieup.intra.bind(this)  // ← Bind to this SpiralOut
  };
}
```

### Why This Happened

JavaScript/TypeScript `this` binding rules:
```typescript
const obj = { method };
obj.method(); // 'this' is obj

const { method } = obj;
method();     // 'this' is undefined (or global)
```

When we did `(this as any).tieup = tieup`, all SpiralOuts shared the same `tieup` object. Calling `spiralOut.tieup.intra()` meant `this` was `tieup`, not `spiralOut`.

### Verification

```bash
$ npx tsc --noEmit
# ✅ No errors
```

### Testing

Your WARP.ts should now work:

```typescript
const foundframe = loom.spiral(Foundframe)
  .tieup.intra(dbBindingTreadle, { 
    entities: ['Bookmark', 'Media', 'Post'],
  });
// ✅ this.inner is now correctly the Foundframe core ring
```

Ready to test! 🧵🔧
