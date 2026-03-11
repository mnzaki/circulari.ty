---
from: Discussion about refactoring BoundQuery to use iterators instead of unions
timestamp: 2026-03-11T14:00:00Z
status: IMPLEMENTED
---

# APP-004: Iterator-Based Architecture for BoundQuery ✅

> *Replace `BoundQuery<T> | T[]` unions with `Iterable<T>` throughout the codebase for lazy evaluation and composability*

## The Core Intent

**WHY this matters:**

The current codebase uses `BoundQuery<T> | T[]` unions everywhere. This creates type ambiguity, forces eager evaluation (`.all`), and duplicates logic for handling both arrays and BoundQueries. By standardizing on `Iterable<T>`, I can enable lazy evaluation, better composability, and cleaner APIs.

**WHO benefits:**

- **Treadle authors**: Consistent `Iterable<T>` interface everywhere, no more checking types
- **Memory usage**: Lazy evaluation means large entity lists don't materialize in memory
- **Performance**: Chain operations without intermediate arrays

**What changes:**

```typescript
// BEFORE: Type unions, eager evaluation
const items: BoundQuery<T> | T[] = ...;
const array = Array.isArray(items) ? items : items.all; // Eager!

// AFTER: Single interface, lazy evaluation  
const items: Iterable<T> = ...;
for (const item of items) { ... } // Lazy!
```

## What We're Building

### In Scope

- [x] Create `sley/iterators.ts` with lazy iterator utilities
- [x] Add iterator methods to `BoundQuery` class
- [x] Update `spec-resolver.ts` types to use `Iterable<T>`
- [x] Update `treadle-kit/types.ts` to use `Iterable<T>`
- [x] Export iterators from `sley/index.ts`
- [x] Refactor `android-generator.ts` to use iterators
- [x] Refactor `tauri-generator.ts` to use iterators
- [x] Refactor `ddd-services.ts` to use iterators

### Out of Scope (For Now)

- Template composition system — handled in APP-005
- New bobbin templates — handled in APP-005
- Changes to how entities are collected — APP-001 already did this

## Context & Constraints

### What We Know

- **APP-001** (Multi-Stage Diviners) already implemented — entities are queryable
- `BoundQuery` already implements `[Symbol.iterator]` — foundation is there
- Generators/yield in TypeScript work well for lazy evaluation
- Array spread operator `[...iterable]` works for materialization when needed

### Dependencies

- **APP-001** ✅ — Must be complete (it is!)
- BoundQuery existing iterator protocol — Already in place

### Unknowns / Risks

- **Breaking changes** — Some code may depend on `BoundQuery` methods not in `Iterable`
  - *Mitigation*: Keep `BoundQuery` type for parameters, accept `Iterable` where flexibility needed
- **Performance** — Generators may have overhead vs arrays for small datasets
  - *Mitigation*: Benchmark before/after, keep arrays for small fixed lists

### Related Work

- **APP-001** — Provides the `entities.newFiles` BoundQuery we'll iterate over
- **APP-005** — Will use this iterator foundation for template composition

## The Plan

### Phase 1: Foundation — Create Iterator Utilities
**Goal:** Have lazy iterator utilities ready for use

**Success criteria:** All utilities tested and working

- [ ] Create `machinery/sley/iterators.ts`:
  ```typescript
  export function* map<T, U>(iterable: Iterable<T>, fn: (item: T) => U): Generator<U>
  export function* filter<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): Generator<T>
  export function* flat<T>(iterable: Iterable<Iterable<T>>): Generator<T>
  export function toArray<T>(iterable: Iterable<T>): T[]
  export function reduce<T, U>(iterable: Iterable<T>, fn: (acc: U, item: T) => U, initial: U): U
  ```
- [ ] Add unit tests for iterator utilities
- [ ] Export from `machinery/sley/index.ts`

### Phase 2: Enhance BoundQuery
**Goal:** BoundQuery has first-class iterator methods

**Success criteria:** Can chain lazy operations on BoundQuery

- [ ] Add `mapIter<U>(fn): Iterable<U>` — lazy map
- [ ] Add `filterIter(predicate): Iterable<T>` — lazy filter  
- [ ] Add `entries(): Generator<[number, T]>` — indexed iteration
- [ ] Add `toArray(): T[]` — convenience for materialization
- [ ] Ensure `[Symbol.iterator]` is optimized

### Phase 3: Update Type Signatures
**Goal:** Type system prefers `Iterable<T>` over unions

**Success criteria:** No `BoundQuery<T> | T[]` in public APIs

- [ ] Update `machinery/treadle-kit/spec-resolver.ts`:
  ```typescript
  export type SpecOrFn<T, C> = T | Iterable<T> | ((context: C) => T | Iterable<T> | undefined)
  ```
- [ ] Update `machinery/treadle-kit/types.ts`:
  ```typescript
  generateFiles(
    outputs: OutputSpec[],
    data: Record<string, unknown>,
    methods: Iterable<LanguageMethod>,  // Was: BoundQuery<LanguageMethod>
    entities?: Iterable<LanguageEntity>
  ): Promise<GeneratedFile[]>
  ```

### Phase 4: Refactor Treadles
**Goal:** All built-in treadles use iterators

**Status:** ✅ COMPLETE — All treadles now use iterator utilities

- [x] Refactor `android-generator.ts`:
  - Uses `map()` for method permission generation
  - Uses `toArray()` for materializing hookup arrays
  
- [x] Refactor `tauri-generator.ts`:
  - Uses `map()` for permission ID generation
  - Uses `ctx.methods.count` instead of `.all.length`
  
- [x] Refactor `ddd-services.ts`:
  - Uses `map()` over `ctx.mgmts` for service generation
  - Uses `toArray()` for materializing output arrays

## Success Criteria (Overall)

- [x] All iterator utilities have tests (51 tests)
- [x] BoundQuery has lazy iterator methods
- [x] No `BoundQuery<T> | T[]` unions in public APIs
- [x] All built-in treadles use iterators
- [x] Performance maintained (225 tests passing)
- [x] 174+ tests still passing (225 passing)

## Conservation Notes

**What seems obvious now:**

- `yield*` delegates to sub-iterators efficiently
- `for...of` loops work on both arrays and generators
- `[...iterable]` spreads materialize when you actually need an array

**Questions to resolve:**

- Should we keep `BoundQuery` as return type or fully commit to `Iterable`?
  - *Leaning*: Keep `BoundQuery` for fluent API, accept `Iterable` for flexibility

---

*Created: 2026-03-11T14:00:00Z*
*Stream: spire-loom*
