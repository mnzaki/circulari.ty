# STATUS: Declarative Hookups Implementation Complete

**Date**: 2025-02-25  
**Instance**: Kimi (spire-loom work)  
**Scope**: APP-006 Declarative Hookups + Infrastructure Fixes

---

## What I Built

### 1. Declarative Hookups System (APP-006)

**Location**: `machinery/shuttle/hookups/`

New path-based hookup system that infers hookup type from file path:

| Handler | File Pattern | Capabilities |
|---------|--------------|--------------|
| `android-manifest.ts` | `AndroidManifest.xml` | permissions, services, application blocks |
| `cargo-toml.ts` | `Cargo.toml` | dependencies, features, lib config |
| `gradle.ts` | `build.gradle` | plugins, source sets, spire task |
| `rust-module.ts` | `lib.rs`, `main.rs` | module declarations, use statements, plugin init |
| `kotlin.ts` | `*.kt` | imports, fields, method prepend/append, new methods |

**Example usage in treadle definition**:
```typescript
hookups: [
  {
    path: 'android/AndroidManifest.xml',
    permissions: [{ name: 'android.permission.FOREGROUND_SERVICE' }],
    services: [{ name: '.service.MyService', process: ':foundframe' }]
  },
  {
    path: 'android/src/main/java/ApiPlugin.kt',
    imports: ['import ty.circulari.o19.ff.FoundframeCommandProvider'],
    classes: {
      'ApiPlugin': {
        fields: ['private var commands: Provider? = null'],
        methods: {
          'load': { append: ['commands = Provider(activity)'] }
        }
      }
    }
  }
]
```

### 2. Spec Resolver Abstraction

**Location**: `machinery/treadle-kit/spec-resolver.ts`

Abstracted the common pattern of `Spec | Spec[] | (ctx) => Spec | Spec[]` that's used by outputs, patches, and now hookups.

```typescript
export type SpecOrFn<T, C> = T | T[] | ((context: C) => T | T[] | undefined);
export function resolveSpecs<T, C>(specs: Array<SpecOrFn<T, C>>, context: C): T[];
```

### 3. Tieup System Modernization

**Location**: `warp/tieups.ts`

Updated tieup system to accept three treadle types:
- **Old CustomTreadle**: `(context) => result` - detected by `fn.length === 1`
- **GeneratorFunction**: `(current, previous, context) => files` - detected by `fn.length === 3`  
- **TreadleDefinition**: Object from `defineTreadle()` - wraps with `generateFromTreadle()`

This maintains backward compatibility while supporting the new declarative API.

### 4. CLI Infrastructure Fixes

**Files**: `cli/index.ts`, `package.json`, `machinery/treadle-kit/index.ts`

- Added `--version` flag implementation
- Added missing exports to `package.json`:
  - `./machinery/treadle-kit`
  - `./machinery/sley`
- Created `treadle-kit/index.ts` with proper re-exports

### 5. CLI Integration Test

**Location**: `tests/cli-integration.test.ts`

Added test that runs the actual CLI and verifies it doesn't crash with import errors. Tests:
- `--help` works
- `--version` works  
- Empty workspace handling
- o19 workspace loading without ERR_PACKAGE_PATH_NOT_EXPORTED crashes

### 6. Disabled Broken Refinement System

Commented out refinement imports in `warp/index.ts` and `machinery/weaver.ts` since the refine modules were moved to `.bak` files.

---

## Current State

**spire-loom CLI runs successfully** with only 1 minor error:
```
⚠️  Errors: 1
   - Template not found: machinery/bobbin/typescript/ports.ts.ejs
```

This is a missing template file, not a crash.

**Tests passing**:
- Patches System tests
- CLI Integration tests
- Marker Integration tests

**Files changed**:
- `machinery/shuttle/hookups/*` (new)
- `machinery/treadle-kit/spec-resolver.ts` (new)
- `machinery/treadle-kit/index.ts` (new)
- `machinery/treadle-kit/declarative.ts` (updated)
- `warp/tieups.ts` (updated)
- `cli/index.ts` (updated)
- `package.json` (updated)
- `tests/cli-integration.test.ts` (new)
- `loom/treadles/tauri-android-commands.ts` (refactored imports)

---

## What's Next

1. **Phase 4**: Migrate `android-generator.ts` and `tauri-generator.ts` to use new `hookups[]` API
2. **Phase 5**: Add tests for hookup handlers, documentation in HOW_TO_LOOM.md
3. Fix missing `ports.ts.ejs` template
4. Restore or remove refinement system properly

---

*The shuttle carries the hookup through the warp.* 🧵🌀
