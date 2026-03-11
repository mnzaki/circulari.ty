# PLAN-004: Declarative Language System (Final)

**Stream**: spire-loom  
**Status**: Ready for Implementation  
**Created**: 2026-03-02  
**Replaces**: PLAN-003

## Overview

A minimal, focused language system:
- **One file** for the kernel: `machinery/reed/language.ts`
- **Language definitions** live in `warp/` where they belong
- **Self-registration** via `defineLanguage()` at module load
- **No breaking changes** - `warp/` API unchanged

## Directory Structure

```
machinery/
├── reed/
│   └── language.ts          # NEW: Single file - kernel + registry + types
├── bobbin/
│   ├── code-generator.ts    # UPDATED: Use language registry
│   └── type-mappings.ts     # MAYBE: Move type registration to language.ts
└── ...

warp/
├── rust.ts                  # UPDATED: Defines rustLanguage, exports API
├── typescript.ts            # UPDATED: Defines typescriptLanguage, exports API
├── index.ts                 # MAYBE: Re-export languages from here
└── spiral/
    ├── rust.ts              # Unchanged (CoreRing impl)
    ├── typescript.ts        # Unchanged (CoreRing impl)
    └── spiralers/
        └── ...              # Unchanged
```

## The One File: machinery/reed/language.ts

```typescript
/**
 * Language System Kernel
 * 
 * Single source of truth for language definitions.
 * Languages self-register by importing and calling defineLanguage().
 */

import type { RawMethod } from '../bobbin/code-generator.js';
import type { ExternalLayer } from '../warp/imprint.js';
import type { CoreRing, Spiraler, SpiralRing } from '../warp/spiral/pattern.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Code generation configuration for a language.
 */
export interface LanguageCodeGenConfig<M = any> {
  /** File extension patterns for auto-detection (e.g., '.rs.ejs', '.kt.ejs') */
  fileExtensions: string[];
  
  /** Transform raw methods to language-specific methods */
  transform: (methods: RawMethod[]) => M[];
  
  /** Type mappings from TypeScript to this language */
  typeMappings: Array<{
    tsType: string;
    targetType: string;
  }>;
  
  /** Generate stub return value for default implementations */
  getStubReturn: (returnType: string, isCollection: boolean) => string;
}

/**
 * WARP integration configuration for a language.
 */
export interface LanguageWarpConfig {
  /** ExternalLayer subclass for this language */
  externalLayerClass: new () => ExternalLayer;
  
  /** Field decorator functions (e.g., { Mutex, Option, i64 }) */
  fieldDecorators: Record<string, PropertyDecorator>;
  
  /** Class decorator function (e.g., Struct) */
  classDecorator: ClassDecorator | ((options?: any) => ClassDecorator);
  
  /** Core ring configuration */
  core: {
    /** The CoreRing subclass (e.g., RustCore) */
    coreClass: new (...args: any[]) => CoreRing<any, any, any>;
    /** Factory to create core instance */
    createCore: (layer?: ExternalLayer) => CoreRing<any, any, any>;
  };
  
  /** 
   * Spiraler classes for type-safe navigation.
   * Key is target ring name (e.g., 'android', 'desktop').
   */
  spiralers: Record<string, new (innerRing: SpiralRing) => Spiraler>;
  
  /** Expose base factory at loom.spiral.{language} */
  exposeBaseFactory?: boolean;
}

/**
 * Complete language definition.
 */
export interface LanguageDefinition<M = any> {
  /** Language identifier (e.g., 'rust', 'typescript') */
  name: string;
  
  /** Code generation configuration */
  codeGen: LanguageCodeGenConfig<M>;
  
  /** WARP integration configuration */
  warp: LanguageWarpConfig;
}

// ============================================================================
// Registry
// ============================================================================

class LanguageRegistry {
  private languages = new Map<string, LanguageDefinition>();
  
  register<M>(lang: LanguageDefinition<M>): LanguageDefinition<M> {
    if (this.languages.has(lang.name)) {
      console.warn(`[reed] Language ${lang.name} already registered, overwriting`);
    }
    this.languages.set(lang.name, lang);
    return lang;
  }
  
  get(name: string): LanguageDefinition | undefined {
    return this.languages.get(name);
  }
  
  getAll(): LanguageDefinition[] {
    return Array.from(this.languages.values());
  }
  
  /** Find language by file extension */
  detectByExtension(filename: string): LanguageDefinition | undefined {
    const basename = filename.toLowerCase();
    for (const lang of this.languages.values()) {
      for (const ext of lang.codeGen.fileExtensions) {
        if (basename.endsWith(ext.toLowerCase())) return lang;
      }
    }
    return undefined;
  }
  
  /** Get transform function for a language */
  getTransform(name: string): ((methods: RawMethod[]) => any[]) | undefined {
    return this.languages.get(name)?.codeGen.transform;
  }
  
  /** Get stub return generator for a language */
  getStubReturn(name: string): ((rt: string, isColl: boolean) => string) | undefined {
    return this.languages.get(name)?.codeGen.getStubReturn;
  }
}

/** Global language registry */
export const languages = new LanguageRegistry();

// ============================================================================
// Registration Function
// ============================================================================

/**
 * Define and register a language.
 * 
 * Call this at module load time in warp/{language}.ts:
 * 
 * ```typescript
 * // warp/rust.ts
 * export const rustLanguage = defineLanguage({
 *   name: 'rust',
 *   codeGen: { ... },
 *   warp: { ... }
 * });
 * ```
 */
export function defineLanguage<M>(
  definition: LanguageDefinition<M>
): LanguageDefinition<M> {
  // Validation
  if (!definition.name) {
    throw new Error('[reed] Language definition must have a name');
  }
  if (!definition.codeGen?.fileExtensions?.length) {
    throw new Error(`[reed] Language ${definition.name} must have fileExtensions`);
  }
  if (!definition.codeGen?.transform) {
    throw new Error(`[reed] Language ${definition.name} must have a transform function`);
  }
  if (!definition.warp?.core?.coreClass) {
    throw new Error(`[reed] Language ${definition.name} must have a coreClass`);
  }
  
  // Register
  return languages.register(definition);
}

// ============================================================================
// Type Mapping Integration
// ============================================================================

/**
 * Register type mappings from a language definition.
 * Called internally when languages register.
 */
export function registerLanguageTypeMappings(
  langName: string,
  mappings: Array<{ tsType: string; targetType: string }>
): void {
  // Lazy import to avoid circular dependency
  const { registerTypeMapping } = require('../bobbin/type-mappings.js');
  
  for (const mapping of mappings) {
    registerTypeMapping({
      tsType: mapping.tsType,
      [langName]: mapping.targetType,
      // Fallbacks for other languages
      kotlin: mapping.tsType,
      rust: mapping.tsType,
      jni: mapping.tsType,
      tauri: mapping.tsType,
      sql: 'TEXT',
    });
  }
}

// ============================================================================
// Re-exports for Convenience
// ============================================================================

export type {
  RawMethod,
  ExternalLayer,
  CoreRing,
  Spiraler,
  SpiralRing
};
```

