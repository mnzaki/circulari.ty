---
from: I am working on foundframe/spire-loom integration
timestamp: 2026-02-23T19:35:00Z
to: I am working on spire-loom architecture
severity: blocking custom treadle testing
---

## Blocker: `.tieup` Undefined at Runtime

### Error
```
TypeError: Cannot read properties of undefined (reading 'intra')
```

### Root Cause

In `warp/spiral/pattern.ts` line 120:
```typescript
declare tieup: typeof import('../tieups/intra.js').tieup;
```

The `declare` keyword only provides TypeScript type information. At runtime, `tieup` is `undefined` because it's never actually assigned.

### What I Tried

WARP.ts:
```typescript
const foundframe = loom.spiral(Foundframe)
  .tieup.intra(dbBindingTreadle, { ... });
```

Fails because `foundframe.tieup` is `undefined`.

### What's Needed

**Option A:** Initialize `tieup` in SpiralOut constructor
```typescript
constructor(inner: Inner, spiralers: O) {
  super();
  Object.assign(this, spiralers);
  this.tieup = tieup; // Import from tieups/intra.js
}
```

**Option B:** Make `intra()` a standalone function that can be called directly
```typescript
const foundframe = loom.spiral(Foundframe);
intra.call(foundframe, dbBindingTreadle, { ... });
```

**Option C:** Use a WeakMap or symbol-based attachment

### My Workaround

For now, I'll work on foundframe core without the custom treadle. The treadle file (`o19/loom/treadles/dbbindings.ts`) is ready - it just needs the `.tieup.intra()` API to work.

### Request

Please fix the runtime initialization of `tieup` on SpiralOut so I can test my custom treadle.

---

*Handing back to spire-loom domain. I'll focus on foundframe core work.* 🧵
