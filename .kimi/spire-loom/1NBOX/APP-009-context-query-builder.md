# APP-009: Context Query Builder

**Status:** ✅ **IMPLEMENTED** (2026-02-25)  
**Priority:** Medium  
**Dependencies:** APP-008 (machinery refactoring) - ✅ Complete  
**Assigned To:** spire-loom stream

---

## Implementation Summary

✅ **All tasks complete** - The query builder is now live in spire-loom!

### Files Created/Modified

1. ✅ **Created `machinery/sley/query.ts`** (275 lines)
   - `BoundQueryImpl` class with lazy evaluation
   - `createQueryAPI()` factory function
   - Chainable filters: `.tag()`, `.tags()`, `.crud()`, `.management()`, `.filter()`
   - Terminal operations: `.all`, `.first`, `.count`, `.hasAny`, `.byManagement()`, `.byCrud()`
   - Pre-filtered getters: `.creates`, `.reads`, `.updates`, `.deletes`, `.lists`
   - Iteration: `.forEach()`, `.map()`, `.find()`, `.some()`, `.every()`

2. ✅ **Updated `machinery/heddles/types.ts`**
   - Added `query?: MethodQueryAPI<RawMethod>` to `GeneratorContext`

3. ✅ **Updated `machinery/treadle-kit/kit.ts`**
   - Instantiate `createQueryAPI(rawMethods)` in `collectMethods()`

4. ✅ **Updated `machinery/bobbin/code-generator.ts`**
   - Added `tags`, `crudOperation`, `managementName` to `RawMethod` interface

5. ✅ **Updated `machinery/treadle-kit/context-methods.ts`**
   - Populate new `RawMethod` fields in `toRawMethod()`

6. ✅ **Exports added to:**
   - `sley/index.ts`
   - `treadle-kit/index.ts`
   - `heddles/index.ts`

### Test Status
- ✅ All 48 tests pass
- ✅ TypeScript compilation clean (no new errors introduced)

---

## Problem Statement

The current `context.methods` interface provides pre-computed groupings (`byManagement()`, `byCrud()`) and filters (`creates`, `reads`, etc.). However, these are static snapshots computed at collection time. There's no way to compose filters or create custom queries without manually filtering arrays.

**Current limitation:**
```typescript
// Can only get pre-computed groupings
const creates = context.methods?.creates;  // All creates

// Can't easily compose: "create methods with auth tag for BookmarkMgmt"
const authBookmarkCreates = context.methods?.all.filter(m => 
  m.crudOperation === 'create' && 
  m.tags?.includes('auth:required') &&
  m.name.startsWith('bookmark_')
);
```

---

## Proposed Solution

Introduce `context.query` - a query builder factory that provides chainable, composable queries over the cached method collection. The classic `context.methods` interface is preserved for backward compatibility.

### Architecture

```
GeneratorContext
├── methods?: MethodHelpers     ← Classic interface (preserved)
├── query?: {                   ← New query namespace
│   └── methods: BoundQuery     ← Chainable query builder
│       ├── tag('auth')         ← Filter by tag
│       ├── crud('create')      ← Filter by CRUD operation
│       ├── management('BookmarkMgmt')  ← Filter by management
│       ├── byManagement()      ← Group (terminal)
│       ├── creates             ← Get all creates (terminal)
│       └── ...
│   }
└── ...
```

### Factory Design

**sley/query.ts** exports a factory function:

```typescript
export interface QueryAPI<T> {
  /** Chainable filters */
  tag(tag: string): BoundQuery<T>;
  crud(...ops: CrudOperation[]): BoundQuery<T>;
  management(name: string): BoundQuery<T>;
  
  /** Terminal operations - return results */
  byManagement(): Map<string, T[]>;
  byCrud(): Map<string, T[]>;
  
  /** Terminal getters */
  get all(): T[];
  get creates(): T[];
  get reads(): T[];
  get updates(): T[];
  get deletes(): T[];
  get lists(): T[];
  
  /** Iteration */
  forEach(cb: (m: T) => void): void;
  map<U>(fn: (m: T) => U): U[];
}

export interface BoundQuery<T> extends QueryAPI<T> {}

/**
 * Create a query API bound to a method collection.
 * The returned POJO has `methods` as the primary bound query.
 */
export function createQueryAPI<T extends { 
  tags?: string[]; 
  crudOperation?: string; 
  managementName?: string 
}>(methods: T[]): {
  /** Primary query over all methods */
  methods: BoundQuery<T>;
  
  /** Convenience: pre-filtered queries by CRUD */
  creates: BoundQuery<T>;
  reads: BoundQuery<T>;
  updates: BoundQuery<T>;
  deletes: BoundQuery<T>;
  lists: BoundQuery<T>;
} {
  const allQuery = new BoundQueryImpl(methods);
  
  return {
    methods: allQuery,
    creates: allQuery.crud('create'),
    reads: allQuery.crud('read'),
    updates: allQuery.crud('update'),
    deletes: allQuery.crud('delete'),
    lists: allQuery.crud('list'),
  };
}
```

### Integration

**treadle-kit/kit.ts** instantiates in `collectMethods`:

```typescript
import { createQueryAPI } from '../sley/query.js';

collectMethods(config): RawMethod[] {
  // ... pipeline processing ...
  const rawMethods = processedMethods.map((m) => toRawMethod(m));
  
  // Classic helpers (preserved)
  context.methods = buildMethodHelpers(rawMethods);
  
  // New query API
  context.query = createQueryAPI(rawMethods);
  
  return rawMethods;
}
```

