---
type: APP
stream: spire-loom
number: 001
title: Multi-Stage Postrequisite Diviners
author: Kimi
status: proposed
date: 2026-03-11
---

# APP-001: Multi-Stage Postrequisite Diviners

## Summary

Implement a **diviner pattern** for postrequisites—requirements determined AFTER template rendering begins. Diviners are two-stage accumulators that:
1. **Collect** during Phase 1 (via property wrapping)
2. **Render** during Phase 2 (via clever `toString()`)

The key insight: **Accumulators extend BoundQuery**, making them both collection mechanisms AND queryable results.

## Design Philosophy

```
"The diviner looks forward from the past, 
 collecting what will be needed,
 rendering only when the moment is right."
```

This embodies the spire-loom weaving metaphor:
- **Phase 1 (Collection)**: The weft passes through, the diviner notes what threads touch what
- **Phase 2 (Rendering)**: The beaters pack tight, the diviner reveals the pattern

## Architecture

### Core Types

```typescript
// PostrequisiteAccumulator extends BoundQuery
abstract class PostrequisiteAccumulator<T> extends BoundQuery<T> {
  _stage: 'idle' | 'collecting' | 'rendering'
  
  toString(): string  // Phase 1: placeholder, Phase 2: rendered
  abstract render(): string
  abstract _attachToItems(items: any[]): void
}
```

### Diviner Pattern

```typescript
// In reed/index.ts:fromHeddles()
const methods = createQueryAPI(methodItems, 'methods')
// Attach accumulator as property
;(methods as any).imports = new ImportsAccumulator(methods, 'methods')

const entities = createQueryAPI([], 'entities')
;(entities as any).newFiles = new FilesAccumulator(
  methods.imports,      // Source query
  './entities/{{name}}', // Path template
  'entities'
)
```

### Usage in Treadles

```typescript
newFiles: (ctx) => [
  // The accumulator IS a BoundQuery with clever toString
  { template: 'x.ts', path: 'x.ts', context: { imports: ctx.methods.imports }},
  
  // Can query it like any BoundQuery
  ...ctx.entities.newFiles.filter(f => f.name !== 'Base').all
]
```

### Template Rendering

```ejs
// Phase 1: toString() returns "{{ methods.imports.render() }}"
// Phase 2: toString() returns actual imports
{{ methods.imports }}
```

## Implementation Steps

### Step 1: Update BoundQuery to Support Nested Sources

**File**: `machinery/sley/query.ts`

Changes:
- Change `source` type from `T[]` to `T[] | BoundQuery<T>`
- Update `evaluate()` to handle parent BoundQuery sources
- Add `parentTransform` parameter for `map()` support
- `map()` returns new BoundQuery with `this` as source

```typescript
export class BoundQuery<T> {
  protected source: T[] | BoundQuery<T>
  protected parentTransform?: (item: any) => T
  
  map<U>(fn: (item: T) => U): BoundQuery<U> {
    return new BoundQuery(this as any, [], `${this.contextName}.map`, fn)
  }
  
  evaluate(): T[] {
    // If source is BoundQuery, evaluate parent first
    // Apply parentTransform if present
    // Apply filters
  }
}
```

### Step 2: Create PostrequisiteAccumulator Base Class

**File**: `machinery/reed/postrequisites.ts`

New file content:
- `PostrequisiteAccumulator<T>` extends `BoundQuery<T>`
- Stage management (`idle` → `collecting` → `rendering`)
- `toString()` with Phase 1/2 awareness
- Abstract methods: `render()`, `_attachToItems()`

### Step 3: Create ImportsAccumulator

**File**: `machinery/reed/postrequisites.ts`

```typescript
class ImportsAccumulator extends PostrequisiteAccumulator<ImportEntry> {
  constructor(sourceMethods: BoundQuery<any>, contextName: string)
  
  _attachToItems(methods: any[]): void {
    // Wrap method.returnType to collect entity imports
  }
  
  render(): string {
    // Render import statements using lang.codeGen.rendering
  }
  
  // Inherits from BoundQuery: filter(), map(), all, etc.
}
```

### Step 4: Create FilesAccumulator

**File**: `machinery/reed/postrequisites.ts`

```typescript
class FilesAccumulator extends PostrequisiteAccumulator<LanguageFile> {
  constructor(
    sourceQuery: BoundQuery<any>,
    pathTemplate: string,
    contextName: string
  )
  
  // Transforms source items to files via map()
  // Exposes as BoundQuery<LanguageFile>
}
```

### Step 5: Update reed/index.ts

**File**: `machinery/reed/index.ts`

Attach accumulators to queries:

```typescript
export function fromHeddles(heddles: Heddles): Reed {
  const methods = createQueryAPI(...)
  ;(methods as any).imports = new ImportsAccumulator(methods, 'methods')
  
  const entities = createQueryAPI([], 'entities')
  ;(entities as any).newFiles = new FilesAccumulator(
    (methods as any).imports,
    './entities/{{name}}',
    'entities'
  )
  
  return { mgmts, methods, entities }
}
```

### Step 6: Update GeneratorContext Type

**File**: `weaver/plan-builder.ts` or appropriate types file

Ensure `GeneratorContext` knows about the diviner properties:

```typescript
interface GeneratorContext {
  methods: BoundQuery<LanguageMethod> & { imports?: ImportsAccumulator }
  entities: BoundQuery<LanguageEntity> & { newFiles?: FilesAccumulator }
  // ...
}
```

### Step 7: Test with Existing Templates

**Files**: `machinery/bobbin/**/*.mejs`

Update templates to use new pattern:

```ejs
// Before: (nothing - imports were manual)
// After:
{{ methods.imports }}
```

Verify Phase 1/2 rendering works correctly.

### Step 8: Update Treadle-Kit (if needed)

**File**: `machinery/treadle-kit/spec-resolver.ts`

Ensure `resolveSpecs` handles `BoundQuery` instances in `newFiles`:

```typescript
// Check if spec is BoundQuery, extract .all
if (spec instanceof BoundQuery) {
  return spec.all as NewFileSpec[]
}
```

## Testing Strategy

1. **Unit tests**: Verify accumulator stages transition correctly
2. **Integration tests**: Full template render cycle
3. **Existing tests**: Ensure no regressions in 160 passing tests

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing templates | Keep backward compatible - diviners are additive |
| Performance (nested queries) | Lazy evaluation - only compute when needed |
| Type safety | Use `as any` for property attachment, document in types |

## Success Criteria

- [ ] `ctx.methods.imports.toString()` returns placeholder in Phase 1
- [ ] Same call returns rendered imports in Phase 2
- [ ] `ctx.entities.newFiles` is queryable as BoundQuery
- [ ] Templates can use `{{ methods.imports }}` and `{{ entities.newFiles }}`
- [ ] All 160 existing tests still pass

## Related Documents

- PLAN-005-the-thread-weaving.md
- PLAN-006-language-definition-rearchitecture.md
- machinery/reed/language/README.md (Two-Layer Architecture)

---

*Spiraling toward completion, the diviner sees what will be needed.*