## Language Definition: warp/rust.ts

```typescript
/**
 * Rust WARP Integration
 * 
 * Exports the public API and self-registers the language.
 */

// ============================================================================
// Public API (unchanged - backward compatible)
// ============================================================================

// Symbols
export const RUST_WRAPPERS = Symbol('rust:wrappers');
export const RUST_TYPE = Symbol('rust:type');
export const RUST_STRUCT_MARK = Symbol('rust:struct');
export const RUST_STRUCT_CONFIG = Symbol('rust:structConfig');

// Types
export type RustWrapper = 'Mutex' | 'Option' | 'Arc' | 'RwLock' | 'Vec';

export interface RustFieldMetadata {
  [RUST_WRAPPERS]?: RustWrapper[];
  [RUST_TYPE]?: string;
}

export interface RustStructOptions {
  useResult?: boolean;
}

// ExternalLayer
export class RustExternalLayer<T = any> extends ExternalLayer {
  fieldName?: string;
  wrappers?: RustWrapper[];
  structClass?: T;

  static isRustStruct(target: unknown): boolean {
    return typeof target === 'function' && (target as any)[RUST_STRUCT_MARK] === true;
  }

  static getFieldMetadata(target: unknown): Map<string, RustFieldMetadata> | undefined {
    if (typeof target !== 'function') return undefined;
    return (target as any).__rustFields;
  }
}

// Decorators
export function Mutex<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export function Option<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export function i64<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export function u64<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export function string<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export function bool<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export function f64<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export const Vec = string; // Reuse string decorator for Vec marker

export function Struct<T extends new (...args: any[]) => any>(
  options?: RustStructOptions
): (target: T, context: ClassDecoratorContext<T>) => T;
export function Struct<T extends new (...args: any[]) => any>(
  target: T,
  context: ClassDecoratorContext<T>
): T;
export function Struct(...args: any[]): any { ... }

// ============================================================================
// Language Definition (NEW)
// ============================================================================

import { defineLanguage, registerLanguageTypeMappings } from '../machinery/reed/language.js';
import { transformForRust, type RustMethod } from '../machinery/bobbin/code-generator.js';
import { RustCore, rustCore } from './spiral/rust.js';
import { RustAndroidSpiraler, RustDesktopSpiraler } from './spiral/spiralers/rust/index.js';

export const rustLanguage = defineLanguage<RustMethod>({
  name: 'rust',
  
  codeGen: {
    fileExtensions: ['.rs.ejs', '.jni.rs.ejs'],
    transform: transformForRust,
    typeMappings: [
      { tsType: 'string', targetType: 'String' },
      { tsType: 'number', targetType: 'i64' },
      { tsType: 'boolean', targetType: 'bool' },
      { tsType: 'bool', targetType: 'bool' },
    ],
    getStubReturn: (returnType, isCollection) => {
      if (returnType === 'bool') return 'false';
      if (returnType === 'String') return 'String::new()';
      if (returnType.startsWith('Vec<')) return 'Vec::new()';
      if (returnType.startsWith('i') || returnType.startsWith('u')) return '0';
      if (returnType === '()') return '()';
      return `// Entity type: ${returnType}\n    Default::default()`;
    }
  },
  
  warp: {
    externalLayerClass: RustExternalLayer,
    fieldDecorators: {
      Mutex,
      Option,
      i64,
      u64,
      string,
      bool,
      f64,
      Vec
    },
    classDecorator: Struct,
    core: {
      coreClass: RustCore,
      createCore: (layer) => rustCore(layer || new RustExternalLayer())
    },
    spiralers: {
      android: RustAndroidSpiraler,
      desktop: RustDesktopSpiraler
    },
    exposeBaseFactory: true
  }
});

