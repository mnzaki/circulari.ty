---
from: Running spire-loom and surveying generated code - 196 files generated. Assessment of what's working vs what needs fixing.
timestamp: 2026-03-11T18:15:00+01:00
stream: o19
---

# APP-001: Post-Loom Survey - 196 Files Generated

> *The loom runs! 196 files generated. But case/formatting issues and broken index files need fixing before the generated code is usable.*

## Executive Summary

**✅ MAJOR PROGRESS:** The loom now discovers Management Imprints and generates 196 files across all packages.

**🔴 CRITICAL ISSUES:**
1. **Case sensitivity bug** - Rust code uses UPPERCASE (`ADD_BOOKMARK`, `STRING`, `I64`) instead of snake_case/ProperCase
2. **Index files still broken** - `commands/index.ts` has missing entity names
3. **Wrong file references** - Adaptors import from non-existent `bookmarkService.adaptor.js` instead of `bookmark.adaptor.js`
4. **Empty port interfaces** - DDD services have sections but no method signatures

---

## Generation Results

```bash
$ pnpm spire-loom
📍 Workspace detected: /home/mnzaki/Projects/circulari.ty/o19
🧵 Spire-Loom - Weaving spires from surfaces

[DISCOVERY] Discovered 12 treadles...
🧵 anonymous: 11 file(s)
🧵 db-binding: 19 file(s)  
🧵 ddd-services: 23 file(s)
🧵 tauri-adaptor: 21 file(s)
🧵 tauri-android-commands: 2 file(s)
🧵 tauri-desktop-platform: 1 file(s)

✅ Weaving complete!
   Files generated: 196
   Files modified: 0
   Files unchanged: 0
```

---

## Package-by-Package Status

### 1. foundframe-android (Foreground Service)

**Status:** ⚠️ **Generated but needs verification**

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `spire/src/lib.rs` | 153 | ✅ JNI bridge stub | Has `unimplemented!()` for init |
| `spire/android/.../RadicleService.kt` | 188 | ✅ Service skeleton | Empty AIDL binder stub |
| `spire/android/.../RustExternalLayerRadicleService.kt` | 1000+ | ✅ Full generated | Has all method declarations |
| `spire/android/aidl/IRadicleService.aidl` | 36 | ❌ **Empty** | Interface has no methods |

**Hookup Status:**
- `src/lib.rs` exists but is empty (needs to be checked)

---

### 2. foundframe-tauri (Tauri Plugin)

**Status:** 🔴 **Generated but unusable due to case issues**

| File | Lines | Status | Critical Issues |
|------|-------|--------|-----------------|
| `spire/src/commands.rs` | 391 | ⚠️ Has commands | **UPPERCASE:** `pub,async fn ADD_BOOKMARK(url: STRING, title: STRING, notes: STRING) -> ()` |
| `spire/src/platform.rs` | 266 | ⚠️ Has trait | **UPPERCASE:** `fn ADD_BOOKMARK(url: STRING, ...) -> ()` |
| `spire/src/desktop.rs` | 93 | ✅ Platform struct | No method implementations yet |
| `spire/ts/commands/*.ts` | ~50 each | ✅ Per-entity OK | Individual command files look correct |
| `spire/ts/commands/index.ts` | 85 | ❌ **BROKEN** | `//  commands` - missing entity names |
| `spire/ts/adaptors/index.ts` | 120 | ⚠️ Partial | Has entity names but **wrong imports:** `bookmarkService.adaptor.js` |

**Hookup Status:**
- ✅ `src/lib.rs` properly hooks up spire: `#[path = "../spire/src/lib.rs"] pub mod spire;`
- ✅ Commands registered in `generate_handler!` macro
- 🔴 **BUT:** `lib.rs` references `crate::spire::commands::bookmark_add_bookmark` (snake_case) while spire generates `ADD_BOOKMARK` (UPPERCASE)

**Example of case issue:**
```rust
// Generated (WRONG):
pub,async fn ADD_BOOKMARK(url: STRING, title: STRING, notes: STRING) -> ()

// Should be (from lib.rs expectations):
pub async fn add_bookmark(url: String, title: String, notes: String)
```

---

### 3. foundframe-front (DDD Services)

