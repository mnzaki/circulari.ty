# DeferredValue Experiment Summary

## Project Goal

Extract a **reusable abstraction** from spire-loom's Diviner/Postrequisite pattern — a promise-like container that:

1. ✅ Returns **stub values immediately** for template rendering
2. ✅ Provides a **lazy query API** like BoundQuery  
3. ✅ Has a **`runPass()` method** with feedback on convergence
4. ✅ Is **configurable** for what stub values to return

## What Was Built

### Core Files

```
deferred-value/
├── deferred-value.ts       # Core implementation (~340 lines)
├── deferred-value.test.ts  # Comprehensive tests (~370 lines)
├── README.md               # Usage documentation
├── package.json            # Package configuration
└── SUMMARY.md              # This file
```

### Key Classes

| Class | Purpose | Lines |
|-------|---------|-------|
| `DeferredValue<T, S>` | Promise-like container with two-phase computation | ~180 |
| `DeferredQuery<T>` | Lazy query API with chainable filters/transforms | ~150 |

### Factory Functions

| Function | Use Case |
|----------|----------|
| `defer<T, S>()` | Full control over computation |
| `deferCollection<T>()` | Collect items over multiple passes |
| `deferTransform<T, U>()` | Transform source over passes |

## Architecture Comparison

### Spire-Loom Diviner Pattern

```typescript
// Source: machinery/reed/postrequisites.ts

// Two-phase lifecycle
interface InstantiatedDiviner<A> {
  initAccumulator(items, lang): void;  // Phase 1
  applyWrappers(items): void;           // Phase 2
}

// Accumulator extends BoundQuery
abstract class PostrequisiteAccumulator extends LanguageThing {
  _stage: 'collecting' | 'rendering';
  toString(): string;  // Phase 1: placeholder, Phase 2: content
}

// Usage in templates
{{ methods.imports }}  // Stub → Actual
```

### DeferredValue Abstraction

```typescript
// Source: deferred-value.ts

// Simplified two-phase lifecycle
class DeferredValue<T, S> {
  private stage: 'collecting' | 'rendering';
  
  get value(): T | S;     // Phase 1: stub, Phase 2: actual
  toString(): string;     // Phase 1: placeholder, Phase 2: content
  runPass(): { complete, needsAnotherPass };  // Run one pass
  
  get query(): DeferredQuery<T>;  // Lazy query API
}

// Query API
class DeferredQuery<T> {
  filter(predicate): DeferredQuery<T>;
  map(fn): DeferredQuery<U>;
  get all(): T[];  // Terminal - triggers evaluation
}
```

### Key Differences

| Aspect | Spire-Loom Diviner | DeferredValue |
|--------|-------------------|---------------|
| Dependencies | Spire-loom, language system | None (standalone) |
| Property wrapping | Yes (via defineProperty) | No (simpler) |
| Template integration | Deep (mejs/EJS) | Manual |
| Use case | Code generation | General purpose |
| Bundle size | Part of larger system | ~500 lines standalone |

## Test Coverage

```
✅ Phase 1: Collecting
   - Returns stub value
   - toString returns placeholder
   - Query returns empty

✅ Phase 2: Rendering  
   - Returns actual value
   - Multi-pass computation
   - Callbacks (onComplete, onPass)
   - maxPasses limit

✅ Query API
   - filter()
   - map()
   - Chaining
   - Terminals (all, first, count, hasAny)
   - Search (find, some, every)
   - Iteration protocol

✅ Factory Functions
   - defer()
   - deferCollection()
   - deferTransform()

✅ Real-World Scenarios
   - Template rendering simulation
   - Imports collection (spire-loom-like)
```

## The Core Abstraction

The pattern extracted from spire-loom can be summarized as:

