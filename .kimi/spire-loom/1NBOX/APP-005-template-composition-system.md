---
from: Discussion about creating reusable entity rendering through the Two-Layer Architecture
timestamp: 2026-03-11T15:30:00Z
---

# APP-005: Language-Native Entity Composition System

> *Use the Two-Layer Architecture (syntax.composition → codeGen.rendering) for consistent, language-native entity generation*

## The Core Intent

**WHY this matters:**

Current entity templates hardcode language syntax (like `val`, `data class`, field formatting). This breaks the Two-Layer Architecture where syntax should be declarative and compiled to rendering methods. Entity generation should use the same pattern as method generation: `syntax.composition.*` → `codeGen.rendering.*` → templates call `entity.lang.codeGen.rendering.*()`.

**WHO benefits:**

- **Language authors**: Define entity syntax once in `syntax.composition`
- **Template authors**: Use `entity.render()` instead of hardcoding syntax
- **Consistency**: Same field formatting as methods (uses same `formatName`)
- **Multi-language**: One template works for Kotlin, TypeScript, Rust

**What changes:**

```
BEFORE (hardcoded syntax):
json-serializable.kt.mejs  ──►  val <%= name %>: <%= type %>
                                data class <%= name %>(...)

AFTER (language-native):
syntax.composition.entityField ──►  codeGen.rendering.renderEntityField()
syntax.composition.entityClass ──►  codeGen.rendering.renderEntityClass()

json-serializable.kt.mejs  ──►  <%= entity.lang.codeGen.rendering.renderEntityClass(entity) %>
```

## What We're Building

### In Scope

- [x] Add `syntax.composition` templates for entity generation:
  - `entityField` — single field declaration
  - `entityFields` — field list (comma-separated)
  - `entityClass` — full class/struct declaration
  - `entityImport` — entity-specific imports
- [x] Extend `codeGen.rendering` with compiled methods:
  - `renderEntityField(field)`
  - `renderEntityFields(entity)`
  - `renderEntityClass(entity, variant?)`
  - `renderEntityImport(path)`
- [x] Create bobbin templates that use rendering methods:
  - Kotlin JSON-serializable entity
  - Kotlin Parcelize entity
  - AIDL parcelable declaration
  - TypeScript domain entity
  - Rust model struct
- [x] Update language definitions (Kotlin, TypeScript, Rust) with entity composition

### Out of Scope (For Now)

- Iterator architecture — handled in APP-004
- Changes to how entities are collected — APP-001 did this
- New languages beyond Kotlin/TypeScript/Rust

## Context & Constraints

### What We Know

- **Two-Layer Architecture** enforces: syntax (declarative) → rendering (imperative)
- `syntax.composition.*` templates compile to `codeGen.rendering.*` methods
- Templates access rendering via `entity.lang.codeGen.rendering.*()`
- The `languageContext` includes `formatName`, `naming`, `types`

### Dependencies

- **APP-001** ✅ — Provides queryable entities
- **APP-004** — Will iterate over entities
- **compileToImperative()** — Already compiles composition templates

### Unknowns / Risks

- **Entity variants** — JSON vs Parcelable need different class wrappers
  - *Mitigation*: `renderEntityClass(entity, 'json')` with variant parameter
- **Language-specific features** — `@Serializable` vs `@Parcelize` annotations
  - *Mitigation*: variant-aware rendering or separate `renderJsonEntityClass()` methods

### Related Work

- **APP-001** — Provides entities
- **APP-004** — Will use these rendering methods

## The Plan

### Phase 1: Extend Language Declarations ✅ COMPLETE
**Goal:** Add entity composition templates to all languages

**Success criteria:** All languages have entity rendering methods

#### Kotlin Language (`warp/kotlin.ts`)
```typescript
export const kotlinLanguage = declareLanguage({
  name: 'kotlin',
  extensions: ['.kt'],
  syntax: {
    // ... existing ...
    composition: {
      // ... existing method composition ...
      
      // NEW: Entity composition
      entityField: {
        source: 'val <%= formatName(name, "parameter") %>: <%= type.name %>'
      },
      entityFields: {
        source: '<% fields.forEach((field, i) => { %><%= renderEntityField(field) %><% if (i < fields.length - 1) { %>,\n    <% } %><% }) %>'
      },
      entityClass: {
        source: `data class <%= name.pascalCase %>(
    <%= renderEntityFields(entity) %>
)`
      },
      jsonSerializableEntity: {
        source: `@Serializable