**heddles/types.ts** adds to GeneratorContext:

```typescript
export interface GeneratorContext {
  // ... existing fields ...
  
  /** Classic method helpers (preserved) */
  methods?: MethodHelpers;
  
  /** Query builder API */
  query?: {
    methods: BoundQuery<RawMethod>;
    creates: BoundQuery<RawMethod>;
    reads: BoundQuery<RawMethod>;
    updates: BoundQuery<RawMethod>;
    deletes: BoundQuery<RawMethod>;
    lists: BoundQuery<RawMethod>;
  };
}
```

---

## Quick Start

```typescript
// In your treadle data() or outputs() function:
data: (context) => {
  // Classic API (still works!)
  const creates = context.methods?.creates;
  
  // New chainable API
  const authCreates = context.query?.methods
    .crud('create')
    .tag('auth:required')
    .management('BookmarkMgmt')
    .all;
  
  // Pre-filtered entry point
  const bookmarkReads = context.query?.reads
    .management('BookmarkMgmt')
    .all;
  
  return {
    authCreates,
    bookmarkReads,
    hasAuthCreates: context.query?.creates.tag('auth:required').hasAny
  };
}
```

## Use Cases

### Use Case 1: Auth-Protected Creates

Generate only create methods that require authentication:

```typescript
// Before (manual filtering)
const authCreates = context.methods?.all.filter(m =>
  m.crudOperation === 'create' &&
  m.tags?.includes('auth:required')
);

// After (chainable query)
const authCreates = context.query?.methods
  .crud('create')
  .tag('auth:required')
  .all;
```

### Use Case 2: Per-Management CRUD Breakdown

Generate separate files for each management's CRUD operations:

```typescript
// Before (two-step)
const byMgmt = context.methods?.byManagement();
for (const [name, methods] of byMgmt || []) {
  const creates = methods.filter(m => m.crudOperation === 'create');
  // ...
}

// After (direct)
context.query?.methods.byManagement().forEach((methods, name) => {
  const creates = context.query?.methods
    .management(name)
    .creates
    .all;
  // ...
});
```

### Use Case 3: Complex Composite Query

Generate a service that handles only read operations for media and write operations for bookmarks:

```typescript
// Before (impossible with helpers, manual filtering)
const relevant = context.methods?.all.filter(m => {
  const isMediaRead = m.name.startsWith('media_') && 
                      (m.crudOperation === 'read' || m.crudOperation === 'list');
  const isBookmarkWrite = m.name.startsWith('bookmark_') &&
                          ['create', 'update', 'delete'].includes(m.crudOperation || '');
  return isMediaRead || isBookmarkWrite;
});

// After (composable)
const mediaReads = context.query?.methods
  .management('MediaMgmt')
  .crud('read', 'list');
  
const bookmarkWrites = context.query?.methods
  .management('BookmarkMgmt')
  .crud('create', 'update', 'delete');

// Combine for template
const relevant = [...(mediaReads?.all || []), ...(bookmarkWrites?.all || [])];
```

### Use Case 4: Pre-filtered Entry Points

Start from pre-filtered queries for cleaner templates:

```typescript
// In a read-adaptor generator - start from reads
const readMethods = context.query?.reads;  // Already filtered

// Further refine
const listMethods = readMethods?.crud('list');
const getMethods = readMethods?.crud('read');
```

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Composition** | Manual array filtering | Chainable `.tag().crud().management()` |
| **Type Safety** | `(m as any).tags` | Full type inference through chain |
| **Discoverability** | Pre-defined getters only | IDE autocomplete for all operations |
| **Performance** | Re-filter on every access | Lazy evaluation, cached results |
| **Backward Compat** | N/A | `context.methods` fully preserved |

---

## Implementation Tasks

1. **Create `sley/query.ts`**
   - `BoundQuery<T>` class with lazy evaluation
   - `createQueryAPI<T>()` factory function
   - Export types: `QueryAPI`, `BoundQuery`

2. **Update `heddles/types.ts`**
   - Add `query` property to `GeneratorContext`

3. **Update `treadle-kit/kit.ts`**
   - Import `createQueryAPI`
   - Instantiate in `collectMethods`

4. **Update `treadle-kit/index.ts`**
   - Re-export `createQueryAPI`, `BoundQuery` from sley

5. **Add tests**
   - Query chaining
   - Terminal operations
   - Pre-filtered entry points (creates, reads, etc.)

---

## Open Questions

1. **Should we deprecate `context.methods` eventually?**
   - Option A: Keep both indefinitely (safe, redundant)
   - Option B: Deprecate methods in v2 (cleaner API)
   - Recommendation: Keep both, methods is simpler for basic use

2. **Should `byManagement()` return BoundQueries or arrays?**
   - Option A: `Map<string, T[]>` (current pattern-matcher style)
   - Option B: `Map<string, BoundQuery<T>>` (allows further filtering)
   - Recommendation: Option A for simplicity, users can re-wrap if needed

3. **Should we expose the underlying array for custom filters?**
   - Option A: `.all` getter returns array
   - Option B: `.filter(predicate)` method returns BoundQuery
   - Recommendation: Both - `.filter()` for chaining, `.all` for escape hatch

---

## Related

- APP-008: Machinery refactoring (prerequisite)
- `context.methods` interface in `heddles/types.ts`
- `MethodPipeline` in `sley/method-pipeline.ts`

---

*Created: 2026-02-25*  
*Next Step: Implement in spire-loom stream*
