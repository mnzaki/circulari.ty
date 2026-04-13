# APP-008: Spire-Loom Machinery Refactoring

**Status:** Proposed  
**Priority:** Medium  
**Dependencies:** None (incremental, can be done in phases)

---

## Problem Statement

The spire-loom machinery has grown organically and several files are now too large, mixing concerns, with some legacy duplication. This APP tracks the incremental cleanup to improve maintainability.

---

## Current State Analysis

### File Sizes (lines)

| File | Lines | Concern |
|------|-------|---------|
| `machinery/heddles/pattern-matcher.ts` | 787 | Too many responsibilities |
| `machinery/treadle-kit/core.ts` | 614 | Mixes kit, strings, naming, AIDL |
| `machinery/sley/method-pipeline.ts` | 517 | OK - the modern pipeline |
| `machinery/sley/crud-mapping.ts` | 365 | **Legacy** - deprecated |
| `machinery/sley/method-translator.ts` | 374 | **Legacy** - deprecated |

### Legacy Redundancy Found

**`sley/crud-mapping.ts`** exports are **only used internally**:
- `shouldFilterMethod()` - duplicated in `method-translator.ts`
- `filterMethodsByTags()` - no external consumers
- `mapManagementCrud()` - superseded by `MethodPipeline`

**Safe to deprecate** - mark with `@deprecated` and remove in future.

---

## Responsibility Boundaries (Target State)

| Module | Single Responsibility |
|--------|----------------------|
| **heddles/** | Metadata extraction & enrichment from ownership chain |
| **sley/** | Method transformation pipelines & operation routing |
| **reed/** | Workspace discovery & Management collection from loom/ |
| **treadle-kit/** | Generator construction using heddles + sley |
| **bobbin/** | Code generation templates & type mappings |

---

## Phase 1: Sley Consolidation (Low Risk)

**Goal**: Remove legacy duplication

### Tasks

1. **Mark legacy exports as deprecated**
   ```typescript
   // sley/index.ts
   /** @deprecated Use MethodPipeline from './method-pipeline.js' */
   export { shouldFilterMethod, filterMethodsByTags, mapManagementCrud } from './crud-mapping.js';
   ```

2. **Remove duplicate `shouldFilterMethod`**
   - `method-translator.ts` has its own copy at line 166
   - Replace with import from `method-pipeline.ts` or inline the simple logic

3. **Update HOW_TO_LOOM.md**
   - Remove references to legacy functions
   - Point to `MethodPipeline` examples

### Verification
- [ ] No external imports of legacy functions
- [ ] All tests pass
- [ ] No functional changes

---

## Phase 2: Heddles Breakdown (Medium Risk)

**Goal**: Split 787-line `pattern-matcher.ts` into cohesive modules

### Proposed Structure

```
machinery/heddles/
  index.ts                 # Re-exports only
  types.ts                 # All interfaces (SpiralNode, WeavingPlan, etc.)
  enrichment.ts            # enrichManagementMethods() - computes useResult/wrappers
  context.ts               # GeneratorContext, MethodHelpers interfaces
  matrix.ts                # GeneratorMatrix class
  plan-builder.ts          # Heddles class → orchestrates plan building
  traversal.ts             # Ring traversal utilities (traverse(), collectAllLayers)
  tieup-collector.ts       # collectAllTieups() logic
```

### Key Extractions

**`enrichment.ts`** - The heddles' core value:
```typescript
// Computes useResult, wrappers from ownership chain
export function enrichManagementMethods(managements: ManagementMetadata[]): ManagementMetadata[]
```

**`traversal.ts`** - Graph utilities:
```typescript
export function traverseRing(ring: SpiralRing, callback: (node: SpiralNode) => void)
export function collectAllLayers(warp: Record<string, SpiralRing>): Set<Layer>
```

**`plan-builder.ts`** - Main orchestrator:
```typescript
export class PlanBuilder {
  buildPlan(warp: Record<string, SpiralRing>, managements: ManagementMetadata[]): WeavingPlan
}
```

### Verification
- [ ] All types re-exported from `index.ts`
- [ ] No breaking changes to public API
- [ ] Weaver continues to work

---

## Phase 3: Treadle-Kit Cleanup (Medium Risk)

**Goal**: Extract utilities from 614-line `core.ts`

### Proposed Structure

```
machinery/treadle-kit/
  core.ts                  # TreadleKit interface + createTreadleKit()
  declarative.ts           # defineTreadle(), generateFromTreadle()
  
  # NEW FILES:
  strings.ts               # pascalCase, camelCase, toSnakeCase
  naming.ts                # buildServiceNaming(), buildAndroidPackageData()
  aidl.ts                  # mapToAidlType(), addAidlTypesToMethods()
  method-helpers.ts        # buildMethodHelpers(), toRawMethod()
```

### Key Principle

**Treadle-kit should USE sley/heddles, not DUPLICATE:**

```typescript
// Current (in core.ts):
function buildMethodHelpers(methods: RawMethod[]): MethodHelpers {
  return {
    byManagement(): Map<string, RawMethod[]> {
      // Custom implementation
    }
  }
}

// Target (use sley):
import { groupByManagement } from '../sley/method-pipeline.js'

function buildMethodHelpers(methods: RawMethod[]): MethodHelpers {
  return {
    byManagement: () => groupByManagement(methods)
  }
}
```

### Verification
- [ ] All exports preserved
- [ ] No circular dependencies introduced
- [ ] Type check passes

---

## Phase 4: Deduplicate Method Helpers (Optional)

**Goal**: Use sley utilities in treadle-kit

### Tasks

1. **Export sley grouping utilities**
   - `groupByManagement()` currently internal in `method-pipeline.ts`
   - Make it a proper export

2. **Refactor `buildMethodHelpers`** to use sley:
   ```typescript
   import { groupByManagement, extractCrudOperation } from '../sley/method-pipeline.js'
   
   function buildMethodHelpers(methods: RawMethod[]): MethodHelpers {
     return {
       all: methods,
       byManagement: () => groupByManagement(methods),
       byCrud: () => groupByCrud(methods), // needs extraction too
       withCrud: (op) => methods.filter(m => m.crudOperation === op),
       // ... getters
     }
   }
   ```

### Verification
- [ ] No behavioral changes
- [ ] Method grouping still works correctly

---

## Implementation Order

```
Phase 1: Sley legacy deprecation (safest, no breaking changes)
    ↓
Phase 2: Heddles breakdown (biggest readability win)
    ↓
Phase 3: Treadle-kit cleanup (improves cohesion)
    ↓
Phase 4: Deduplication (nice-to-have optimization)
```

Each phase is self-contained and can be done independently.

---

## Acceptance Criteria

- [ ] `pattern-matcher.ts` < 300 lines
- [ ] `core.ts` < 300 lines  
- [ ] No `@deprecated` functions have external consumers
- [ ] All existing tests pass
- [ ] No breaking changes to public API
- [ ] HOW_TO_LOOM.md updated to reflect new structure

---

## Notes

- **Keep `sley/method-pipeline.ts`** - this is the modern, preferred API
- **Keep `sley/operation-router.ts`** - distinct responsibility, good separation
- **Delete `sley/crud-mapping.ts` + `method-translator.ts`** after migration period
- The metaphor holds: heddles lift threads (enrich metadata), sley threads them (transform), treadle-kit weaves (generates)

---

*Created: 2026-02-25*
*Related: APP-007 (ddd-services treadle uses new pipeline)*
