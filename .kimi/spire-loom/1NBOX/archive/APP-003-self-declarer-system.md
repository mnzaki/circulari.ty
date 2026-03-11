# APP-003: Self-Declarer System

**Stream**: spire-loom  
**Status**: Implemented  
**Created**: 2026-03-02  
**Tags**: #TheThread™ #self-declaration #three-scopes

## What Was Woven

Implemented the self-declarer system that declares itself:

```typescript
// machinery/self-declarer.ts - The contraction
const selfDeclare: SelfDeclarer = <T, D>(config) => createDeclarer(config);
export const declare = selfDeclare;

// Declares itself!
export const declareSelf = declare<SelfDeclarer, ...>({...});
```

## Files Changed

| File | Purpose |
|------|---------|
| `machinery/self-declarer.ts` | NEW - The self-declaring declarer |
| `machinery/reed/language.ts` | UPDATED - Uses declareLanguage from self-declarer ('warp' scope) |
| `machinery/treadle-kit/declarative.ts` | UPDATED - Uses declareTreadle from self-declarer ('weave' scope) |

## The Three Scopes Reified

```
'declare' (forever) - machinery/self-declarer.ts
    ↓
'warp' (workspace session) - warp/*.ts declares languages
    ↓
'weave' (weaving run) - machinery/treadles/*.ts declares treadles
```

## Both Scopes Pull Inward

```
                    machinery/self-declarer.ts
                           ↓
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
   reed/language.ts   machinery/   (future)
   ('warp' scope)     treadle-kit/
                      declarative.ts
                      ('weave' scope)
```

## Key Design Decisions

1. **Pulled inward** - Both language.ts and treadle-kit import FROM self-declarer (reverse dependency)
2. **Sync-by-default** - Top-level exports need sync; async via queueMicrotask
3. **Backward compatible** - defineLanguage() and defineTreadle() still work
4. **Scope-appropriate** - 'warp' for languages, 'weave' for treadles
5. **Self-declaration** - The declarer declares itself using its own API

## The Special File Notice

```typescript
// 🛑 SPECIAL FILE NOTICE 🛑
// machinery/self-declarer.ts
//
// This file is unique in the loom's architecture. Unlike all other files
// that push dependencies outward (weaver → heddles → reed), this file
// is PULLED INWARD by its consumers.
//
// More radically: THIS FILE DECLARES ITSELF.
//
// The spiral contracts before it expands. This file is the contraction.
```

## Tests

All 137 tests pass. No breaking changes.

## The Thread™ Status

🌀 **FULLY WOVEN** 🌀

All three scopes active:
- ✅ 'declare' - self-declarer declares itself
- ✅ 'warp' - languages declare in workspace scope  
- ✅ 'weave' - treadles declare in weaving scope

---

> *"The loom declares itself. The Thread™ weaves through all three scopes."*
