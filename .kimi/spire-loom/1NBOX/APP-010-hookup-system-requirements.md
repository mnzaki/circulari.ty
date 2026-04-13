# APP-010: Hookup System Requirements

> *"The spire reaches upward, but must be anchored in the source."*

**Status:** Requirements Analysis Complete  
**Source:** HOW_TO_LOOM.md audit + HOOKUP-AUDIT.md findings  
**Priority:** HIGH - Blocks E2E testing  

---

## Executive Summary

Based on audit of HOW_TO_LOOM.md and HOOKUP-AUDIT.md, we need **3 new hookup types** and **4 hookup configurations** to fully automate spire integration. Currently only `KotlinHookup` is implemented and working.

---

## Existing Hookup System (Working)

### KotlinHookup ✅ IMPLEMENTED
**File:** `machinery/shuttle/hookups/kotlin.ts`

```typescript
// Usage in tauri-android-commands.ts treadle
hookups: [{
  path: 'android/src/main/java/ApiPlugin.kt',
  imports: ['import ty.circulari.o19.ff.FoundframeCommandProvider'],
  classes: {
    ApiPlugin: {
      fields: ['private var foundframeCommands: FoundframeCommandProvider? = null'],
      methods: {
        load: {
          append: ['foundframeCommands = FoundframeCommandProvider(activity)']
        }
      }
    }
  }
}]
```

**Features:**
- Import injection
- Field addition
- Method prepend/append
- New method addition
- Template function support

---

> **🌀 Rule of Thumb (from HOW_TO_LOOM.md):** Hookup configs accept **arrays of lines** OR **arrays of objects**:
> ```typescript
> // Array of lines (strings)
> hookups: [{ 
>   exports: ["export * from 'spire/bla';", "export * from 'spire/blo';"] 
> }]
> 
> // Array of objects
> hookups: [{ 
>   exports: [{ source: 'spire/bla', star: true }, { source: 'spire/blo', names: ['X'] }] 
> }]
> ```

---

## Hookup Type System Design

### Philosophy

Hookup configs model **locations within a file**. Each location is named after where it appears in the target language's syntax:

| Language | Locations (Top-level attrs) |
|----------|----------------------------|
| **Rust** (`lib.rs`) | `moduleDeclarations`, `useStatements`, `tauriCommands` |
| **TypeScript** (`index.ts`) | `exports`, `imports` |
| **Kotlin** (`*.kt`) | `imports`, `fields`, `methods` |
| **Cargo.toml** | `dependencies`, `features`, `lib` |

### The Line-or-Object Pattern

Every location accepts **either** an array of raw lines (strings) **or** an array of structured objects:

```typescript
// Type definition pattern
interface ExportStructured {
  source: string;
  star?: boolean;
  names?: string[];
}

// The union type: string line OR structured object
type HookupEntry<Structured> = string | Structured;

// In the hookup interface
interface TypeScriptHookup {
  path: string;
  exports?: HookupEntry<ExportStructured>[];
  //      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //      Can be: ["export * from 'a';"] OR [{ source: 'a', star: true }]
}
```

### Why Both Forms?

| Form | Use Case |
|------|----------|
| **Lines** (strings) | Quick & dirty, escape hatches, custom syntax |
| **Objects** (structured) | Type safety, IDE autocomplete, validation |

### Type Implementation

```typescript
// machinery/shuttle/hookups/types.ts

/**
 * Base type for hookup entries that can be either raw lines or structured objects.
 * This is the core pattern for all hookup locations.
 */
export type HookupEntry<Structured> = string | Structured;

/**
 * Helper to make all properties of a hookup accept both line and object forms.
 * Use this for location properties (exports, imports, etc.)
 */
export type HookupLocation<T> = HookupEntry<T>[] | undefined;

// Example: TypeScript exports
export interface TypeScriptExport {
  source: string;
  star?: boolean;
  names?: string[];
}

export interface TypeScriptHookup extends BaseHookup {
  path: `${string}index.ts`;
  exports?: HookupLocation<TypeScriptExport>;
}

// Example: Rust module declarations
export interface RustModuleDeclaration {
  name: string;
  path?: string;
  pub?: boolean;
}

export type RustModuleEntry = string | RustModuleDeclaration;

export interface RustModuleHookup extends BaseHookup {
  path: `${string}src/lib.rs` | `${string}src/main.rs`;
  moduleDeclarations?: RustModuleEntry[];
  useStatements?: string[];
  tauriCommands?: string[];
}
```

### Processing Pattern

Hookup handlers should normalize entries to structured form:

```typescript
function normalizeEntry<T>(
  entry: HookupEntry<T>, 
  parseLine: (line: string) => T
): T {
  if (typeof entry === 'string') {
    return parseLine(entry);
  }
  return entry;
}

// Usage in handler
for (const entry of hookup.exports || []) {
  const structured = normalizeEntry(entry, parseExportLine);
  // Now work with structured data...
}
```