```
┌──────────────────────────────────────────────────────────────┐
│  DEFERRED VALUE PATTERN                                      │
│  ─────────────────────                                       │
│                                                              │
│  1. START with a STUB value (template-friendly)             │
│                                                              │
│  2. COLLECT data through:                                    │
│     - Property interception (diviners)                       │
│     - Explicit accumulation (deferred-value)                 │
│                                                              │
│  3. MULTI-PASS computation:                                  │
│     - Each pass can refine the value                         │
│     - Feedback: "need another pass?"                         │
│     - Convergence criteria (maxPasses, stable)               │
│                                                              │
│  4. QUERY the eventual value:                                │
│     - Lazy evaluation (only compute when needed)             │
│     - Chainable filters/transforms                           │
│     - Cached results                                         │
│                                                              │
│  5. RENDER actual value:                                     │
│     - toString() switches behavior                           │
│     - Template re-renders                                    │
│     - Query returns actual data                              │
└──────────────────────────────────────────────────────────────┘
```

## Use Cases

### 1. Code Generation (Original)

```typescript
// Collect imports from method signatures
const imports = deferCollection<Import>({
  stub: '{{ IMPORTS }}',
  collect: (existing, pass) => {
    // Pass 1: Scan methods, collect return types
    // Pass 2: Deduplicate, sort
    return { items: imports, done: pass >= 2 };
  }
});

// Template: {{ imports }} → placeholder
// After computation: {{ imports }} → actual imports
```

### 2. Circular Dependency Resolution

```typescript
// Resolve forward references in a schema
const schema = defer<Schema>({
  stub: { types: [] },
  maxPasses: 10,
  compute: (prev, pass) => {
    // Pass 1: Collect type definitions
    // Pass 2: Resolve field references  
    // Pass N: Stabilize
    return { value: schema, needsAnotherPass: !isStable };
  }
});
```

### 3. Incremental Computation

```typescript
// Only recompute what changed
const computed = deferTransform({
  source: () => getSourceData(),
  stub: 'computing...',
  transform: (src, prev, pass) => {
    // Check delta from previous
    // Only recompute changed branches
    return { value: result, done: delta.isEmpty };
  }
});
```

## Relationship to BAA

This experiment demonstrates the **Barn Architecture Academy** approach:

1. **Study existing patterns** in spire-loom
2. **Extract the essence** into a standalone abstraction
3. **Document the learnings** in lessons/
4. **Build working code** in experiments/
5. **Share knowledge** through clear documentation

## Next Steps

### For This Experiment

1. **Add TypeScript declarations** for better DX
2. **Benchmark performance** vs naive approaches
3. **Add more examples**: schema validation, build systems
4. **Consider async variant** for I/O bound operations

### For Spire-Loom Integration

1. **Evaluate** if DeferredValue can simplify existing Diviners
2. **Consider** extracting BoundQuery as standalone package
3. **Document** the two-phase pattern more prominently

### For BAA

1. **More lessons** on patterns from spire-loom
2. **Compare** with similar patterns in other systems
3. **Build** more experiments demonstrating variations

## References

### Source Material

- `o19/packages/spire-loom/machinery/reed/postrequisites.ts` (471 lines)
- `o19/packages/spire-loom/machinery/sley/query.ts` (561 lines)
- `o19/packages/spire-loom/tests/postrequisite-diviners.test.ts` (342 lines)
- `o19/.kimi/spire-loom/1NBOX/archive/APP-001-multi-stage-postrequisite-diviners.md`

### BAA Artifacts

- `lessons/the-diviner-pattern/LESSON.md` - Full architecture deep-dive
- `experiments/deferred-value/` - This experiment

## Conclusion

The DeferredValue pattern successfully **extracts and generalizes** the core insight from spire-loom's Diviners: a **promise-like container for multi-pass computation** with a **lazy query API**. 

While spire-loom's implementation is deeply integrated with its template system and property-wrapping mechanisms, this standalone version provides a **reusable, well-tested abstraction** suitable for:

- Code generation tools
- Build systems  
- Schema compilers
- Any system needing multi-pass convergence

The pattern embodies the **spire-loom philosophy**: *render with what you have, collect what you need, converge through iteration.*

---

*"The diviner looks forward from the past, collecting what will be needed, rendering only when the moment is right."*

*Experiment completed in BAA* 🌀
