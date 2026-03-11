# PLAN-003: Declarative Language System

**Stream**: spire-loom  
**Status**: Ready for Implementation  
**Created**: 2026-03-02  
**Replaces**: PLAN-002 (incorporates review feedback)

## Overview

Unify language support in spire-loom through a declarative API that enables:
1. **Self-contained language definitions** - Each language registers itself
2. **Type-safe code generation** - Transforms, type mappings, stub returns
3. **WARP integration** - ExternalLayer, decorators, CoreRing, Spiralers
4. **No breaking changes** - `warp/` remains the public API

## Directory Structure

```
machinery/
├── reed/                      # NEW: Language system implementation
│   ├── define-language.ts     # Core interface and global registry
│   ├── index.ts               # Re-exports
│   └── types.ts               # Shared type definitions
├── bobbin/
│   ├── code-generator.ts      # UPDATED: Use language registry
│   └── ...
└── ...

warp/
├── rust.ts                    # UPDATED: Defines language, re-exports
├── typescript.ts              # UPDATED: Defines language, re-exports
└── spiral/
    ├── rust.ts                # MAYBE: Move to machinery/reed/rust/spiral.ts
    ├── typescript.ts          # MAYBE: Move to machinery/reed/typescript/spiral.ts
    └── spiralers/
        └── ...
```

## Core Interface

```typescript
// machinery/reed/define-language.ts

import type { RawMethod } from '../bobbin/code-generator.js';
import type { ExternalLayer } from '../warp/imprint.js';
import type { CoreRing, Spiraler, SpiralRing } from '../warp/spiral/pattern.js';

/**
 * Code generation configuration for a language.
 */
export interface LanguageCodeGenConfig<M = any> {
  /** File extension patterns for auto-detection (e.g., '.rs.ejs') */
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
  
  /** 
   * Field decorator functions.
   * These are the actual decorators (e.g., @rust.Mutex), not factories.
   */
  fieldDecorators: Record<string, PropertyDecorator>;
  
  /** 
   * Class decorator function (e.g., @rust.Struct).
   * Can be overloaded: direct decorator or factory returning decorator.
   */
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
   * Key is target ring name (e.g., 'android', 'desktop', 'typescript').
   * Enables IDE autocomplete: loom.spiral(Foundframe).android
   */
  spiralers: Record<string, new (innerRing: SpiralRing) => Spiraler>;
  
  /** 
   * Whether to expose base factory at loom.spiral.{language}.
   * Enables "start from nothing" pattern.
   */
  exposeBaseFactory?: boolean;
}

/**
 * Complete language definition.
 * Languages self-register by calling defineLanguage() at module load time.
 */
export interface LanguageDefinition<M = any> {
  /** Language identifier (e.g., 'rust', 'typescript') */
  name: string;
  
  /** Code generation configuration */
  codeGen: LanguageCodeGenConfig<M>;
  
  /** WARP integration configuration */
  warp: LanguageWarpConfig;
}

/**
 * Global language registry.
 * Populated at module load time when languages call defineLanguage().
 */
class LanguageRegistry {
  private languages = new Map<string, LanguageDefinition>();
  
  register<M>(lang: LanguageDefinition<M>): LanguageDefinition<M> {
    if (this.languages.has(lang.name)) {
      console.warn(`Language ${lang.name} is already registered, overwriting`);
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
        if (basename.endsWith(ext)) return lang;
      }
    }
    return undefined;
  }
}

/** Global registry instance */
export const languages = new LanguageRegistry();

/**
 * Define a language and register it globally.
 * 
 * Usage:
 * ```typescript
 * // In warp/rust.ts
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
  // Validate
  if (!definition.name) {
    throw new Error('Language definition must have a name');
  }
  if (!definition.codeGen?.fileExtensions?.length) {
    throw new Error(`Language ${definition.name} must have fileExtensions`);
  }
  if (!definition.codeGen?.transform) {
    throw new Error(`Language ${definition.name} must have a transform function`);
  }
  if (!definition.warp?.core?.coreClass) {
    throw new Error(`Language ${definition.name} must have a coreClass`);
  }
  
  // Register type mappings with central type mapper
  if (definition.codeGen.typeMappings) {
    const { registerTypeMapping } = await import('../bobbin/type-mappings.js');
    for (const mapping of definition.codeGen.typeMappings) {
      registerTypeMapping({
        tsType: mapping.tsType,
        [definition.name]: mapping.targetType,
        // Other languages get defaults
        kotlin: mapping.tsType, // fallback
        rust: mapping.tsType,
        jni: mapping.tsType,
        tauri: mapping.tsType,
        sql: 'TEXT', // default
      });
    }
  }
  
  // Register in global registry
  return languages.register(definition);
}
```

## Migration: warp/rust.ts

```typescript
// warp/rust.ts
// Self-defines language and re-exports everything

// ============================================================================
// Existing exports (unchanged - maintains backward compatibility)
// ============================================================================
export {
  RUST_WRAPPERS,
  RUST_TYPE,
  RUST_STRUCT_MARK,
  RUST_STRUCT_CONFIG,
  RustWrapper,
  RustFieldMetadata,
  RustStructOptions,
  RustExternalLayer,
  Mutex,
  Option,
  i64,
  u64,
  string,
  bool,
  f64,
  Vec,
  Struct,
  RustMethod,
  RustDataType,
  getRustStructMetadata
} from './rust-impl.js';  // Internal implementation moved here

