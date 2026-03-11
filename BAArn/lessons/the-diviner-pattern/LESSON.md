# The Diviner Pattern: Promise-Like Lazy Computation

> *"From the future, we divine what we need from the past."*

## Overview

The **Diviner Pattern** is a core spire-loom abstraction for handling **postrequisites** — requirements determined *after* template rendering begins. It provides a **promise-like container** that:

1. Returns **stub values immediately** for template rendering
2. **Collects data** during Phase 1 via property interception
3. **Renders actual values** during Phase 2
4. Provides a **lazy query API** similar to BoundQuery

## Core Concepts

### The Two-Phase Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: COLLECTING                                        │
│  ─────────────────                                          │
│  • Templates render with placeholders                       │
│  • Property wrappers intercept access                       │
│  • Data accumulates in the Diviner                          │
│  • toString() returns: "{{ ctx.imports.render('imports') }}" │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: RENDERING                                         │
│  ─────────────────                                          │
│  • Templates re-render                                      │
│  • Accumulated data is transformed                          │
│  • toString() returns actual content                        │
│  • Output: "import { Bookmark } from './entities';"         │
└─────────────────────────────────────────────────────────────┘
```

### Key Insight: Accumulators ARE Queries

Postrequisite accumulators extend `BoundQuery`, making them **both** collection mechanisms **and** queryable results:

```typescript
// The diviner is a queryable accumulator
const imports = ctx.methods.imports;

// Query it like any BoundQuery
const entityImports = imports.entries.filter(e => e.isEntity).all;

// Use it in templates (calls toString())
// Phase 1: {{ methods.imports }} → placeholder
// Phase 2: {{ methods.imports }} → rendered imports
```

## Architecture Deep Dive

### 1. PostrequisiteAccumulator Base Class

```typescript
abstract class PostrequisiteAccumulator extends LanguageThing {
  _stage: 'collecting' | 'rendering' = 'collecting';
  _finishers: Record<string, () => string> = {};
  
  abstract toString(): string;
  
  protected render(finisherName: string): string {
    if (this._stage === 'collecting') {
      // Phase 1: Return template placeholder
      return `{{ ${this._contextName}.${this._nameString}.render('${finisherName}') }}`;
    }
    // Phase 2: Call the finisher function
    const finisher = this._finishers[finisherName];
    return finisher ? finisher() : '';
  }
}
```

### 2. Diviner Declaration Pattern

Diviners are declared in two stages:

```typescript
export const importsDiviner = declareDiviner([
  // Stage 1: Collection
  {
    init: (items, ctx, args) => {
      return new ImportsAccumulator(items.primaryLang!, contextName);
    },
    wrapProperty: {
      // Intercept property access to collect data
      returnType: (desc, acc) => ({
        get: function() {
          const type = desc.get!.call(this);
          if (type?.isEntity) {
            acc.add(type.name, path, true, this.name);
          }
          return type;
        }
      })
    }
  },
  // Stage 2: Rendering
  {
    imports: (acc, ctx, args) => () => {
      // Return the rendered content
      return entries.map(e => `import { ${e.name} } from "${e.path}";`).join('\n');
    }
  }
]);
```

### 3. BoundQuery Integration

The `BoundQuery` class provides lazy evaluation:

```typescript
export class BoundQuery<T extends Queryable<T>> {
  private filters: Array<(m: T) => boolean> = [];
  private cachedResult: T[] | undefined;
  
  // Chainable - returns new BoundQuery with added filter
  filter(predicate: (method: T) => boolean): BoundQuery<T> {
    return this.withFilter(predicate);
  }
  
  // Terminal - triggers evaluation
  get all(): T[] {
    return this.evaluate();
  }
  
  // Lazy evaluation - only runs when terminal called
  private evaluate(): T[] {
    if (this.cachedResult === undefined) {
      this.cachedResult = this.filters.reduce(
        (items, filter) => items.filter(filter), 
        this.source
      );
    }
    return this.cachedResult;
  }
}
```

### 4. Two-Phase Initialization

Diviners have a specific lifecycle:

```typescript
interface InstantiatedDiviner<A extends PostrequisiteAccumulator> {
  accumulator: A;
  
