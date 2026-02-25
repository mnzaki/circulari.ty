---
from: I am working on kimprint organizational consolidation - tieup blockers
status: RESOLVED
timestamp: 2026-02-25T06:00:00Z
supersedes:
  - BLOCKER-foundframe-tieup-metadata.md
  - BLOCKER-foundframe-tieup-runtime-bug.md
  - BLOCKER-foundframe-tieup-runtime.md
  - BLOCKER-tieup-ring-collection.md
---

# CONSOLIDATED & RESOLVED: Tieup System Blockers

## Original Blockers (Now Resolved)

The following 4 BLOCKER files are **consolidated here** and marked as **RESOLVED**:

1. **BLOCKER-foundframe-tieup-metadata.md**
   - Issue: Inner ring metadata not initialized
   - Symbol('loom:intra-tieups') undefined at runtime

2. **BLOCKER-foundframe-tieup-runtime-bug.md**
   - Issue: `.tieup` property undefined at runtime
   - TypeError: Cannot read properties of undefined

3. **BLOCKER-foundframe-tieup-runtime.md**
   - Issue: `.tieup` undefined on SpiralOut
   - Declaration without assignment

4. **BLOCKER-tieup-ring-collection.md**
   - Issue: Ring collection affecting intra-tieup execution

## Resolution

**Major milestone achieved (kimprint packet 83053550...):**

> "Fixed spire-loom core architecture - eliminated platform-wrapper abstraction, unified treadle discovery, added patches system"

**Results:**
- ✅ Tauri generator works correctly
- ✅ 31 files generated
- ✅ 43 tests passing
- ✅ Unified tieup system implemented (Layer vs Layering)

## Architectural Changes That Resolved These

1. **Unified Tieup API** (IDEA-tieup-unified-layer-layering.md)
   - Old: `.tieup.intra()` / `.tieup.inter()`
   - New: `.tieup({ treadles })` - single unified method

2. **Layer vs Layering Separation**
   - Layer = Concrete packages (has metadata.packagePath)
   - Layering = Graph connectors (Spiraler, MuxSpiraler)

3. **treadleTag System**
   - Precise treadle matching: `RustAndroidSpiraler.foregroundService`
   - Different methods on same spiraler → different treadles

4. **GeneratorContext Enhancement**
   - Package paths computed by weaver, not treadles
   - Treadles use relative paths

## Migration Path

For foundframe custom treadle testing:

```typescript
// Old API (blocked)
const foundframe = loom.spiral(Foundframe)
  .tieup.intra(dbBindingTreadle, { ... });  // ❌ No longer exists

// New API (working)
const foundframe = loom.spiral(Foundframe)
  .tieup({ 
    treadles: [dbBindingTreadle],
    warpData: { entities: ['Bookmark', 'Media'] }
  });  // ✅ Works!
```

## Files to Archive

The 4 original BLOCKER files should be moved to 1NBOX/archive/ by the consumer (whoever reads and acts on this consolidation).

## Current Status

**SPIRE-LOOM:** Ready for foundframe integration testing  
**FOUNDFRAME:** Can now test custom treadles with working API  
**KIMPRINT:** Monitoring organizational state

---

*Blockers consolidated, architecture clarified, path forward clear.* 🧵✨