// ============================================================================
// Language Definition (NEW)
// ============================================================================
import { defineLanguage } from '../machinery/reed/define-language.js';
import { transformForRust, type RustMethod } from '../machinery/bobbin/code-generator.js';
import { RustExternalLayer, Struct, Mutex, Option, i64, u64, string, bool } from './rust-impl.js';
import { RustCore, rustCore } from './spiral/rust.js';
import { RustAndroidSpiraler, RustDesktopSpiraler } from './spiral/spiralers/rust/index.js';

/**
 * Rust language definition.
 * Self-registers on module load.
 */
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
```

## Migration: machinery/bobbin/code-generator.ts

```typescript
// machinery/bobbin/code-generator.ts
// UPDATED: Use language registry instead of hardcoded switch

import { languages } from '../reed/define-language.js';

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
      throw new Error(`Method missing valid name during transform for ${language}`);
    }
    method.camelName = camelCase(method.name);
  }
  
  // Get language definition from registry
  const lang = languages.get(language);
  if (!lang) {
    console.warn(`Unknown language: ${language}, returning untransformed methods`);
    return methods;
  }
  
  // Transform using language's transform function
  let transformed = lang.codeGen.transform(methods);
  
  // Add filter/map overrides (unchanged logic)
  transformed.filter = function (...) { ... };
  transformed.map = function (...) { ... };
  
  return transformed;
}
```

## Migration: warp/spiral/index.ts

```typescript
// warp/spiral/index.ts
// UPDATED: Use language registry for base factories

import { languages } from '../../machinery/reed/define-language.js';

// ... existing spiral function overloads ...

// Auto-generate base factories from registered languages
export namespace spiral {
  // Dynamically populate from language registry
  export const rust = createBaseSpiralerFactory(
    () => {
      const lang = languages.get('rust')!;
      return lang.warp.core.createCore();
    },
    // Aggregate spiraler - combines all language spiralers
    class RustSpiraler extends Spiraler {
      constructor(innerRing: SpiralRing) {
        super(innerRing);
      }
      
      get android() {
        const lang = languages.get('rust')!;
        return new lang.warp.spiralers.android(this.innerRing);
      }
      
      get desktop() {
        const lang = languages.get('rust')!;
        return new lang.warp.spiralers.desktop(this.innerRing);
      }
    }
  );
  
  export const typescript = createBaseSpiralerFactory(
    () => languages.get('typescript')!.warp.core.createCore(),
    class TypescriptSpiraler extends Spiraler {
      // ... typescript spiralers ...
    }
  );
  
  // Could auto-generate from registry:
  // for (const lang of languages.getAll()) {
  //   if (lang.warp.exposeBaseFactory) {
  //     (spiral as any)[lang.name] = createBaseSpiralerFactory(...);
  //   }
  // }
}
```

## Adding a New Language (Example: Swift)

```typescript
// machinery/reed/swift.ts (new file)
import { defineLanguage } from './define-language.js';
import { transformForSwift, type SwiftMethod } from './swift-transform.js';
import { SwiftExternalLayer, Struct, Optional, weak } from './swift-warp.js';
import { SwiftCore, swiftCore } from './swift-spiral.js';
import { SwiftIosSpiraler, SwiftMacosSpiraler } from './swift-spiralers.js';

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
    getStubReturn: (rt, isColl) => {
      if (rt === 'Bool') return 'false';
      if (rt === 'String') return '""';
      if (isColl) return '[]';
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

// Re-exports for WARP usage
export { SwiftExternalLayer, Struct, Optional, weak };
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
const api = loom.spiral.swift.ios.app();  // Type-safe!
```

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create `machinery/reed/define-language.ts` with `LanguageDefinition` interface and `languages` registry
2. Create `machinery/reed/types.ts` for shared types
3. Create `machinery/reed/index.ts` for re-exports

### Phase 2: Rust Migration
1. Move Rust implementation internals to `warp/rust-impl.ts` (private)
2. Update `warp/rust.ts` to:
   - Re-export public API from `rust-impl.ts`
   - Define `rustLanguage` using `defineLanguage()`
3. Update `machinery/bobbin/code-generator.ts` to use `languages` registry
4. Verify all existing tests pass

### Phase 3: TypeScript Migration
1. Same process as Rust
2. Update `warp/typescript.ts` to define `typescriptLanguage`

### Phase 4: Spiral Integration
1. Update `warp/spiral/index.ts` to use language registry for base factories
2. Verify type inference works: `loom.spiral(Foundframe).android` is typed

### Phase 5: Documentation
1. Update HOW_TO_LOOM.md with new language addition guide
2. Add example Swift language as template

## Success Criteria

1. ✅ **No breaking changes** - Existing WARP files continue to work
2. ✅ **Self-registration** - Languages define themselves via `defineLanguage()`
3. ✅ **Code generation integration** - `code-generator.ts` uses registry, not hardcoded switch
4. ✅ **Type-safe navigation** - IDE autocomplete for `loom.spiral(Foundframe).android`
5. ✅ **Add language in one file** - New language = one file with definition + exports

## Files Changed

### New Files
- `machinery/reed/define-language.ts` - Core interface and registry
- `machinery/reed/types.ts` - Shared type definitions
- `machinery/reed/index.ts` - Re-exports

### Modified Files
- `warp/rust.ts` - Self-defines language
- `warp/typescript.ts` - Self-defines language
- `machinery/bobbin/code-generator.ts` - Use language registry
- `warp/spiral/index.ts` - Use language registry for factories

### Internal Moves (implementation detail)
- `warp/rust.ts` internals → `warp/rust-impl.ts` (if needed for organization)

---

> *"The reed guides the threads, but each thread knows its own color."*