  // Phase 1: Initialize with language (immediate)
  initAccumulator(items: BoundQuery<any>, lang: LanguageDefinitionImperative): void;
  
  // Phase 2: Apply wrappers (lazy, during first evaluation)
  applyWrappers(itemList: T[]): void;
}
```

In `BoundQuery.addLang()`:

```typescript
addLang(lang: LanguageDefinitionImperative): void {
  // Phase 1: Initialize diviner accumulators
  for (const [name, diviner] of Object.entries(this.diviners)) {
    diviner.initAccumulator(this, lang);
    this.accumulators.set(name, diviner.accumulator);
  }
}
```

In `BoundQuery.evaluate()`:

```typescript
private evaluate(): T[] {
  // ... filter items ...
  
  // Phase 2: Apply property wrappers
  for (const [name, diviner] of Object.entries(this.diviners)) {
    diviner.applyWrappers(this.cachedResult!);
  }
  
  // Attach accumulators to each item
  for (const item of this.cachedResult) {
    for (const [name, acc] of this.accumulators) {
      (item as any)[name] = acc;
    }
  }
}
```

## mejs Template Integration

mejs ("me-js") templates are EJS-like templates used for code generation:

```ejs
//! Tauri Commands - GENERATED by spire-loom

{{ methods.imports }}  {# Phase 1: placeholder → Phase 2: actual imports #}

use crate::spire::models::*;
use tauri::{AppHandle, Manager, Runtime};

{% for method in methods %}
#[tauri::command]
{{ method.signature }} {
  app.platform().{{ method.name }}({{ method.paramNames.join(', ') }})
}
{% endfor %}
```

The key trick: **Phase 1 template output contains placeholders that trigger Phase 2 rendering**.

## The Abstraction: DeferredValue Container

From studying the Diviner pattern, we can extract a reusable abstraction:

### Concept: `DeferredValue<T>`

A promise-like container that:

1. **Returns stub values immediately** for template rendering
2. **Provides a lazy query API** like BoundQuery
3. **Has a `runComputation()` method** that gives feedback
4. **Is configurable** for what stub values to return

```typescript
interface DeferredValueConfig<T, S> {
  // What to return during Phase 1 (collecting)
  stub: S;
  
  // The computation to run (may need multiple passes)
  compute: (previous: T | undefined) => ComputationResult<T>;
  
  // How many times to run before giving up
  maxPasses?: number;
}

interface ComputationResult<T> {
  value: T;
  // If true, needs another pass
  needsAnotherPass: boolean;
  // Feedback on what changed
  delta?: unknown;
}

class DeferredValue<T, S> {
  private stage: 'collecting' | 'rendering' = 'collecting';
  private cachedValue: T | undefined;
  private passCount = 0;
  
  constructor(private config: DeferredValueConfig<T, S>) {}
  
  // Returns stub in Phase 1, actual value in Phase 2
  get value(): T | S {
    return this.stage === 'collecting' 
      ? this.config.stub 
      : this.cachedValue!;
  }
  
  // Run the computation, returns if another pass needed
  runComputation(): { complete: boolean; needsAnotherPass: boolean } {
    this.passCount++;
    
    const result = this.config.compute(this.cachedValue);
    this.cachedValue = result.value;
    
    if (!result.needsAnotherPass) {
      this.stage = 'rendering';
      return { complete: true, needsAnotherPass: false };
    }
    
    if (this.passCount >= (this.config.maxPasses ?? 3)) {
      this.stage = 'rendering';
      return { complete: true, needsAnotherPass: false };
    }
    
    return { complete: false, needsAnotherPass: true };
  }
  
  // Query API (like BoundQuery)
  query(): BoundQuery<T> {
    // Returns a BoundQuery over the (eventual) value
  }
}
```

### Comparison: Promise vs DeferredValue

| Aspect | Promise | DeferredValue |
|--------|---------|---------------|
| Initial value | None (pending) | Configurable stub |
| Resolution | Single async | Multi-pass sync |
| Query API | No | Yes (BoundQuery-like) |
| Re-computation | No | Yes (controlled) |
| Template friendly | No | Yes (stub → value) |

### Use Cases

1. **Multi-pass code generation**: Like the imports diviner
2. **Circular dependency resolution**: First pass collects, second pass resolves
3. **Template rendering with postrequisites**: Render → collect → re-render
4. **Incremental computation**: Only recompute what changed

## Related Patterns

### Observer Pattern
- Diviners observe property access during Phase 1
- Unlike traditional observers, they don't react immediately
- They accumulate and render in Phase 2

### Lazy Evaluation
- BoundQuery only evaluates when terminal operation called
- Filters composed into pipeline, not executed
- Results cached for repeated access

### Template Method Pattern
- `PostrequisiteAccumulator` defines the skeleton
- Subclasses implement `render()` for specific behavior
- Two-phase algorithm is the template

## References

- Source: `o19/packages/spire-loom/machinery/reed/postrequisites.ts`
- Tests: `o19/packages/spire-loom/tests/postrequisite-diviners.test.ts`
- APP-001: `o19/.kimi/spire-loom/1NBOX/archive/APP-001-multi-stage-postrequisite-diviners.md`
- Query API: `o19/packages/spire-loom/machinery/sley/query.ts`

## Spiral Evolution

### Communique #001: The Divination Engine

A parallel spiral session ([`COMMUNIQUE-001.md`](./COMMUNIQUE-001.md)) discovered a profound extension: **round-based discovered computation**.

The key insight: *"Program as structure, execution as filling."*

Where the original Diviner Pattern has **two fixed phases**, the Divination Engine has **N discovered rounds** determined by the dependency graph.

### Working Prototype

A runnable implementation bringing together:
- The Diviner Pattern (two-phase)
- The Divination Engine (round-based)
- mejs template integration

Located at: [`prototype/`](./prototype/)

```bash
# Run the demo
cd prototype
pnpm demo

# Run tests
pnpm test
```

The prototype demonstrates:
1. **Round discovery**: Solver determines rounds from DAG
2. **Quoting mechanism**: `{{ __diviner_resolve_* }}` placeholders
3. **Multi-pass rendering**: Templates re-render until stable
4. **Parallel materialization**: Ripe stubs resolve concurrently

### Production Integration

The Divination Engine has been **integrated into scrim-loom** (`@o19/scrim-loom`):

```typescript
// From @o19/scrim-loom
import { Divination, heddles } from '@o19/scrim-loom';

const divination = heddles.createDivination(management, {
  lang: typescript,
  tags: ['service']
});

// Async multi-round validation
const result = await divination.resolve();

// Or watch progress
for await (const round of divination.watch()) {
  console.log(`Round ${round.round}: ${round.resolved.size} checks`);
}
```

**The Journey:**
- Born: In `BAArn/lessons/the-diviner-pattern/prototype/`
- Tested: Against `scrim-loom` demos in BAArn
- Graduated: To `@o19/scrim-loom` production package

See: [`scrim-loom/DEPARTURE.md`](../../demos/scrim-loom/DEPARTURE.md)

### Synthesis

The Divination Engine contains the Diviner Pattern as a **degenerate case**:

| Aspect | Diviner Pattern | Divination Engine |
|--------|-----------------|-------------------|
| Phases | 2 (collect, render) | N discovered rounds |
| Quoting | Fixed depth | Configurable depth |
| Resolution | Sequential | Parallel where possible |
| Template | Two-pass render | Multi-pass until stable |

The engine generalizes where the pattern specifies.

---

*"The diviner looks forward from the past, collecting what will be needed, rendering only when the moment is right.*

*The engine discovers how many times it must look.*

*The spiral determines its own depth."* 🌀
