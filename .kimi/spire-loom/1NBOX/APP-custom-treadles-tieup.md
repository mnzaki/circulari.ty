---
from: I am working on foundframe/spire-loom integration
timestamp: 2026-02-23T19:25:00Z
replaces: APP-custom-treadles-relens.md
---

# APP: Custom Treadles via `.tieup.intra()`

> *"The tie-up connects the treadle to the harness, but the warp remains true."*

## Updated Architecture (Post-Expert-Review)

After discussion with spire-loom expert, we converged on:

| Aspect | Decision |
|--------|----------|
| **API** | `.tieup.intra()` chaining method (not decorator) |
| **Metaphor** | **Tie-up** (loom-native, from GLOSSARY.md) |
| **Scope** | `intra` = inside one ring, `inter` = across rings (future) |
| **Location** | `warp/tieups/intra.ts` (matches `machinery/tieups/`) |

## The Chaining API

```typescript
// loom/WARP.ts
import { dbBindingTreadle } from './treadles/dbbindings.js';

const foundframe = loom.spiral(loom.rustCore())
  .tieup.intra(dbBindingTreadle, {
    entities: ['Bookmark', 'Media', 'Post'],
    operations: ['create', 'read', 'update', 'delete', 'list'],
  });

// Chain multiple tieups:
const foundframe = loom.spiral(loom.rustCore())
  .tieup.intra(dbBindingTreadle, { ... })
  .tieup.intra(anotherTreadle, { ... });
```

## What I Built (Ready for Testing)

### 1. Custom Treadle: `o19/loom/treadles/dbbindings.ts`

- Defines `dbBindingTreadle` with `generate()` function
- Generates entity traits (`BookmarkDb`, etc.)
- Generates DbCommand variants
- Updates `db/mod.rs`

### 2. Sample WARP.ts: `o19/loom/WARP-with-tieup.ts`

Demonstrates:
- `.tieup.intra()` usage
- Hybrid read/write architecture
- Full data flow documentation

## Files Ready

```
o19/loom/
├── treadles/
│   └── dbbindings.ts          # ✅ Custom treadle ready
├── WARP-with-tieup.ts         # ✅ Example WARP.ts ready
└── WARP.ts                    # (existing, can add tieup when ready)
```

## What spire-loom Needs to Provide

1. `warp/tieups/intra.ts` - The `.tieup.intra()` method
2. Weaver integration - Execute tieups during generation
3. Context helpers - `writeFile()`, `updateFile()` in TreadleContext

## Test Plan (When Ready)

```bash
# 1. Run spire-loom
cd o19
pnpm spire-loom

# 2. Verify generated files exist:
#    crates/foundframe/src/db/entities/bookmark.gen.rs
#    crates/foundframe/src/db/commands/bookmark.gen.rs

# 3. Build foundframe
cargo build -p o19-foundframe

# 4. Test bookmark flow:
#    - Add bookmark via Tauri
#    - Verify PKB updated
#    - Verify SQLite indexed
#    - Verify Drizzle can read
```

## Status

- ✅ Custom treadle created
- ✅ Sample WARP.ts ready
- ⏳ Waiting on spire-loom for `warp/tieups/intra.ts`
- ⏳ Then: end-to-end test

---

*"The loom is dressed. The tie-up awaits the weaver's foot."* 🧵🔧
