# Divination Engine Prototype 🌀

A working demonstration of round-based lazy computation with mejs template integration, created for the Barn Architecture Academy.

## Overview

This prototype brings together two concepts from parallel spiral sessions:

1. **The Diviner Pattern** (keeper's formalization): Two-phase lazy computation with quoting
2. **The Divination Engine** (Communique #001): Round-based discovered computation

### Key Innovation

> "Program as structure, execution as filling."

The number of rounds isn't predetermined—it emerges from the dependency graph. Each round:
1. **Identifies** ripe SourceStubs (no unmet dependencies)
2. **Materializes** them in parallel
3. **Evaluates** transforms that can now resolve
4. **Compresses** the graph

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 0: Computation Graph                                 │
│  - SourceStub: Needs external resolution                    │
│  - Transform: Pure function of deps                         │
│  - QuotableStub: Template-integrated stub                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Solver                                            │
│  - Discovers rounds from dependency graph                   │
│  - Materializes ripe stubs in parallel                      │
│  - Yields progress via AsyncGenerator                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: mejs Integration                                  │
│  - Quotable stubs render as {{...}} placeholders            │
│  - Template re-renders until no placeholders remain         │
│  - Multi-pass resolution with progress tracking             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Basic Usage

```typescript
import { createDivination, source, transform, quotable } from './index.js';

// Create a divination (structure, not execution)
const divination = createDivination(({ source, transform, quotable }) => {
  // Round 1: Source stubs (no dependencies = ripe immediately)
  const user = source('user', [], async () => {
    return await db.users.findById('123');
  });
  
  const posts = source('posts', [user], async (u) => {
    return await db.posts.where({ author: u.id });
  });
  
  // Round 2: Transform
  const stats = transform([posts], (p) => ({
    count: p.length,
    latest: p[0]
  }));
  
  // Make quotable for template integration
  return quotable(stats, 1);
});

// Resolve (runs solver)
const result = await divination.resolve();
console.log(result); // { count: 5, latest: {...} }
```

### With Templates

```typescript
import { renderWithDivination } from './index.js';

const template = `
# User Dashboard

Total posts: {{ stats.count }}
Latest: {{ stats.latest.title }}
`;

const output = await renderWithDivination({
  template,
  context: { stats: divination.root },
  maxPasses: 5
});
```

### Watching Progress

```typescript
for await (const round of divination.watch()) {
  console.log(`Round ${round.round}: ${round.materialized.size} resolved`);
  if (round.value) {
    console.log('Current value:', round.value);
  }
}
```

## The Imports Diviner Example

A complete example mirroring spire-loom's imports diviner:

```typescript
import { createImportsDivination } from './index.js';

const methods = [
  { name: 'getUser', returnType: { name: 'User', isEntity: true } },
  { name: 'createPost', returnType: { name: 'Post', isEntity: true } },
  { name: 'getString', returnType: { name: 'string', isEntity: false } }
];

const importsDiv = createImportsDivination(methods);

// Discovered rounds:
// Round 1: Collect entity return types (User, Post)
// Round 2: Deduplicate (User appears once even if multiple methods return it)
// Round 3: Group by path
// Round 4: Render import statements

const result = await importsDiv.resolve();
// Output:
// import { User, Post } from "./entities/User";
```

## Quoting Mechanism

The key to template integration is the **quotable stub**:

```typescript
const stub = quotable(innerStub, depth);

// Phase 1 (quoted): toString() returns placeholder
stub.toString(); // "{{ __diviner_resolve_stub_123 }}"

// Phase 2 (resolved): expand() returns actual value
stub.expand(); // "import { User } from ..."
```

The template engine:
1. Renders with quotable stubs → output contains placeholders
2. Runs solver to resolve stubs
3. Re-renders with resolved values
4. Repeats until no placeholders remain

## Running the Prototype

```bash
# From the spire-loom package directory
cd /home/mnzaki/Projects/circulari.ty/o19/packages/spire-loom

# Run tests
vitest run prototype/test.ts

# Run demo
node --loader ts-node/esm prototype/example-imports-diviner.ts
```

## Integration with Spire-Loom

This prototype demonstrates concepts that can be integrated into spire-loom:

| Spire-Loom | Divination Engine |
|------------|-------------------|
| `PostrequisiteAccumulator` | `Divination` with round-based solver |
| `_stage: 'collecting' \| 'rendering'` | `quotable()` with configurable depth |
| `toString()` placeholder | `{{ __diviner_resolve_* }}` |
| `render()` finisher | External renderer with compiled language methods |
| Two-phase | N rounds discovered by solver |

## Connection to Communique #001

This prototype implements the **Divination Engine** described in Communique #001:

- ✅ **SourceStub**: Lazy construction of backing calls
- ✅ **Round discovery**: Solver determines rounds from dependency graph
- ✅ **Parallel materialization**: Ripe stubs execute in parallel
- ✅ **Fractal nesting**: Divinations can contain other divinations
- ✅ **AAAArchi validation**: DAG structure validated at each round

## The Aesthetic

> "The diviner looks forward from the past, collecting what will be needed.
> The engine discovers how many times it must look.
> The spiral determines its own depth."

This is not Promise. This is not async/await. This is **dataflow programming** where:

1. Structure is described (the divination)
2. Dependencies are tracked (implicitly via stubs)
3. Execution is discovered (solver determines rounds)
4. Correctness is validated (DAG structure enforced)

## License

Part of the circulari.ty project. See project root for license.
