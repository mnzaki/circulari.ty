---
from: Investigation of DDD template language propagation failure
related: APP-004, ddd-services treadle
discovered: 2026-03-11
---

# APP-007: Template Language Context - The Arraying Trap

## The Problem

DDD service/port templates were failing with "No object type constructor in this language!" when calling `method.crud.withObjectParams('data').signature`.

**Root Cause:** The `ddd-services` treadle was converting methods to an array using `toArray(ctx.methods)` and passing them in the template context:

```typescript
// WRONG - captures language at conversion time
const allMethods = toArray(ctx.methods);
return [{
  template: 'ddd/port.ts.mejs',
  context: { service, methods: allMethods }  // ❌ Stale language
}];
```

When Android treadle ran first, it set Rust as primary. The DDD treadle then converted methods (with Rust language) BEFORE `generateCode` set TypeScript.

## The Solution

**Do NOT pass methods in template context.** `generateCode` automatically sets the correct language based on template extension and provides methods via `locals.methods`:

```typescript
// CORRECT - let generateCode handle it
return [{
  template: 'ddd/port.ts.mejs',
  context: { service }  // ✅ No methods - generateCode sets them
}];
```

Template accesses via:
```typescript
const methods = locals.methods || [];  // ✅ Fresh from generateCode with correct language
```

## The Pattern

| Anti-Pattern | Pattern |
|-------------|---------|
| `toArray(ctx.methods)` in treadle | Use `locals.methods` in template |
| Pass methods in context | Let `generateCode` inject them |
| Pre-convert BoundQuery | Access lazy query in template |

## Why This Works

1. `generateCode` detects language from template filename (`.ts.mejs` → TypeScript)
2. Calls `options.methods.setLang(typescript)` before rendering
3. Template receives `locals.methods` with correct language set
4. Method variants (`crud`, `withObjectParams`) inherit correct language

## Files Changed

- `machinery/treadles/ddd-services.ts` - Removed `methods: allMethods` from context
- `warp/typescript.ts` - Added `object` type constructor for `withObjectParams`

## Conservation Note

This is a subtle architectural trap: eager evaluation (converting to array) vs lazy evaluation (keeping BoundQuery). The spiral teaches: **convert at the last moment, at the point of use.**

> *"The array binds early; the query binds late. Late binding preserves optionality."*

---

## Documentation

Full guide with examples and detailed explanation: [HOW_TO_LOOM.md - The Arraying Trap](../HOW_TO_LOOM.md#the-arraying-trap-methods-in-treadle-context)

---

*Related: APP-004 (Iterator-Based Architecture), HOW_TO_LOOM.md (Template Data section)*