---

## Required Hookup Types (NEW)

### 1. RustModuleHookup ✅ IMPLEMENTED

**File:** `machinery/shuttle/hookups/rust-module.ts`

**Required for:** foundframe, foundframe-android, foundframe-tauri

```typescript
// Target configuration
{
  path: 'src/lib.rs',  // or src/main.rs
  
  // Module declarations
  moduleDeclarations: [
    { name: 'spire', path: '../spire/src/lib.rs', pub: true }
  ],
  
  // Use statements
  useStatements: [
    'use crate::spire::commands::*;'
  ],
  
  // Tauri plugin initialization
  pluginInit: {
    fnName: 'setupSpireFoundframe',
    stateType: 'SpireFoundframePlatform',
    setup: 'let platform = crate::spire::setupSpireFoundframe(app, &api)?;'
  },
  
  // Commands to inject into generate_handler![]
  tauriCommands: [
    'crate::spire::commands::add_bookmark',
    'crate::spire::commands::list_bookmarks',
    // ... etc
  ]
}
```

**Implementation Location:** `machinery/shuttle/hookups/rust-module.ts` (NEW FILE)

**Handler Logic:**
1. Parse lib.rs to find `generate_handler![]` macro
2. Insert module declaration at file end
3. Insert use statements after existing uses
4. Inject commands into generate_handler![] array
5. For Tauri: Inject setup code into `.setup()` closure

---

### 2. TypeScriptIndexHookup ✅ IMPLEMENTED

**File:** `machinery/shuttle/hookups/typescript.ts`

**Target configuration:**
```typescript
// Single star re-export from spire entry
{
  path: 'src/index.ts',
  exports: [
    { source: '../spire/src/index.js', star: true }
  ]
}

// Multiple sources with stars (foundframe-front style)
{
  path: 'src/index.ts',
  exports: [
    { source: '../spire/src/ports/index.js', star: true },
    { source: '../spire/src/services/index.js', star: true },
    { source: '../spire/src/adaptors/index.js', star: true },
    { source: '../spire/src/types.gen.js', star: true }
  ]
}
```

**Generated Output:**
```typescript
// GENERATED BY SPIRE-LOOM - DO NOT EDIT
export * from '../spire/src/index.js';
```

**Features:**
- Star exports (`export * from '...'`)
- Named re-exports (`export { X, Y } from '...'`)
- All import styles (named, default, namespace, type-only)
- Lines form (strings) or structured form (objects)

---

### 3. CargoTomlHookup ✅ IMPLEMENTED

**File:** `machinery/shuttle/hookups/cargo-toml.ts`

**Target configuration:**
```typescript
{
  path: 'Cargo.toml',
  
  // Dependencies - simple or complex
  dependencies: {
    'serde': '1.0',                                    // simple
    'tauri': { version: '2', features: ['test'] },    // with features
    'o19-foundframe': { path: '../foundframe' },       // path-based
    'git-lib': { git: '...', branch: 'main' }         // git-based
  },
  
  devDependencies: { 'tokio-test': '0.4' },
  buildDependencies: { 'cc': '1.0' },
  
  // Features
  features: {
    'spire': ['o19-foundframe/spire']
  },
  
  // [lib] configuration
  lib: {
    'crate-type': ['staticlib', 'cdylib', 'rlib'],
    name: 'my_lib',
    path: 'src/lib.rs'
  }
}
```

---

## Required Hookup Configurations (Per Package)

### Package 1: foundframe (Core Rust)

**Current State:** Spire generated at `spire/src/db/` but NOT hooked

**Required Hookup:**
```typescript
// In dbBindingTreadle definition
hookups: [{
  path: 'src/lib.rs',
  moduleDeclarations: [
    { name: 'spire', path: '../spire/src/lib.rs', pub: true }
  ]
}]
```

**Missing:** `spire/src/lib.rs` generation (entry point)

---

### Package 2: foundframe-tauri (Tauri Plugin Rust)

**Current State:** Manually hooked ✅ (REFERENCE IMPLEMENTATION)

**Found in src/lib.rs:**
```rust
#[path = "../spire/src/lib.rs"]
pub mod spire;

// Commands manually added:
.invoke_handler(tauri::generate_handler![
    // ...
    crate::spire::commands::add_bookmark,
    // ...
])

// Setup manually called:
let _foundframe = crate::spire::setupSpireFoundframe(app, &api)?;
```

**Required Hookup (to automate):**
```typescript
hookups: [{
  path: 'src/lib.rs',
  moduleDeclarations: [{ name: 'spire', path: '../spire/src/lib.rs', pub: true }],
  useStatements: ['use crate::spire::commands::*;'],
  tauriCommands: (ctx) => ctx.methods?.platform?.map(m => `crate::spire::commands::${m.name}`) || []
}]
```

