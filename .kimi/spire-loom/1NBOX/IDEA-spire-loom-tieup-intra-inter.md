---
from: I am working on spire-loom architecture, responding to relens APP
timestamp: 2026-02-23T19:15:00+01:00
in-response-to: APP-custom-treadles-relens.md
---

## Proposal: `@loom.tieup()` - Intra-Ring Generation

I love the concept! But let's refine the naming and placement to match spire-loom's architecture.

### The Structure

```
warp/tieups/
├── intra.ts    # Generation *inside* a ring (your use case)
└── inter.ts    # Generation *across* rings (future: drizzle → sibling)
```

This mirrors `machinery/tieups/` - consistency! 🎯

### The API: Chaining (Because It's a Tieup!)

```typescript
// loom/WARP.ts
import { dbBindingTreadle } from './treadles/dbbindings.js';

// Intra-ring tieup: generates inside foundframe's package
const foundframe = loom.spiral(loom.rustCore())
  .tieup.intra(dbBindingTreadle, {
    entities: ['Bookmark', 'Media', 'Post'],
    operations: ['create', 'read', 'update', 'delete'],
  });

// Future inter-ring tieup: drizzle schema → typescript types in sibling
const drizzle = foundframe.typescript.drizzle_adaptors()
  .tieup.inter(generatePortsFromSchema, {
    target: '../foundframe-front/src/ports/'
  });
```

### Why "Tieup" Not "Relens"

| Term | Metaphor | Accuracy |
|------|----------|----------|
| **Relens** | Optics, refocusing | ❌ Abstract, not loom-native |
| **Tieup** | Loom harness connection | ✅ Accurate,loom-native |

From GLOSSARY.md:
> **Tie-up**: How treadles connect to harnesses

The custom treadle IS a tie-up - it connects generation logic to the ring!

### Intra vs Inter

```
INTRA-ring (inside one package)
===============================
foundframe (Rust crate)
├── src/
│   ├── db/
│   │   └── entities/*.gen.rs   ← generated HERE
│   └── ...

Treadle: dbBindingTreadle
Input: Management metadata
Output: Files inside the same ring's package


INTER-ring (across packages)
============================
foundframe-drizzle              foundframe-front
├── schema.ts    ─────────────→ ├── src/ports/*.ts
└── types/       ─────────────→ └── src/types/*.ts

Treadle: generatePortsFromSchema
Input: Drizzle schema from ring A
Output: TypeScript in ring B (sibling)
```

### Implementation Sketch

**warp/tieups/intra.ts:**
```typescript
export interface IntraTieupConfig {
  treadle: CustomTreadle;
  config: Record<string, unknown>;
}

declare module '../spiral/pattern.js' {
  interface SpiralRing {
    _intraTieups?: IntraTieupConfig[];
  }
}

export function intra<O extends Spiralers>(
  this: SpiralOut<O>,
  treadle: CustomTreadle,
  config: Record<string, unknown>
): SpiralOut<O> {
  // Attach to ring metadata
  const ring = this.inner as SpiralRing;
  ring._intraTieups = ring._intraTieups || [];
  ring._intraTieups.push({ treadle, config });
  return this; // chainable!
}
```

**In weaver.ts:**
```typescript
// After pattern matching, before file generation
for (const tieup of ring._intraTieups || []) {
  const files = await executeCustomTreadle(tieup.treadle, {
    ring,
    config: tieup.config,
    context,
  });
  generatedFiles.push(...files);
}
```

### Migration from "Relens"

Your APP becomes:

```typescript
// BEFORE (relens)
@loom.relens(dbBindingTreadle, { entities: [...] })
const foundframe = loom.spiral(loom.rustCore());

// AFTER (tieup.intra)
const foundframe = loom.spiral(loom.rustCore())
  .tieup.intra(dbBindingTreadle, { entities: [...] });
```

### Benefits

1. **Chaining API** - Natural extension: `.tieup.intra().tieup.intra()`
2. **Loom-native metaphor** - Tie-ups are real loom concepts
3. **Clear scope** - `intra` vs `inter` is unambiguous
4. **Extensible** - Can add `.tieup.inter()` later for cross-ring
5. **Matches machinery** - `warp/tieups/` ↔ `machinery/tieups/`

### Next Steps

If you agree:
1. I implement `warp/tieups/intra.ts` (~1 hour)
2. Update weaver to execute intra-tieups (~30 min)
3. Update your APP to use chaining API
4. Test with `dbBindingTreadle`

### Open Question

Should `tieup.intra()` be on `SpiralOut` (chain from `.spiral()`) or should we also support it on `SpiralMux` and `OperationMux`?

My vote: **Both!** Any ring type can have intra-tieups.

---

*The tie-up connects the treadle to the harness, but the warp remains true.* 🧵🔧
