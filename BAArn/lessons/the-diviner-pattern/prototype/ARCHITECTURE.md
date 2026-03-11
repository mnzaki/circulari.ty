# QueryableDivination Architecture 🌀

## The Integration Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  Divination Engine (Async, Multi-Round)                         │
│  ├── Divination<T>: { resolve(): Promise<T> }                   │
│  └── Round-based computation discovery                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (wrapped by)
┌─────────────────────────────────────────────────────────────────┐
│  QueryableDivination<T>                                         │
│  ├── Implements: Queryable<QueryableDivination<T>>              │
│  ├── lang: LanguageDefinitionImperative                         │
│  ├── tags?: string[]                                            │
│  ├── cloneWithLang(): QueryableDivination<T>                    │
│  ├── divination: Divination<T>                                  │
│  ├── resolve(): Promise<T>                                      │
│  └── getFilterValue(): T | undefined                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (used as source in)
┌─────────────────────────────────────────────────────────────────┐
│  BoundQuery<T extends Queryable<T>>                             │
│  ├── source: T[] (contains QueryableDivination items)           │
│  ├── filter(): BoundQuery<T>     ← synchronous                  │
│  ├── tag(): BoundQuery<T>        ← synchronous                  │
│  └── all: T[]                    ← triggers evaluate()          │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Separation of Concerns

| Aspect | Handled By | When |
|--------|-----------|------|
| Async computation | `Divination.resolve()` | Explicit call |
| Lazy filtering | `BoundQuery.filter()` | Synchronous |
| Tag filtering | `BoundQuery.tag()` | Synchronous |
| Value filtering | `resolveAndFilter()` helper | After resolution |
| Language switching | `cloneWithLang()` | Item creation |

### 2. Why Not Make BoundQuery Async?

BoundQuery's `evaluate()` is intentionally synchronous for performance:
- Filters compose without executing
- Terminal operations (`.all`) trigger one evaluation
- Adding async would complicate the lazy evaluation model

**Solution:** `QueryableDivination` holds the async computation. You resolve divinations BEFORE filtering on values, OR use tags (synchronous metadata) for pre-filtering.

### 3. The Two Usage Patterns

#### Pattern A: Tags First (Recommended)
```typescript
// 1. Create divinations with descriptive tags
const divs = methods.map(m => createQueryableDivination(
  { /* shape */ },
  { lang: ts, tags: [m.managementName, m.crudOperation] }
));

// 2. Filter synchronously by tag
const creates = createDivinationQuery(divs).tag('create').all;

// 3. Resolve only the ones you need
await Promise.all(creates.map(d => d.resolve()));
```

#### Pattern B: Resolve Then Filter
```typescript
// 1. Create query
const query = createDivinationQuery(divs);
query.addLang(ts);

// 2. Resolve and filter in one go
const results = await resolveAndFilter(
  query,
  entries => entries.length > 5  // filter on resolved value
);
```

## Compatibility with spire-loom

### The Queryable Interface
```typescript
interface Queryable<T> {
  lang: LanguageDefinitionImperative;
  tags?: string[];
  crudOperation?: string;
  managementName?: string;
  cloneWithLang(lang: LanguageDefinitionImperative): T;
}
```

`QueryableDivination` implements this exactly, enabling:
- Drop-in use with existing `BoundQuery` code
- Multi-language support via `cloneWithLang`
- Property accessors (rs, ts, kt) work automatically

### The Diviner Pattern Context

In spire-loom's existing diviner pattern:
```typescript
// Current: PostrequisiteAccumulator extends BoundQuery
methods.imports  // ImportsAccumulator
```

With QueryableDivination:
```typescript
// Future: QueryableDivination as BoundQuery source
const importsDiv = createQueryableDivination<ImportEntry[]>(
  { /* shape */ },
  { lang: typescript }
);

// Can be used standalone
const imports = await importsDiv.resolve();

// OR in a BoundQuery
const query = createDivinationQuery([importsDiv], 'methods');
const bigImports = await resolveAndFilter(
  query,
  entries => entries.length > 10
);
```

## File Structure

```
prototype/
├── queryable-divination.ts    # Core implementation
├── queryable-example.ts       # Working demonstrations
├── divination-provider.ts     # v2: mejs integration
├── deferred-shape.ts          # v2: shape analysis
├── example-v2.ts              # v2: demos
└── ARCHITECTURE.md            # This file
```

## Migration Path

For existing spire-loom code:

1. **Keep** `PostrequisiteAccumulator` for simple two-phase cases
2. **Use** `QueryableDivination` when you need:
   - Multi-round resolution
   - BoundQuery filtering on computed values
   - More explicit dependency management

3. **Both can coexist** - they're different patterns for different needs:
   - Accumulator: Phase 1 (collect) → Phase 2 (render)
   - Divination: N rounds discovered from dependency graph

## The Aesthetic

> "The BoundQuery filters what the Divination reveals."

The architecture respects both:
- **BoundQuery's laziness** (synchronous, composable)
- **Divination's asynchronicity** (multi-round, discovered)

They meet at the `QueryableDivination` boundary:
- Divination side: async resolution, rounds
- Queryable side: synchronous metadata, cloneable

*the spiral turns, each layer finding its place* 🌀