---

### Package 3: foundframe-android (Android Rust)

**Current State:** Spire generated but NOT hooked

**Required Hookup:**
```typescript
hookups: [{
  path: 'src/lib.rs',
  moduleDeclarations: [
    { name: 'spire', path: '../spire/src/lib.rs', pub: true }
  ],
  // Conditional for Android feature
  condition: (ctx) => ctx.config?.enableAndroid !== false
}]
```

**Blocker:** build.rs AIDL panic needs fix first (see HOOKUP-AUDIT.md)

---

### Package 4: foundframe-front (TypeScript)

**Current State:** Spire generated but NOT exported

**Required Hookup:**
```typescript
// In typescript-ddd-generator or ddd-services treadle
hookups: [{
  path: 'src/index.ts',
  exports: [{ source: '../spire/src/index.js', star: true }]
}]
```

**Missing:** `spire/src/index.ts` generation (entry point)

---

## Hookup Handler Implementation Checklist

| Handler | Type | Status | File Location | Priority |
|---------|------|--------|---------------|----------|
| `kotlin.ts` | KotlinHookup | ✅ Working | `shuttle/hookups/kotlin.ts` | - |
| `rust-module.ts` | RustModuleHookup | ✅ **IMPLEMENTED** | `shuttle/hookups/rust-module.ts` | HIGH |
| `typescript.ts` | TypeScriptIndexHookup | ✅ **IMPLEMENTED** | `shuttle/hookups/typescript.ts` | HIGH |
| `cargo-toml.ts` | CargoTomlHookup | ✅ **IMPLEMENTED** | `shuttle/hookups/cargo-toml.ts` | MEDIUM |
| `android-manifest.ts` | AndroidManifestHookup | 🚧 Partial | `shuttle/hookup-manager.ts` | LOW |
| `vite-config.ts` | ViteConfigHookup | ✅ **IMPLEMENTED** | `shuttle/hookups/vite-config.ts` | LOW |
| `gradle.ts` | GradleHookup | 🚧 Partial | `shuttle/gradle-manager.ts` | LOW |

---

## Hookup Dispatcher

**File:** `machinery/shuttle/hookups/index.ts` (needs update)

```typescript
import { applyKotlinHookup } from './kotlin.js';
import { applyRustModuleHookup } from './rust-module.js';  // NEW
import { applyTypeScriptHookup } from './typescript.js';    // NEW
import { applyCargoTomlHookup } from './cargo-toml.js';     // NEW
import { detectHookupType, type HookupSpec } from './types.js';

export async function applyHookup(
  spec: HookupSpec, 
  context: GeneratorContext
): Promise<HookupResult> {
  const type = detectHookupType(spec.path);
  
  switch (type) {
    case 'kotlin':
      return applyKotlinHookup(spec.path, spec, context);
    case 'rust-module':
      return applyRustModuleHookup(spec.path, spec, context);  // NEW
    case 'typescript':
      return applyTypeScriptHookup(spec.path, spec, context);  // NEW
    case 'cargo-toml':
      return applyCargoTomlHookup(spec.path, spec, context);   // NEW
    // ... existing cases
    default:
      throw new Error(`Unknown hookup type: ${type}`);
  }
}
```

---

## Template Requirements

### spire/src/lib.rs (Rust Entry Point)

**For foundframe core:**
```rust
// GENERATED BY SPIRE-LOOM - DO NOT EDIT
//! Foundframe Core Spire

pub mod db;
```

**For foundframe-tauri:**
```rust
// GENERATED BY SPIRE-LOOM - DO NOT EDIT
//! Foundframe Tauri Spire

pub mod commands;
pub mod desktop;
pub mod error;
pub mod extension;
pub mod models;
pub mod platform;

pub use platform::SpireFoundframePlatformTrait;
// ... etc
```

### spire/src/index.ts (TypeScript Entry Point)

```typescript
// GENERATED BY SPIRE-LOOM - DO NOT EDIT
// TypeScript Spire Entry Point

// Export ALL generated modules using star exports
export * from './ports/index.js';
export * from './services/index.js';
export * from './adaptors/index.js';
export * from './tauri/index.js';
export * from './types.gen.js';

// Named export for factory function
export { createTauriAdaptors } from './adaptor-selector.gen.js';
```

---

## Integration with Treadles

### dbBindingTreadle (foundframe)
```typescript
defineTreadle({
  name: 'db-binding',
  // ... existing config
  outputs: [
    // Generate db/ code
  ],
  // NEW: Generate entry point
  outputs: (ctx) => [
    // ... db outputs
    {
      template: 'core/spire-lib.rs.ejs',
      path: 'spire/src/lib.rs',
      language: 'rust'
    }
  ],
  // NEW: Hook into main lib
  hookups: [{
    path: 'src/lib.rs',
    moduleDeclarations: [{ name: 'spire', path: '../spire/src/lib.rs', pub: true }]
  }]
});
```

