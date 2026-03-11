# ANALYSIS-004: Treadles with Classes as Config

**Stream**: spire-loom  
**Status**: Analyzed  
**Created**: 2026-03-02  

## Question

Can treadles use classes as config (like languages do) instead of string-based matching? Will they be able to import the spiralers given the current dependency graph?

## Dependency Graph Analysis

### Current Import Patterns

```
machinery/ → can import → warp/          ✓ (many examples)
warp/      → can import → machinery/    ✓ (rust.ts imports reed/language.js)
```

**Result**: Bidirectional dependencies exist. No strict layering prevents treadles from importing spiralers.

### User Treadle Imports

User treadles live in `workspace/loom/treadles/*.ts` and import from `@o19/spire-loom`:

```typescript
// Current user treadle (no imports needed for matching)
export default defineTreadle({
  matches: [{ current: 'RustAndroidSpiraler', previous: 'RustCore' }]
});

// Potential classes-as-config version (imports required)
import { RustAndroidSpiraler, RustCore } from '@o19/spire-loom';

export default defineTreadle({
  matches: [{ current: RustAndroidSpiraler, previous: RustCore }]
});
```

**Feasibility**: ✓ Technically possible. Package exports would need to include spiralers.

## Current Matching Architecture

### How It Works

```typescript
// machinery/heddles/types.ts
interface SpiralNode {
  ring: SpiralRing;
  typeName: string;  // ← Derived from constructor.name
}

// machinery/heddles/matrix.ts
class GeneratorMatrix extends Map<string, GeneratorFunction> {
  setPair(currentType: string, previousType: string, generator): this {
    const key = `${currentType}→${previousType}`;
    return this.set(key, generator);
  }
}

// Runtime matching in declarative.ts
const currentType = current.typeName;      // 'RustAndroidSpiraler'
const previousType = previous.typeName;    // 'RustCore'
const matches = definition.matches.some(
  m => m.current === currentType && m.previous === previousType
);
```

### The Challenge

Treadles match on **connections** (transitions between rings), not individual classes:

```typescript
// Current: String-based connection matching
matches: [{ current: 'RustAndroidSpiraler', previous: 'RustCore' }]

// Hypothetical: Class-based connection matching
matches: [{ current: RustAndroidSpiraler, previous: RustCore }]
```

At runtime, we have `SpiralNode` instances with `typeName: string`. To use class-based matching, we'd need access to the actual class constructors at runtime.

## Implementation Options

### Option 1: Store Constructor in SpiralNode

```typescript
interface SpiralNode {
  ring: SpiralRing;
  typeName: string;
  constructor: new (...args: any[]) => Spiraler;  // ← Add this
}

// Matching becomes
definition.matches.some(m => 
  current.constructor === m.current && 
  previous.constructor === m.previous
);
```

**Pros**: Direct class comparison  
**Cons**: SpiralNode becomes coupled to specific spiraler types; loses string flexibility

### Option 2: Hybrid Approach (Classes + toString)

```typescript
// Classes have toString() returning their name
class RustAndroidSpiraler extends Spiraler {
  static toString() { return 'RustAndroidSpiraler'; }
}

// Matching works with both
type MatchTarget = string | (new (...args: any[]) => Spiraler);

function getMatchKey(target: MatchTarget): string {
  return typeof target === 'string' ? target : target.name;
}
```

**Pros**: Backward compatible, supports both  
**Cons**: More complex, potential for name collisions

### Option 3: Registry Lookup (Similar to Languages)

```typescript
// Register spiralers like languages
export const spiralers = new Map<string, typeof Spiraler>();
spiralers.set('RustAndroidSpiraler', RustAndroidSpiraler);

// Matching via registry
const currentClass = spiralers.get(current.typeName);
matches.some(m => currentClass === m.current)
```

**Pros**: Consistent with language pattern  
**Cons**: Adds indirection; spiralers already available via imports

## Trade-off Analysis

| Aspect | String-Based (Current) | Classes as Config |
|--------|------------------------|-------------------|
| **Type Safety** | Runtime errors | Compile-time checking |
| **IDE Support** | None | Autocomplete, go-to-definition |
| **Refactoring** | String search/replace | Automated refactoring |
| **User Treadles** | Simple, no imports | Requires imports |
| **Dynamic Loading** | Works with any string | Requires class availability |
| **Runtime Flex** | Can match on patterns | Exact class match only |
| **Testability** | Easy to mock | Must import real classes |

## The Core Tension

Treadles serve **two different use cases**:

1. **Built-in treadles** (in `machinery/treadles/`) - Could benefit from type safety
2. **User treadles** (in `loom/treadles/`) - Value simplicity and flexibility

String-based matching optimizes for user treadles. Classes-as-config would optimize for built-in treadles at the cost of user experience.

## Recommendation: Keep Strings, Enhance Ergonomics

Don't switch to classes as config for treadles. Instead, improve string-based DX:

```typescript
// Option A: Helper functions for type-safe strings
import { match } from '@o19/spire-loom/treadle-kit';

export default defineTreadle({
  matches: [
    match.spiraler('RustAndroidSpiraler').extends('RustCore'),
    // ^ Autocomplete available via string literal types
  ]
});

// Option B: Exported string constants
import { T } from '@o19/spire-loom/treadle-kit';

export default defineTreadle({
  matches: [
    { current: T.RustAndroidSpiraler, previous: T.RustCore }
    // ^ Constants with IDE support
  ]
});
```

These approaches provide IDE support without requiring class imports or sacrificing flexibility.

## Verdict

**Technically possible?** Yes. Dependencies support it.  
**Architecturally advisable?** No. Treadles match connections (strings), not individual types (classes). The semantic mismatch isn't worth the type safety gain.

**Conservation principle**: Two patterns exist for reasons. Languages = type-safe infrastructure. Treadles = flexible weaving logic. Don't unify what should remain distinct.

---

> *"The spiral differentiates: languages bind tight, treadles flow free."*
