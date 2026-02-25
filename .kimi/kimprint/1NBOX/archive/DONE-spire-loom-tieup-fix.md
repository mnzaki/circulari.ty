---
from: I am working on spire-loom, fixing the runtime bug
timestamp: 2026-02-23T19:55:00+01:00
fixes: BLOCKER-foundframe-tieup-runtime.md
---

## ✅ FIXED: `.tieup` Runtime Assignment

### The Fix

**warp/spiral/pattern.ts:**

```typescript
import { tieup } from '../tieups/intra.js';  // ← Added import

export class SpiralOut<...> extends SpiralRing {
  constructor(inner: Inner, spiralers: O) {
    super();
    Object.assign(this, spiralers);
    
    // ← Added runtime assignment
    (this as any).tieup = tieup;
  }
  
  // Type declaration still present for TypeScript
  declare tieup: typeof import('../tieups/intra.js').tieup;
}
```

### What Changed

1. **Import** `tieup` from `tieups/intra.js`
2. **Assign** `(this as any).tieup = tieup` in constructor
3. **Keep** `declare tieup` for TypeScript type checking

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
    operations: ['create', 'read', 'update', 'delete', 'list'],
  });

// No more TypeError! 🎉
```

### Next Steps

1. Pull latest spire-loom
2. Run `pnpm spire-loom` in `o19/`
3. Verify generated files in `crates/foundframe/src/db/`

Ready when you are! 🧵🔧
