---
from: Comprehensive survey of generated code in spire directories across foundframe-android, foundframe-tauri, and foundframe-front
timestamp: 2026-03-11T18:00:00+01:00
stream: o19
---

# APP-001: Architecture Survey - Generated Code State & Alignment

> *Survey of generated spire/ code reveals: methods aren't being collected from Management Imprints, causing empty iterations in templates*

## Executive Summary

**Management Imprints exist** in `o19/loom/*.ts` and are well-formed. **The loom generates files**, but they contain **empty method bodies, broken exports, and missing entity names**. The root cause appears to be that `ctx.methods` and `ctx.entities` aren't being populated from the discovered Management classes.

---

## Current State: Three Spire Directories

### 1. foundframe-android (Foreground Service)

**Status:** ⚠️ **Partial - JNI bridge incomplete**

| Component | State | Issues |
|-----------|-------|--------|
| `RadicleService.kt` | ✅ Complete | Foreground service skeleton good |
| `RustExternalLayerRadicleService.kt` | ⚠️ Generated | Has JNI native method declarations but **no AIDL method implementations** |
| `IRadicleService.aidl` | ❌ Empty | Interface has **no methods** - just empty braces `{}` |
| `lib.rs` (JNI bridge) | ⚠️ Stub | `initialize_service()` is `unimplemented!()` |

**Key Finding:** The template generates JNI native declarations and Kotlin service skeleton, but the AIDL interface itself is empty. This suggests the Android generator treadle isn't receiving method metadata.

---

### 2. foundframe-tauri (Tauri Plugin)

**Status:** 🔴 **Broken - Empty commands, broken index files**

| Component | State | Issues |
|-----------|-------|--------|
| `commands.rs` | ❌ Empty | Only 21 lines - **no actual command functions** generated |
| `desktop.rs` | ⚠️ Stub | Platform struct exists but **no method implementations** |
| `ts/commands/index.ts` | 🔴 Broken | 8 duplicate blocks with **missing entity names**: `//  commands` |
| `ts/commands/*.commands.ts` | ✅ Per-entity | Individual command files look correct (e.g., `bookmark.commands.ts`) |
| `ts/adaptors/index.ts` | 🔴 Broken | Missing entity names: `import { TauriAdaptor } from './.adaptor.js'` |
| `ts/adaptors/*.adaptor.ts` | ⚠️ Partial | Has some methods but incomplete signatures |

**Key Finding:** The per-entity command files (`bookmark.commands.ts`, etc.) look correct, but the **index files are completely broken** - iterating over `entities` that have no names. The Rust `commands.rs` is also empty.

**Broken Index Pattern:**
```typescript
//  commands  ← NO ENTITY NAME!
export {
  create, getById, update, delete, lists,  ← generic names, no entity prefix
} from './.commands.js';  ← WRONG PATH - should be './bookmark.commands.js'
```

---

### 3. foundframe-front (DDD Services)

**Status:** 🔴 **Empty - Ports and Services have no methods**

| Component | State | Issues |
|-----------|-------|--------|
| `ports/*.port.ts` | ❌ Empty | Interfaces declared but **no method signatures** |
| `services/*.service.ts` | ❌ Empty | Classes implement ports but **no actual methods** |
| `ports/index.ts` | ✅ Good | Properly re-exports all ports |
| `services/index.ts` | ✅ Good | Properly re-exports all services |

**Example - `bookmark.port.ts`:**
```typescript
export interface BookmarkReadPort {
  // EMPTY - no methods
}

export interface BookmarkWritePort {
  // EMPTY - no methods
}
```

**Example - `bookmark.service.ts`:**
```typescript
export class BookmarkService implements BookmarkPort {
  // EMPTY - no methods implemented
}
```

**Key Finding:** Files are generated for all entities, but **method signatures aren't being rendered** into the templates.

---

## Root Cause Analysis

### Common Pattern: Empty Iterations

All three packages show the same pattern - files are created, loops run, but **iterations produce empty content**:

1. **foundframe-android**: AIDL interface has no methods → `{% for method in methods %}` produced nothing
2. **foundframe-tauri index files**: 8 iterations but no entity names → `{{ entity.name }}` was undefined
3. **foundframe-front ports**: Sections for read/write/delete operations but no actual method signatures

### Likely Causes