// Register type mappings
registerLanguageTypeMappings('rust', rustLanguage.codeGen.typeMappings);
```

## Language Definition: warp/typescript.ts

Same pattern as rust.ts:

```typescript
/**
 * TypeScript WARP Integration
 */

// Public API (unchanged)
export const TS_CLASS_MARK = Symbol('typescript:class');
export const TS_CLASS_CONFIG = Symbol('typescript:classConfig');

export interface TsClassOptions {
  packageName?: string;
  packagePath?: string;
}

export class TsExternalLayer<T = any> extends ExternalLayer {
  // ... implementation ...
}

export function Class<T extends new (...args: any[]) => any>(...): T { ... }
export function Optional<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export const String = createTypeDecorator('string');
export const Number = createTypeDecorator('number');
export const Boolean = createTypeDecorator('boolean');

// Language Definition
import { defineLanguage, registerLanguageTypeMappings } from '../machinery/reed/language.js';
import { transformForTypeScript, type TypeScriptMethod } from '../machinery/bobbin/code-generator.js';
import { TsCore, tsCore } from './spiral/typescript.js';
import { TypescriptSpiraler } from './spiral/spiralers/typescript/index.js';

export const typescriptLanguage = defineLanguage<TypeScriptMethod>({
  name: 'typescript',
  
  codeGen: {
    fileExtensions: ['.ts.ejs', '.tsx.ejs'],
    transform: transformForTypeScript,
    typeMappings: [
      { tsType: 'string', targetType: 'string' },
      { tsType: 'number', targetType: 'number' },
      { tsType: 'boolean', targetType: 'boolean' },
    ],
    getStubReturn: (returnType, isCollection) => {
      if (returnType === 'boolean') return 'false';
      if (returnType === 'string') return "''";
      if (returnType === 'number') return '0';
      if (returnType === 'void') return 'undefined';
      if (isCollection) return '[]';
      return `{} as ${returnType}`;
    }
  },
  
  warp: {
    externalLayerClass: TsExternalLayer,
    fieldDecorators: { Optional, String, Number, Boolean },
    classDecorator: Class,
    core: {
      coreClass: TsCore,
      createCore: (layer) => tsCore(layer || new TsExternalLayer())
    },
    spiralers: {
      typescript: TypescriptSpiraler
    },
    exposeBaseFactory: true
  }
});

registerLanguageTypeMappings('typescript', typescriptLanguage.codeGen.typeMappings);
```

## Updated: machinery/bobbin/code-generator.ts

```typescript
/**
 * Code Generator - Updated to use language registry
 */

import { languages } from '../reed/language.js';

// ... existing types and interfaces ...

/**
 * Detect language from template filename.
 * Uses registered language extensions.
 */
export function detectLanguage(templatePath: string): string {
  const lang = languages.detectByExtension(templatePath);
  return lang?.name ?? 'unknown';
}

/**
 * Transform methods using registered language transform.
 */
