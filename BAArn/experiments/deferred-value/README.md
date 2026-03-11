# DeferredValue Experiment 🌀

> *"The value that will be, queried as if it already is."*

## Overview

This experiment explores a **promise-like container abstraction** extracted from spire-loom's Diviner/Postrequisite pattern. It provides:

1. **Two-phase computation**: Stub values in Phase 1, actual values in Phase 2
2. **Lazy query API**: BoundQuery-like chaining for the eventual value
3. **Multi-pass convergence**: Computation can require multiple passes to stabilize
4. **Template-friendly**: Designed for code generation scenarios

## The Core Problem

In code generation (like spire-loom), we often encounter **postrequisites** — things we need to know *after* we've started rendering:

```
Rendering a file → Discover we need imports → But imports go at the top!
```

Traditional approaches:
- **Two-pass rendering**: Render twice, but loses context between passes
- **Pre-analysis**: Analyze before rendering, but requires duplicating logic
- **Promises**: Async doesn't fit synchronous template rendering

The **DeferredValue** pattern: Render with stubs → Collect data → Re-render with actuals

## Quick Example

```typescript
import { defer, deferCollection } from './deferred-value.js';

// Create a deferred value
const imports = deferCollection<Import>({
  stub: '// {{ IMPORTS }}',
  collect: (existing, pass) => {
    if (pass === 1) {
      // Collect from methods
      return {
        items: methods.map(m => ({
          name: m.returnType,
          path: `./entities/${m.returnType}`
        })),
        done: false
      };
    }
    // Pass 2: deduplicate and finalize
    return {
      items: deduplicate(existing),
      done: true
    };
  }
});

// Phase 1: Template renders with stub
console.log(`import { SomeThing } from './somewhere';
${imports.value}  // outputs: // {{ IMPORTS }}

export function foo() {}
`);

// Phase 2: Compute and re-render
imports.runToCompletion();
console.log(`import { SomeThing } from './somewhere';
${imports.query.map(i => `import { ${i.name} } from '${i.path}';`).all.join('\n')}

export function foo() {}
`);
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  DeferredValue<T, S>                                        │
│  ───────────────────                                        │
│  • stage: 'collecting' | 'rendering'                        │
│  • value: T | S (stub in Phase 1, actual in Phase 2)        │
│  • query: DeferredQuery<T> (lazy query API)                 │
│  • runPass(): Run one computation pass                      │
│  • runToCompletion(): Run until stable                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  DeferredQuery<T>                                           │
│  ─────────────────                                          │
│  • filter(predicate): Chainable filter                      │
│  • map(fn): Chainable transform                             │
│  • all, first, count: Terminal operations                   │
│  • find, some, every: Search operations                     │
│  • [Symbol.iterator]: Iterable protocol                     │
└─────────────────────────────────────────────────────────────┘
```

## API Reference

### `defer<T, S>(config)`

Create a DeferredValue with full control over computation.

```typescript
const dv = defer<number, string>({
  stub: 'computing...',
  maxPasses: 5,
  compute: (previous, pass) => {
    // Return current value and whether we need another pass
    return {
      value: previous ? previous + 1 : 0,
      needsAnotherPass: pass < 3
    };
  },
  onPass: (pass, result) => console.log(`Pass ${pass}: ${result.value}`),
  onComplete: (value, passes) => console.log(`Done in ${passes} passes: ${value}`)
});
```

### `deferCollection<T>(config)`

Specialized for collecting items over multiple passes (like imports).

```typescript
const dv = deferCollection<Import>({
  stub: '// {{ IMPORTS }}',
  collect: (existing, pass) => {
    // Collect more items
    return { items: [...existing, newItem], done: pass >= 2 };
  }
});
```

### `deferTransform<T, U>(config)`

Transform a source value over multiple passes.

```typescript
const dv = deferTransform({
  source: () => rawData,
  stub: 'processing...',
  transform: (source, previous, pass) => {
    return { value: transform(source), done: isValid(transformed) };
  }
});
```

## Comparison with Similar Patterns

| Pattern | DeferredValue | Promise | Observable | Lazy<T>
|---------|--------------|---------|------------|---------|
| Sync/Async | Sync | Async | Async | Sync |
| Multi-pass | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Query API | ✅ Yes | ❌ No | ❌ No | ⚠️ Limited |
| Template stubs | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Re-computation | ✅ Controlled | ❌ No | ✅ Continuous | ⚠️ Once |

## Relationship to Spire-Loom

This abstraction is **extracted from** the Diviner pattern in spire-loom:

```
spire-loom Diviner Pattern
    │
    ├── PostrequisiteAccumulator (base class)
    │   ├── ImportsAccumulator (collect imports)
    │   └── FilesAccumulator (collect file specs)
    │
    └── BoundQuery (lazy query API)

DeferredValue (this experiment)
    │
    ├── Generalizes the two-phase pattern
    ├── Simplifies for standalone use
    └── Keeps the lazy query API
```

Key differences:
- **Spire-loom Diviners**: Integrated with template system, property wrapping, language definitions
- **DeferredValue**: Standalone, reusable, no dependencies on spire-loom

## Potential Applications

1. **Multi-pass compilers**: Resolve forward references, circular dependencies
2. **Incremental builds**: Track what changed, only recompute what's needed
3. **Template engines**: Handle postrequisites in code generation
4. **Configuration systems**: Values that depend on other values being resolved first
5. **Data pipelines**: Transformations that need multiple passes to converge

## Files

- `deferred-value.ts` - Core implementation
- `deferred-value.test.ts` - Comprehensive tests
- `README.md` - This file

## Running Tests

```bash
# From experiment directory
npm test

# Or with vitest directly
npx vitest run deferred-value.test.ts
```

## Future Directions

1. **Computed dependencies**: Automatic dependency tracking between DeferredValues
2. **Incremental updates**: Only recompute changed branches
3. **Async support**: Optional async computation for I/O bound operations
4. **Visualization**: Debug view of computation graph
5. **Integration**: Bindings for popular template engines

---

*"The diviner looks forward from the past, collecting what will be needed, rendering only when the moment is right."*
