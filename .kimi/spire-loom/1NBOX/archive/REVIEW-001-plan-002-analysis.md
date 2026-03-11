# REVIEW-001: Analysis of PLAN-002 Type-Safe Language System

**Stream**: spire-loom  
**Status**: Review Complete - Partial Alignment with Issues  
**Created**: 2026-03-02  

## Executive Summary

PLAN-002 introduces valuable type-safety improvements but **misaligns with the core architectural needs** identified in ANALYSIS-001 through ANALYSIS-003. The plan focuses heavily on WARP decorator metadata while under-addressing the critical code-generation integration that was the original motivation for declarative language support.

**Verdict**: The plan needs significant revision before implementation. Key concerns:
1. Deprecating `warp/` decorators would break existing WARP files
2. Missing integration with `transformMethods()` and code generation
3. Missing spiraler class integration for type-safe spiral navigation
4. Over-complex factory-based decorator approach

---

## Detailed Analysis

### 1. What's Good ✅

#### Type-Safe Language Registry
```typescript
export class LanguageRegistry {
  register<LangConfig, FieldMeta, ClassMeta>(...)
  get<LangConfig, FieldMeta, ClassMeta>(id: string)
}
```
This pattern is sound and aligns with our registry approach. The generic parameters enable type-safe language retrieval.

#### Template Variable Types
The `BobbinTemplateVars` interface with `RustTemplateVars` and `TypeScriptTemplateVars` provides useful documentation for template authors, even if EJS can't enforce types at runtime.

#### Module Load Registration
```typescript
// reed/index.ts
import './rust.js';  // Auto-registers
import './typescript.js';
```
This is a clean registration pattern that avoids explicit registration calls.

---

### 2. Critical Issues 🚨

#### Issue 2.1: Deprecating warp/ Would Break Everything

The plan suggests:
```typescript
// Deprecated (Phase 4)
// warp/rust.ts - Use reed/rust.ts instead
// warp/typescript.ts - Use reed/typescript.ts instead
```

**Problem**: WARP files (like `foundframe/WARP.ts`) use decorators directly:

```typescript
// foundframe/WARP.ts
import { loom } from '@o19/spire-loom';

@loom.rust.Struct
export class Foundframe {
  @loom.rust.Mutex
  @loom.rust.Option
  thestream = TheStream;
}
```

Moving these to `reed/` would require ALL WARP files to change imports. This is a **breaking change across all circulari.ty projects**.

**Recommendation**: Keep `warp/` as the public API. Use `reed/` (or `machinery/bobbin/languages/`) as the **implementation** that `warp/` re-exports from.

---

#### Issue 2.2: Missing Code Generation Integration

The original ANALYSIS files identified the **core problem**: Adding a language requires modifying `machinery/bobbin/code-generator.ts` in multiple places:

```typescript
// Current hardcoded pattern (PROBLEMATIC)
function transformMethods(methods: RawMethod[], language: Language) {
  switch (language) {
    case 'kotlin': return transformForKotlin(methods);
    case 'rust': return transformForRust(methods);
    // ... add case here for new language
  }
}
```

**PLAN-002 does not address this**. It focuses on WARP decorator metadata but ignores:
- `transformForLanguage()` registration
- `detectLanguage()` from file extensions
- `getStubReturn()` for default values
- Type mappings for code generation

**Recommendation**: The language definition MUST include code generation transforms:

```typescript
interface LanguageDefinition<M extends RawMethod> {
  // ... WARP metadata ...
  
  // Code generation (MISSING from PLAN-002)
  codeGen: {
    fileExtensions: string[];
    transform: (methods: RawMethod[]) => M[];
    typeMappings: TypeMapping[];
    getStubReturn: (rt: string, isColl: boolean) => string;
  }
}
```

---

#### Issue 2.3: Missing Spiraler Integration

ANALYSIS-003 emphasized passing **actual Spiraler classes** for type inference:

```typescript
// From ANALYSIS-003
warp: {
  spiralers: {
    android: RustAndroidSpiraler,  // Class, not description
    desktop: RustDesktopSpiraler,
  }
}
```

PLAN-002 has no equivalent. The spiraler system enables:
```typescript
const foundframe = loom.spiral(Foundframe);
foundframe.android  // TypeScript infers: RustAndroidSpiraler
```

**Recommendation**: Language definition must include spiraler class registration for type-safe navigation.

---

#### Issue 2.4: Over-Complex Decorator Factories

PLAN-002 proposes:
```typescript
createFieldDecorator<Options>(
  name: string,
  apply: (target, context, options) => FieldMeta
): PropertyDecorator
```

This adds a **factory layer** that doesn't exist in the current codebase. Current decorators are simple functions:

```typescript
// Current working implementation (warp/rust.ts)
export function Mutex<T>(target: T, context: ClassFieldDecoratorContext): void {
  // Direct implementation - no factory needed
}
```

**Question**: What does the factory pattern buy us? The current decorators already work and are type-safe.

**Recommendation**: Pass existing decorator functions directly instead of wrapping in factories:

```typescript
// Simpler approach from ANALYSIS-003
warp: {
  fieldDecorators: {
    Mutex,    // Direct reference
    Option,   // Direct reference
  }
}
```

---

#### Issue 2.5: Type Parameter Confusion

