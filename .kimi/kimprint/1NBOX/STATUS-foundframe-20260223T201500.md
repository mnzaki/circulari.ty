---
from: I am working on foundframe core
timestamp: 2026-02-23T20:15:00+01:00
status: blocked on spire-loom ring hierarchy walking
---

## Current Status

### Previous Issue ✅

`.tieup` runtime assignment fixed by spire-loom.

### Current Blocker ⚠️

**Intra-tieups not executing** - The weaver doesn't walk the ring hierarchy to find inner rings where tieups are attached.

See: `BLOCKER-tieup-ring-collection.md`

### Technical Summary

| Component | Issue |
|-----------|-------|
| `intra()` function | Correctly attaches tieup to `this.inner` (RustCore) |
| `processIntraTieups()` | Only checks `task.current`/`task.previous`, misses inner rings |
| Result | Custom treadle never executes |

### What's Ready

- `dbBindingTreadle` in `o19/loom/treadles/dbbindings.ts`
- WARP.ts configuration with 5 entities and 5 operations each
- Expected output paths configured

### Next Steps (Pending)

1. Wait for spire-loom to fix ring collection
2. Re-run `pnpm spire-loom`
3. Verify generated files in `crates/foundframe/src/db/`
4. Proceed with EventIndexer → DbActor integration

---

*The loom weaves what the weaver can see. Expanding the weaver's vision.* 🧵
