---
from: Convergence discussion on leveraging LanguageType.toString() for convention-aware rendering in spire-loom templates
timestamp: 2026-03-11T18:45:00+01:00
stream: o19
---

# APP-004: LanguageType.toString() Convergence - Convention-Aware Rendering

> *Leverage LanguageType.toString() so templates use `method.returnType` directly and it renders with proper conventions*

## The Core Insight

**The Pattern:** Templates should use `{{ method.returnType }}` and `{{ method.name }}` directly. The `toString()` methods on `LanguageType` and `Name` should **automatically apply language conventions**.

**Current Gap:** `LanguageType.toString()` and `Name.toString()` don't use the language's declared conventions. They use hardcoded defaults (SCREAMING_SNAKE).

**The Fix:** Connect `LanguageThing.toString()` to the language's `conventions.naming` so it automatically renders correctly.

---

## What We're Building

### In Scope

- [ ] **Tune `LanguageType.toString()`** to apply type conventions:
  - Rust: `LanguageType` → `toString()` → `"String"`, `"Bookmark"` (PascalCase)
  - TypeScript: `"string"`, `"Bookmark"` (PascalCase for entities)
  
- [ ] **Tune `Name.toString()` for methods** to apply function conventions:
  - Rust method name → `"add_bookmark"` (snake_case)
  - TypeScript method name → `"addBookmark"` (camelCase)
  
- [ ] **Fix variant separator** in `prependedKeywords` (comma → space)
  - `pub,async fn` → `pub async fn`

- [ ] **Update templates** to use direct rendering:
  - `{{ method.name }}` instead of `{{ method.functionName }}`
  - `{{ method.returnType }}` instead of `{{ method.returnTypeName }}`
  - Let `toString()` handle convention application

### Out of Scope (For Now)

- Major loom architecture changes
- New template filter syntax
- Method variance overhaul

---

## Context & Constraints

### What We Know

**Current Architecture (Working):**
```typescript
// Language definition declares conventions
conventions: {
  naming: {
    function: 'snake_case',    // ← Declared but not used by toString()
    type: 'PascalCase',        // ← Declared but not used by toString()
  }
}

// Type factory creates types with proper names
class RustTypeFactory {
  string = new LanguageType('String', 'String::new()', true);
  // ...
}

// Template renders
{{ method.name }}           // → ADD_BOOKMARK (wrong - uses defaultCase)
{{ method.returnType }}     // → STRING (wrong - uses toString())
```

**Target Architecture:**
```typescript
// Same declarations...
// But toString() now uses conventions:

{{ method.name }}           // → add_bookmark (uses function convention)
{{ method.returnType }}     // → String (uses type convention)
```

### Key Files to Modify

| File | Line(s) | Change |
|------|---------|--------|
| `machinery/reed/language/types.ts` | ~186-218 | `asContextWith()` wrapper toString() uses conventions |
| `machinery/reed/method.ts` | ~96-100 | Fix `prependedKeywords` separator |
| `warp/rust.ts` | ~443-616 | Verify conventions are declared |
| `warp/typescript.ts` | ~308-462 | Verify conventions are declared |
| `bobbin/tauri/commands.rs.mejs` | ~12-18 | Simplify to use `{{ method.name }}` |
| `bobbin/tauri/platform.rs.mejs` | ~36-38 | Simplify template |

### The Critical Change

**In `asContextWith()` - `types.ts`:**

```typescript
// Current (lines ~186-218):
toString() {
  const defaultCase = ((nameObj).defaultCase as string) ?? 'SCREAMING_SNAKE';
  // Always uses SCREAMING_SNAKE!
}

// Fix:
toString() {
  // Use language convention instead of defaultCase
  const convention = this.lang?.conventions?.naming?.[this.context] ?? this._name.defaultCase;
  return this._name.apply(convention);
}
```

**The `context` would be:**
- `'function'` for method names
- `'type'` for type names
- `'parameter'` for param names

---

## The Plan

### Phase 1: Add Context-Aware toString()

**Goal:** `LanguageThing.toString()` applies conventions based on usage context

- [ ] Modify `asContextWith()` to pass context to wrapper:
  ```typescript
  // For method name:
  context.name = {
    toString() { return method.name.apply(lang.conventions.naming.function); }
  };
  
  // For return type:
  context.returnType = {
    toString() { return method.returnType.name.apply(lang.conventions.naming.type); }
  };
  ```

- [ ] Add context tracking to `LanguageThing`:
  ```typescript
  class LanguageThing {
    protected _context?: string;  // 'function', 'type', 'parameter', etc.
    
    toString(): string {
      if (this._lang && this._context) {
        const convention = this._lang.conventions.naming[this._context];
        return this._name.apply(convention);
      }
      return this._name.toString();
    }
  }
  ```

**Success:** Templates using `{{ method.name }}` and `{{ method.returnType }}` get properly cased output

### Phase 2: Fix Variant Separator

**Goal:** `pub async` not `pub,async`

- [ ] One-line fix in `method.ts` line ~100:
  ```typescript
  .join(' ')  // instead of .join(',')
  ```

**Success:** Function signatures have proper keyword spacing

### Phase 3: Simplify Templates

**Goal:** Templates use direct property access

- [ ] Update `commands.rs.mejs`:
  ```mejs
  // From:
  {{ method.pub.async.signature }}
  
  // To:
  pub async fn {{ method.name }}{{ method.params }} -> {{ method.returnType }}
  ```

- [ ] Update `platform.rs.mejs`:
  ```mejs
  // From:
  {{ method.rs.signature }}
  
  // To:
  fn {{ method.name }}{{ method.params }} -> {{ method.returnType }};
  ```

**Success:** Templates are simpler and clearer

### Phase 4: Validation

**Goal:** Generated code compiles

- [ ] Run `pnpm spire-loom`
- [ ] Check `commands.rs` has:
  ```rust
  pub async fn add_bookmark(url: String, title: String) -> ()
  ```
- [ ] Check `platform.rs` has:
  ```rust
  fn add_bookmark(url: String, title: String) -> ();
  ```
- [ ] Run `cargo check` in foundframe-tauri

---

## Success Criteria

- [ ] `{{ method.name }}` renders as `add_bookmark` (snake_case) for Rust
- [ ] `{{ method.returnType }}` renders as `Bookmark` (PascalCase) for Rust
- [ ] `{{ method.returnType }}` renders as `string` (lowercase) for TypeScript primitives
- [ ] Variant keywords separate with spaces: `pub async fn` not `pub,async fn`
- [ ] Templates simplified to use direct property access
- [ ] Generated Rust code compiles
- [ ] Generated TypeScript code type-checks

---

## Conservation Notes

**Key Insight:** The loom already has all the pieces:
- ✅ Conventions declared in language definitions
- ✅ `Name.apply(case)` method for case conversion
- ✅ `asContextWith()` for template context
- ✅ `LanguageType.toString()` infrastructure

**The missing link:** Connecting these pieces so `toString()` automatically applies the right convention based on context (function, type, parameter).

**Pattern for Future:** This same approach can extend to:
- Variable names (`conventions.naming.variable`)
- Constants (`conventions.naming.const`)
- Fields (`conventions.naming.field`)
- Generics (`conventions.naming.generic`)

**The Principle:** Templates declare *what* (name, type), not *how* (case). The language definition declares *how* (conventions). The loom connects them via `toString()`.

---

*Created: 2026-03-11T18:45:00+01:00*
*Stream: o19*
*Spiral position: Convention-aware rendering via LanguageType.toString()*
