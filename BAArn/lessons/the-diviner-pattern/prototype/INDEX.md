# Divination Engine Prototype Index 🌀

Complete working prototype in BAArn.

## Quick Start

```bash
cd /home/mnzaki/Projects/circulari.ty/o19/packages/spire-loom

# Run the cycle test (recommended first look)
npx tsx ../../BAArn/lessons/the-diviner-pattern/prototype/cycle-test.ts

# Run the QueryableDivination demos
npx tsx ../../BAArn/lessons/the-diviner-pattern/prototype/queryable-example.ts

# Run the v2 shape-driven demos
npx tsx ../../BAArn/lessons/the-diviner-pattern/prototype/example-v2.ts
```

## Files

### Core Architecture

| File | Purpose | Run It |
|------|---------|--------|
| `cycle-test.ts` | **The main test** - BoundQuery with custom QueryableDivination class, watches resolution cycles | ⭐ Start here |
| `queryable-divination.ts` | Core implementation - `QueryableDivination` interface and helpers | Import only |
| `queryable-example.ts` | Full demonstrations of BoundQuery integration | `npx tsx ...` |
| `ARCHITECTURE.md` | Design rationale and migration path | Read |

### v2 Shape-Driven Design

| File | Purpose |
|------|---------|
| `DESIGN-v2.md` | Why we moved from explicit computation to shape-driven |
| `deferred-shape.ts` | Shape analysis and round discovery |
| `divination-provider.ts` | mejs-integrated rendering engine |
| `example-v2.ts` | v2 demos |
| `index-v2.ts` | v2 exports |
| `README-v2.md` | v2 quick reference |

### v1 Explicit Design (for comparison)

| File | Purpose |
|------|---------|
| `divination-engine.ts` | v1 explicit round-based solver |
| `mejs-integration.ts` | v1 mejs placeholder replacement |
| `example-imports-diviner.ts` | v1 imports example |
| `demo.ts` | v1 demos |

## The Cycle Test (Recommended)

```bash
npx tsx ../../BAArn/lessons/the-diviner-pattern/prototype/cycle-test.ts
```

Shows:
1. Creating BoundQuery with custom `ImportDivination` class
2. Synchronous tag filtering (before resolution)
3. **Multi-round resolution** (3 rounds per divination)
4. Value filtering (after resolution)
5. Template rendering with placeholders

Output excerpt:
```
Resolving user-imports:
  [user-imports] Starting resolution...
  [user-imports] Round 1/3
  [user-imports] Round 2/3
  [user-imports] Round 3/3
    [user-imports] Computing...
  [user-imports] Resolution complete: 2 entries
```

## The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  ImportDivination (extends QueryableDivination pattern)     │
│  ├── Queryable interface: lang, tags, cloneWithLang()       │
│  ├── Divination state: resolve(), value, round              │
│  └── Template integration: toString() placeholder           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  BoundQuery<ImportDivination>                               │
│  ├── Synchronous: .tag(), .filter() on metadata             │
│  ├── After resolve: .filter() on .value                     │
│  └── Works with existing spire-loom code!                   │
└─────────────────────────────────────────────────────────────┘
```

## Key Insight

> "The BoundQuery filters what the Divination reveals."

- **BoundQuery**: Synchronous, lazy, composable
- **QueryableDivination**: Async, multi-round, resolvable
- **Integration**: Divination holds computation, Queryable provides metadata

## For Review

The complete prototype demonstrates:

1. ✅ **Custom class** extending QueryableDivination pattern
2. ✅ **BoundQuery integration** - used as source array
3. ✅ **Cycle tracking** - each round printed during resolution
4. ✅ **Tag filtering** - synchronous, no resolution needed
5. ✅ **Value filtering** - works after resolve()
6. ✅ **Placeholder rendering** - toString() returns `{{ ... }}` until resolved

All within BAArn. 🌀