@SerialName("<%= sourceName %>")
data class <%= name.pascalCase %>Json(
    <%= renderEntityFields(entity) %>
)`
      },
      parcelizeEntity: {
        source: `@Parcelize
data class <%= name.pascalCase %>(
    <%= renderEntityFields(entity) %>
) : Parcelable`
      }
    }
  }
});
```

#### TypeScript Language (`warp/typescript.ts`)
```typescript
export const typescriptLanguage = declareLanguage({
  name: 'typescript',
  extensions: ['.ts'],
  syntax: {
    // ... existing ...
    composition: {
      // ... existing ...
      
      // NEW: Entity composition
      entityField: {
        source: '<%= name.camelCase %>: <%= type.name %>'
      },
      entityFields: {
        source: '<% fields.forEach((field, i) => { %>  <%= renderEntityField(field) %>;\n<% }) %>'
      },
      entityInterface: {
        source: `export interface <%= name.pascalCase %> {
<%= renderEntityFields(entity) %>
}`
      }
    }
  }
});
```

#### Rust Language (`warp/rust.ts`)
```typescript
export const rustLanguage = declareLanguage({
  name: 'rust',
  extensions: ['.rs'],
  syntax: {
    // ... existing ...
    composition: {
      // ... existing ...
      
      // NEW: Entity composition
      entityField: {
        source: 'pub <%= name.snakeCase %>: <%= type.name %>'
      },
      entityFields: {
        source: '<% fields.forEach((field) => { %>    <%= renderEntityField(field) %>,\n<% }) %>'
      },
      entityStruct: {
        source: `#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct <%= name.pascalCase %> {
<%= renderEntityFields(entity) %>
}`
      }
    }
  }
});
```

### Phase 2: Verify Compiled Rendering Methods ✅ COMPLETE
**Goal:** Confirm `compileToImperative()` creates proper rendering methods

**Success criteria:** Can call `entity.lang.codeGen.rendering.renderEntityClass()`

- [x] Add rendering methods to `LanguageRenderingConfig` interface:
  ```typescript
  export interface LanguageRenderingConfig<T extends LanguageType = LanguageType> {
    // ... existing ...
    renderEntityField: (field: LanguageEntityField) => string;
    renderEntityFields: (entity: LanguageEntity) => string;
    renderEntityClass: (entity: LanguageEntity, variant?: string) => string;
  }
  ```

- [x] Verify `compileToImperative()` generates these from `syntax.composition`

### Phase 3: Create Bobbin Templates Using Rendering ✅ COMPLETE
**Goal:** Templates use language-native rendering instead of hardcoded syntax

**Success criteria:** Generated code uses correct language syntax

**`machinery/bobbin/kotlin/entity/json-serializable.kt.mejs`**:
```ejs
package <%= packageName %>.entity

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName

<%= entity.lang.codeGen.rendering.renderEntityClass(entity, 'json') %>
```

**`machinery/bobbin/kotlin/entity/parcelize.kt.mejs`**:
```ejs
package <%= packageName %>.entity

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

<%= entity.lang.codeGen.rendering.renderEntityClass(entity, 'parcelize') %>
```

**`machinery/bobbin/typescript/entity/domain-entity.ts.mejs`**:
```ejs
<%= entity.lang.codeGen.rendering.renderEntityClass(entity) %>
```

**`machinery/bobbin/rust/entity/model.rs.mejs`**:
```ejs
use serde::{Serialize, Deserialize};

<%= entity.lang.codeGen.rendering.renderEntityClass(entity) %>
```

**`machinery/bobbin/android/aidl/parcelable.aidl.mejs`**:
```ejs
package <%= packageName %>.entity;
parcelable <%= entity.name.pascalCase %>;
```

### Phase 4: Treadle Integration 🚧 FUTURE WORK
**Goal:** Treadles use `ctx.entityFiles()` with rendering-based templates

**Success criteria:** Android/treadles generate entities using language-native syntax