| Issue | Evidence | Impact |
|-------|----------|--------|
| **Empty `ctx.methods`** | Empty `commands.rs`, empty AIDL | No Rust/Kotlin commands generated |
| **Empty `ctx.entities`** or wrong structure | Broken index files, missing names | Index exports are broken |
| **Template context mismatch** | `entity.name` undefined, but per-entity files work | Index templates vs per-entity templates receive different data |
| **Method transformation not running** | Ports have sections but no signatures | DDD treadle may not be transforming methods properly |

---

## What Needs Fixing

### Priority 1: foundframe-tauri Index Files (Broken)

**Problem:** Template receives entities but wrong structure

**Evidence:**
```typescript
// Template expects: entity.name.pascalCase
// Treadle provides: { name: e, pascal: pascalCase(e), camel: camelCase(e) }

// Result: entity.name is undefined → empty output
```

**Fix Options:**
- Option A: Update treadle in `tauri-adaptor.ts` to provide `entity.name.pascalCase`
- Option B: Update template to use `entity.pascal` / `entity.camel`

### Priority 2: Empty Methods in Ports/Services (foundframe-front)

**Problem:** DDD treadle isn't populating method signatures

**Evidence:** Port files have section comments but no method declarations

**Fix:** Debug `generateDddServices` treadle to ensure `ctx.methods` is populated and transformed

### Priority 3: Empty AIDL Interface (foundframe-android)

**Problem:** Android generator treadle has no methods

**Evidence:** `IRadicleService.aidl` is empty interface

**Fix:** Verify Android treadle receives platform methods from Management Imprints

### Priority 4: Empty Rust Commands (foundframe-tauri)

**Problem:** `commands.rs` has imports but no command functions

**Evidence:** Only 21 lines - just header comments and imports

**Fix:** Verify `tauriPluginTreadle` receives methods with `filter: 'platform'`

---

## Architecture Alignment: What's Working vs What's Not

| Layer | Working | Not Working |
|-------|---------|-------------|
| **Management Imprints** | ✅ Files exist, well-formed | — |
| **Loom Discovery** | ✅ Files discovered | ⚠️ Methods not collected? |
| **File Generation** | ✅ Files created | — |
| **Content Generation** | ⚠️ Per-entity files OK | 🔴 Index files broken |
| **Method Population** | 🔴 Empty everywhere | — |
| **Rust Commands** | 🔴 Empty | — |
| **TypeScript Ports** | 🔴 Empty interfaces | — |
| **Kotlin AIDL** | 🔴 Empty interface | — |

---

## Conservation Notes

**What the survey reveals:**

1. **The Management Imprints are correct** - this isn't a domain modeling problem
2. **Generation pipeline runs** - files are created in correct locations
3. **The gap is in context population** - `ctx.methods` and `ctx.entities` aren't reaching templates with expected structure
4. **Per-entity templates work better than index templates** - suggests context structure inconsistency

**Key Insight:** The issue is likely in how the **treadles populate template context**, not in the Management Imprints or templates themselves.

---

## Recommended Next Steps

### Phase 1: Debug Context Population

Add logging to understand what's in `ctx`:

```typescript
// In tauri-adaptor.ts
newFiles: [(ctx) => {
  console.log('tauri-adaptor context:', {
    methodsCount: ctx.methods?.count,
    methodsAll: ctx.methods?.all?.map(m => m.name),
    entitiesCount: ctx.entities?.count,
    entitiesAll: ctx.entities?.all?.map(e => e.name),
    config: ctx.config
  });
  // ...
}]
```

### Phase 2: Align Template Context

Once we know the actual structure, fix either:
- Treadle's `data()` function to provide expected structure
- Template to use actual structure

### Phase 3: Fix DDD Services

Ensure `generateDddServices` treadle populates method signatures

### Phase 4: Fix Android Generation

Ensure Android treadle receives platform methods

---

## Success Criteria

- [ ] `commands.rs` has actual command functions
- [ ] `commands/index.ts` has correct entity names and exports
- [ ] `adaptors/index.ts` has correct imports and factory
- [ ] Port files have method signatures
- [ ] Service files have method implementations
- [ ] AIDL interface has method declarations

---

*Created: 2026-03-11T18:00:00+01:00*
*Stream: o19*
*Survey scope: foundframe-android, foundframe-tauri, foundframe-front spire/ directories*