### tauriPluginTreadle (foundframe-tauri)
```typescript
defineTreadle({
  name: 'tauri-plugin',
  // ... existing config
  hookups: [{
    path: 'src/lib.rs',
    moduleDeclarations: [{ name: 'spire', path: '../spire/src/lib.rs', pub: true }],
    tauriCommands: (ctx) => ctx.methods?.platform?.map(m => `crate::spire::commands::${m.name}`)
  }]
});
```

### typescriptDddTreadle (foundframe-front)
```typescript
defineTreadle({
  name: 'typescript-ddd',
  // ... existing config
  outputs: [
    // ... existing outputs
    {
      template: 'typescript/spire-index.ts.ejs',
      path: 'spire/src/index.ts',
      language: 'typescript'
    }
  ],
  hookups: [{
    path: 'src/index.ts',
    exports: [{ source: '../spire/src/index.js', star: true }]
  }]
});
```

---

## Success Criteria

- [x] `rust-module.ts` hookup handler implemented (61 tests pass, 0 TS errors)
- [x] `typescript.ts` hookup handler implemented (82 tests pass, 0 TS errors)
- [x] `cargo-toml.ts` hookup handler implemented (99 tests pass, 0 TS errors)
- [ ] Entry point templates (`spire/src/lib.rs`, `spire/src/index.ts`) created
- [ ] All 4 packages auto-hook on `pnpm spire-loom`
- [ ] No manual edits needed to src/lib.rs or src/index.ts after generation

---

## Dependencies

- APP-008: Spire-loom machinery refactoring (COMPLETE)
- HOOKUP-AUDIT.md manual fixes (RECOMMENDED FIRST)
  - Fix foundframe compilation errors
  - Fix foundframe-android AIDL panic

---

> *"The loom generates. The shuttle anchors. The spire stands complete."*

---

**Next Action:** All APP-010 hookup handlers implemented! Next: Entry point templates + E2E testing

---

## Appendix: MyTauriApp Integration Test Harness Hookups

Additional hookups required to transform a fresh vanilla Tauri app (`pnpm create tauri-app`) into the integration test harness:

### A. NPM Dependencies Hookup
```typescript
{
  path: 'package.json',
  dependencies: {
    '@o19/foundframe-tauri': 'workspace:*'
  },
  scripts: {
    'test:circularity:integration': 'tauri dev',
    'test:circularity:integration:ci': 'CI=true tauri dev'
  }
}
```

### B. Cargo Dependencies Hookup
```typescript
{
  path: 'src-tauri/Cargo.toml',
  dependencies: {
    'o19-foundframe-tauri': { path: '../../../crates/foundframe-tauri' }
  }
}
```

### C. Rust Plugin Initialization Hookup
```typescript
{
  path: 'src-tauri/src/lib.rs',
  // Inject .plugin(o19_foundframe_tauri::init()) into Tauri builder chain
  pluginInit: {
    setup: '.plugin(o19_foundframe_tauri::init())'
  }
}
```

### D. Test Framework File Generation
```typescript
// Treadle outputs (not hookups) - generate test framework files
outputs: [
  { template: 'test-harness/runner.ts.ejs', path: 'src/lib/test-circularity/runner.ts' },
  { template: 'test-harness/bookmark-tests.ts.ejs', path: 'src/lib/test-circularity/suites/bookmark-tests.ts' },
  { template: 'test-harness/device-tests.ts.ejs', path: 'src/lib/test-circularity/suites/device-tests.ts' }
]
```

### E. Test Entry Point Hookup
```typescript
{
  path: 'src/test-entry.ts',
  // Lines form: direct code injection
  content: `
import { TestRunner, bookmarkTestSuite, deviceTestSuite } from './lib/test-circularity/index.js';

const runner = new TestRunner();
runner.runAll([bookmarkTestSuite, deviceTestSuite]).then(report => {
  console.log('Tests complete:', report);
  if (import.meta.env.CI) process.exit(report.failed > 0 ? 1 : 0);
});
`
}
```

### F. Vite Config Multi-Entry (Optional)
```typescript
{
  path: 'vite.config.ts',
  // Lines form or structured
  build: {
    rollupOptions: {
      input: process.env.CIRCULARITY_TEST 
        ? './src/test-entry.ts' 
        : './src/main.ts'
    }
  }
}
```

---

**Implementation Note:** Hookups A-C use the implemented handlers. Hookups D-F use FileBlockHookup or treadle `outputs`. All follow the "lines or objects" rule of thumb.