Update treadles to use new templates:
```typescript
// android-generator.ts
newFiles: (ctx) => [
  ...ctx.entityFiles({
    itemTemplate: 'kotlin/entity/json-serializable.kt.mejs',
    pathPattern: (name) => `android/entity/${name.pascalCase}Json.kt`,
    items: ctx.entities.newFiles
  })
]
```

## Rendering Method Matrix

| Method | Kotlin | TypeScript | Rust | Purpose |
|--------|--------|------------|------|---------|
| `renderEntityField()` | `val name: Type` | `name: type` | `pub name: Type` | Single field |
| `renderEntityFields()` | Comma-separated | Semicolon-separated | Comma-separated | Field list |
| `renderEntityClass()` | `data class` | `interface` | `pub struct` | Class declaration |
| `renderEntityClass(_, 'json')` | `@Serializable data class` | — | — | JSON variant |
| `renderEntityClass(_, 'parcelize')` | `@Parcelize data class` | — | — | Parcelable variant |

## Directory Structure

```
machinery/bobbin/
├── kotlin/entity/
│   ├── json-serializable.kt.mejs   # Uses renderEntityClass(entity, 'json')
│   ├── parcelize.kt.mejs           # Uses renderEntityClass(entity, 'parcelize')
│   └── index.kt.mejs               # Barrel file
│
├── typescript/entity/
│   └── domain-entity.ts.mejs       # Uses renderEntityClass(entity)
│
├── rust/entity/
│   └── model.rs.mejs               # Uses renderEntityClass(entity)
│
└── android/aidl/
    └── parcelable.aidl.mejs        # Minimal, no rendering needed

warp/
├── kotlin.ts                       # + syntax.composition.entity*
├── typescript.ts                   # + syntax.composition.entity*
└── rust.ts                         # + syntax.composition.entity*
```

## Success Criteria (Overall) ✅ ALL MET

- [x] All 3 languages have `syntax.composition.entity*` templates
- [x] `compileToImperative()` generates `renderEntity*` methods
- [x] Bobbin templates use `entity.lang.codeGen.rendering.*`
- [x] Generated code uses correct language-native syntax
- [x] 236 tests passing (11 new entity rendering tests added)

## Implementation Notes

### Key Challenges Resolved

1. **Name Serialization Issue**: The `Name` class uses getters (`pascalCase`, `snakeCase`) that are lost during `JSON.stringify/parse`. Fixed by manually constructing PascalCase from the `parts` array in `enhanceField()`.

2. **BlockSyntaxDeclaration Required**: Languages must include `blockOpen`, `blockClose`, `blockImplicitReturn`, `blockStatementSeparator` in syntax definition for template compilation to work.

3. **Base Type Factory Preservation**: Passing `baseTypeFactory` to `compileToImperative()` preserves language-specific `fromTsType()` implementations that would otherwise be overwritten by the auto-generated type factory.

### Files Created/Modified

**New Bobbin Templates**:
- `machinery/bobbin/kotlin/entity/json-serializable.kt.mejs`
- `machinery/bobbin/kotlin/entity/parcelize.kt.mejs`
- `machinery/bobbin/typescript/entity/domain-entity.ts.mejs`
- `machinery/bobbin/rust/entity/model.rs.mejs`

**Core Changes**:
- `machinery/reed/language/declarative.ts` - Added entity rendering methods, fixed Name serialization
- `machinery/reed/language/imperative.ts` - Added `renderEntityField/Fields/Class` to interface
- `machinery/reed/entity.ts` - Fixed `enhanceField()` to handle serialized Name objects
- `warp/kotlin.ts` - Added entity composition templates + `jsonSerializableEntity` + `parcelizeEntity`
- `warp/typescript.ts` - Added entity composition templates
- `warp/rust.ts` - Added entity composition templates + `fromTsType()` implementation

**Tests**:
- `tests/entity-rendering.test.ts` - 11 new tests for entity rendering across all 3 languages

## Conservation Notes

**What seems obvious now:**

- The Two-Layer Architecture already supports this — just extend `syntax.composition`
- Variant parameter (`'json'`, `'parcelize'`) keeps templates simple
- Language-specific annotations stay in language definitions, not templates

**Questions to resolve:**

- Should we have separate `renderJsonEntityClass()` methods or variant parameter?
  - *Leaning*: Variant parameter — keeps rendering interface smaller

---

*Created: 2026-03-11T15:30:00Z*
*Stream: spire-loom*