**Status:** ⚠️ **Files generated but interfaces empty**

| File | Status | Notes |
|------|--------|-------|
| `spire/src/ports/*.port.ts` | ⚠️ **Empty** | Has section comments but no method signatures |
| `spire/src/services/*.service.ts` | ⚠️ **Empty** | Classes have no methods |
| `spire/src/ports/index.ts` | ✅ Good | Re-exports all ports |
| `spire/src/services/index.ts` | ✅ Good | Re-exports all services |

**Hookup Status:**
- ✅ `src/ports/index.ts` imports from `../../spire/src/ports/index.js`
- ✅ `DatabasePorts` interface references generated ports
- 🔴 **BUT:** Ports have no methods - just empty interfaces

**Example:**
```typescript
// Generated (EMPTY):
export interface BookmarkReadPort {
  // No methods
}

// Should have:
export interface BookmarkReadPort {
  getBookmark(id: number): Promise<Bookmark>;
  listBookmarks(limit?: number, offset?: number, filter?: BookmarkFilter): Promise<Bookmark[]>;
}
```

---

## Summary Table

| Aspect | Status | Details |
|--------|--------|---------|
| **Management Discovery** | ✅ Working | All 11 managements discovered |
| **File Generation** | ✅ Working | 196 files created |
| **Rust Command Functions** | 🔴 Broken | UPPERCASE naming |
| **Rust Type Names** | 🔴 Broken | `STRING`, `I64`, `BOOKMARK` instead of `String`, `i64`, `Bookmark` |
| **TypeScript Commands** | ✅ Working | Per-entity files OK |
| **TS Command Index** | 🔴 Broken | Missing entity names |
| **TS Adaptor Index** | 🔴 Broken | Wrong file imports |
| **TS Ports** | 🔴 Empty | No method signatures |
| **Main Code Hookup** | ✅ Working | lib.rs and ports/index.ts properly reference spire |

---

## Root Cause Analysis

### 1. UPPERCASE Issue (Critical)

The `LanguageMethod` class has a `_name` with `defaultCase: 'SCREAMING_SNAKE'` which is being applied incorrectly to:
- Function names (should be snake_case)
- Type names (should be PascalCase or rust types)

**Evidence from debug output:**
```
_name: Name { parts: [Array], defaultCase: 'SCREAMING_SNAKE' }
```

### 2. Index File Issues

`commands/index.ts` template expects different entity structure than what treadle provides.

### 3. Port Generation

DDD treadle isn't populating method signatures into the port interfaces.

---

## What Needs Fixing

### Priority 1: Fix Case Issues (Critical - Blocks Compilation)

**In spire-loom machinery:**
- Fix `LanguageMethod` rendering to use proper case:
  - Function names: `snake_case` (Rust), `camelCase` (TypeScript)
  - Types: `String`, `i64`, `Bookmark` (proper Rust/TS types)

### Priority 2: Fix Index Files

- `commands-index.ts.mejs` - Fix entity name rendering
- `adaptors-index.ts.mejs` - Fix import paths (`bookmark.adaptor.js` not `bookmarkService.adaptor.js`)

### Priority 3: Fix Port Generation

- `port.ts.mejs` - Actually render method signatures into interfaces
- `service.ts.mejs` - Render methods into service classes

---

## Verification Steps (When Fixed)

1. **Rust compilation:**
   ```bash
   cd o19/crates/foundframe-tauri
   cargo check
   ```

2. **TypeScript compilation:**
   ```bash
   cd o19/packages/foundframe-front
   pnpm tsc --noEmit
   ```

3. **Integration test:**
   - Verify `lib.rs` can call `crate::spire::commands::add_bookmark`
   - Verify ports have actual method signatures

---

## Conservation Notes

**What's working (preserve it):**
- Management Imprint discovery - all 11 found
- File generation structure - 196 files in right places
- Hookup patterns - lib.rs and ports/index.ts reference spire correctly
- Per-entity command files - content looks correct

**What needs fixing:**
- Template rendering (case issues)
- Template context for index files
- DDD port/service method population

**The architecture is sound** - just template output formatting issues.

---

*Created: 2026-03-11T18:15:00+01:00*
*Stream: o19*
*Status: Generation working, formatting issues to fix*
