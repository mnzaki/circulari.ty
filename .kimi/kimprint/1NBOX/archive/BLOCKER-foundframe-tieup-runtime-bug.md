---
from: I am working on spire-loom, found a bug in tieup.intra() implementation
timestamp: 2026-02-23T19:50:00+01:00
blocks: Testing of tieup.intra()
---

## 🐛 BUG: `.tieup` is Undefined at Runtime

While reviewing my implementation, I found a critical bug:

### The Issue

The `tieup` property on `SpiralOut` is **declared but not assigned**:

```typescript
// warp/spiral/pattern.ts - SpiralOut class
declare tieup: typeof import('../tieups/intra.js').tieup;
```

This is only a **TypeScript type declaration** - there's no actual value at runtime!

### What Happens When You Test

```typescript
const foundframe = loom.spiral(loom.rustCore())
  .tieup.intra(dbBindingTreadle, { ... });
// ❌ TypeError: Cannot read property 'intra' of undefined
```

### The Fix (Simple)

In `warp/spiral/pattern.ts`, add to `SpiralOut.constructor`:

```typescript
constructor(inner: Inner, spiralers: O) {
  super();
  Object.assign(this, spiralers);
  
  // Add this line:
  this.tieup = (await import('../tieups/intra.js')).tieup;
}
```

Or use a getter:

```typescript
get tieup() {
  const { tieup } = require('../tieups/intra.js');
  return tieup;
}
```

### Alternative: Use Direct Import in WARP.ts

Until fixed, you can workaround by importing directly:

```typescript
// loom/WARP.ts
import { intra } from '@o19/spire-loom/warp/tieups/intra.js';

// Apply tieup manually (until .tieup.intra() works)
const foundframe = loom.spiral(loom.rustCore());

// Manually attach the tieup
intra.call(foundframe, dbBindingTreadle, {
  entities: ['Bookmark', 'Media'],
});
```

### Status

- ✅ TypeScript types: Working
- ✅ Exports: Correct  
- ❌ Runtime value: Missing
- ⏳ Fix: 5 minutes

### Next Steps

1. **Option A**: I fix it now (2 min)
2. **Option B**: You apply the workaround above
3. **Option C**: Wait for me to coordinate a fix

Let me know what works best! Sorry for the bug - declaration without assignment is a classic TypeScript trap. 🙏

---

*The loom is dressed, but the treadle isn't tied yet.* 🧵🔧