function transformMethods(methods: RawMethod[], language: string): RawMethod[] {
  // Validation (unchanged)
  for (const method of methods) {
    if (typeof method.name !== 'string' || method.name.length === 0) {
      throw new Error(
        `Method missing valid name during transform for ${language}: ${JSON.stringify(method)}`
      );
    }
    method.camelName = camelCase(method.name);
  }
  
  // Get language from registry
  const lang = languages.get(language);
  if (!lang) {
    console.warn(`[code-generator] Unknown language: ${language}, returning untransformed`);
    return methods;
  }
  
  // Transform
  let transformed = lang.codeGen.transform(methods);
  
  // Add filter/map overrides (same as before)
  transformed.filter = createFilterOverride(language);
  transformed.map = createMapOverride(language);
  
  return transformed;
}
```

## Adding a New Language (Swift Example)

Create one new file: `warp/swift.ts`

```typescript
/**
 * Swift WARP Integration
 */

// Public API
export const SWIFT_CLASS_MARK = Symbol('swift:class');

export class SwiftExternalLayer<T = any> extends ExternalLayer {
  static isSwiftClass(target: unknown): boolean {
    return typeof target === 'function' && (target as any)[SWIFT_CLASS_MARK] === true;
  }
}

export function Struct<T extends new (...args: any[]) => any>(...): T { ... }
export function Optional<T>(target: T, context: ClassFieldDecoratorContext): void { ... }
export function weak<T>(target: T, context: ClassFieldDecoratorContext): void { ... }

// Language Definition
import { defineLanguage, registerLanguageTypeMappings } from '../machinery/reed/language.js';
import { transformForSwift, type SwiftMethod } from '../machinery/bobbin/swift-transform.js';
import { SwiftCore, swiftCore } from './spiral/swift.js';
import { SwiftIosSpiraler, SwiftMacosSpiraler } from './spiral/spiralers/swift/index.js';

export const swiftLanguage = defineLanguage<SwiftMethod>({
  name: 'swift',
  
  codeGen: {
    fileExtensions: ['.swift.ejs'],
    transform: transformForSwift,
    typeMappings: [
      { tsType: 'string', targetType: 'String' },
      { tsType: 'number', targetType: 'Int' },
      { tsType: 'boolean', targetType: 'Bool' },
    ],
    getStubReturn: (returnType, isCollection) => {
      if (returnType === 'Bool') return 'false';
      if (returnType === 'String') return '""';
      if (isCollection) return '[]';
      return 'nil';
    }
  },
  
  warp: {
    externalLayerClass: SwiftExternalLayer,
    fieldDecorators: { Optional, weak },
    classDecorator: Struct,
    core: {
      coreClass: SwiftCore,
      createCore: (layer) => swiftCore(layer || new SwiftExternalLayer())
    },
    spiralers: {
      ios: SwiftIosSpiraler,
      macos: SwiftMacosSpiraler
    },
    exposeBaseFactory: true
  }
});

registerLanguageTypeMappings('swift', swiftLanguage.codeGen.typeMappings);

// Export for WARP usage
export { SwiftIosSpiraler, SwiftMacosSpiraler };
```

Usage:
```typescript
// In a project's WARP.ts
import { swift } from '@o19/spire-loom/swift';

@swift.Struct
class MyApi {
  @swift.Optional
  name: string;
}

// Spiral from nothing
const api = loom.spiral.swift.ios.app();
```

## Implementation Steps

### Step 1: Create machinery/reed/language.ts
- Copy the content from "The One File" section above
- Ensure all imports resolve (may need to adjust paths)

### Step 2: Update warp/rust.ts
- Keep all existing exports (backward compatibility)
- Add `rustLanguage` definition at bottom of file
- Import `defineLanguage` from `../machinery/reed/language.js`

### Step 3: Update warp/typescript.ts
- Same pattern as rust.ts

### Step 4: Update machinery/bobbin/code-generator.ts
- Replace hardcoded `detectLanguage()` with registry lookup
- Replace hardcoded `transformMethods()` switch with registry lookup

### Step 5: Test
- Run existing tests: `npm test`
- Verify no breaking changes to WARP files
- Test that `loom.spiral(Foundframe).android` still works

### Step 6: Add Swift Example (Optional)
- Create `warp/swift.ts` as proof of concept
- Verify new language can be added in one file

## Success Criteria

1. ✅ **Single kernel file** - Just `machinery/reed/language.ts`
2. ✅ **Language definitions in warp/** - Where they belong
3. ✅ **Self-registration** - `defineLanguage()` at module load
4. ✅ **No breaking changes** - All existing WARP files work
5. ✅ **Code generation uses registry** - No more hardcoded switch
6. ✅ **Add language in one file** - Create `warp/{lang}.ts`, done

## Files Changed

### New Files
- `machinery/reed/language.ts` - Kernel + registry + types

### Modified Files
- `warp/rust.ts` - Add language definition
- `warp/typescript.ts` - Add language definition
- `machinery/bobbin/code-generator.ts` - Use language registry

---

> *"The reed is single, but it guides many threads."*