```typescript
// PLAN-002
export interface LanguageDefinition<LangConfig, FieldMeta, ClassMeta>
```

**Problem**: `LangConfig` and `ClassMeta` are separate, but in practice they're the same (class-level metadata). The interface uses 3 type parameters where 2 might suffice:

```typescript
// Simpler alternative
interface LanguageDefinition<FieldMeta, ClassMeta> {
  // LangConfig is just ClassMeta
}
```

Also, the generic parameters are **invariant** - you can't easily mix languages in collections.

---

#### Issue 2.6: EJS and Type Safety

```typescript
// PLAN-002
typeMap: Map<string, string>;  // TS type -> Rust type
```

**Reality check**: EJS templates are dynamic strings. Type safety helps at **author time** (IDE support) but not at **runtime** (EJS rendering). The `Map` approach is less useful than direct helper functions:

```typescript
// More useful in templates
rust: {
  fieldType: (field) => string,  // Callable in template
  wrapOption: (type) => string,
}
```

---

### 3. Architectural Misalignment

| Aspect | PLAN-002 Approach | ANALYSIS-003 Approach | Issue |
|--------|-------------------|----------------------|-------|
| **Directory** | New `reed/` top-level | `machinery/bobbin/languages/` | PLAN-002 adds top-level complexity |
| **Decorators** | Factory methods | Direct function references | PLAN-002 adds unnecessary abstraction |
| **Code Gen** | Not addressed | Core requirement | PLAN-002 misses the main point |
| **Spiralers** | Not addressed | Class-based type inference | PLAN-002 doesn't enable type-safe spiral |
| **warp/ API** | Deprecate | Keep as public facade | PLAN-002 would break existing code |

---

### 4. What Should Be Preserved

From PLAN-002, keep:

1. **Type-safe registry** - `LanguageRegistry<LangConfig, FieldMeta, ClassMeta>`
2. **Module load registration** - Auto-register on import
3. **Template variable documentation** - Even if not enforced at runtime

---

### 5. Revised Architecture Recommendation

```
machinery/bobbin/languages/
├── define-language.ts     # Core interface + registry
├── index.ts               # Auto-registers all languages
├── rust.ts                # Rust language definition
│   ├── WARP exports (re-export from warp/)
│   ├── Code generation
│   └── Spiraler classes
└── typescript.ts          # TypeScript language definition

warp/
├── rust.ts                # Public API (re-exports from languages/)
├── typescript.ts          # Public API
└── spiral/
    └── ...                # Spiralers (could move to languages/)
```

### Revised Interface

```typescript
// machinery/bobbin/languages/define-language.ts

export interface LanguageDefinition<
  FieldMeta = unknown,
  ClassMeta = unknown
> {
  // Identification
  name: string;
  
  // ========== Code Generation ==========
  codeGen: {
    fileExtensions: string[];
    transform: (methods: RawMethod[]) => any[];
    typeMappings: Array<{ tsType: string; targetType: string }>;
    getStubReturn: (returnType: string, isCollection: boolean) => string;
  };
  
  // ========== WARP Integration ==========
  warp: {
    /** ExternalLayer subclass */
    externalLayerClass: new () => ExternalLayer;
    
    /** Field decorators (direct functions, not factories) */
    fieldDecorators: Record<string, PropertyDecorator>;
    
    /** Class decorator (direct function) */
    classDecorator: ClassDecorator | ((options?: any) => ClassDecorator);
    
    /** Core ring class and factory */
    core: {
      coreClass: new (...args: any[]) => CoreRing<any, any, any>;
      createCore: (layer?: any) => any;
    };
    
    /** 
     * Spiraler classes for type-safe navigation.
     * Key is target ring name (e.g., 'android', 'desktop').
     */
    spiralers: Record<string, new (innerRing: SpiralRing) => Spiraler>;
    
    /** Expose at loom.spiral.{language} */
    exposeBaseFactory?: boolean;
  };
}

// Registration function (simpler than PLAN-002)
export function defineLanguage<
  FieldMeta,
  ClassMeta
>(def: LanguageDefinition<FieldMeta, ClassMeta>): LanguageDefinition<FieldMeta, ClassMeta>;
```

---

### 6. Migration Path (Revised)

**Phase 1**: Create `machinery/bobbin/languages/` with `defineLanguage()`
**Phase 2**: Move Rust code generation transforms to `languages/rust.ts`
**Phase 3**: Update `warp/rust.ts` to re-export from languages/
**Phase 4**: Same for TypeScript
**Phase 5**: Update `code-generator.ts` to use language registry

**No breaking changes** - existing WARP files continue to work.

---

## Conclusion

PLAN-002 has good intentions (type safety) but **misses the mark** on:
1. **Code generation integration** - the original problem
2. **Spiraler type inference** - enables IDE autocomplete
3. **Backward compatibility** - would break existing WARP files
4. **Simplicity** - factory abstractions aren't necessary

**Recommendation**: Incorporate the type-safe registry pattern from PLAN-002 into the architecture described in ANALYSIS-003, but:
- Keep `warp/` as the public API
- Focus on code generation transforms, not just WARP metadata
- Include spiraler classes for type-safe navigation
- Use direct function references, not factories

---

> *"The loom weaves what the warp intends, but the reed guides the pattern."*
