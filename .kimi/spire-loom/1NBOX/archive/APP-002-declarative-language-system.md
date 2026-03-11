# APP-002: Declarative Language System

**Stream**: spire-loom  
**Status**: Implemented  
**Created**: 2026-03-02  
**Replaces**: PLAN-001 through PLAN-004, REVIEW-001

## Conservation Summary

The language system was implemented as a self-registration pattern where languages define themselves. Key insight: **classes as config** enables type inference while maintaining runtime discoverability.

## What Was Built

### Single Kernel File

```typescript
// machinery/reed/language.ts - The entire language system
export interface LanguageDefinition<M = any> {
  name: string;                           // 'rust', 'typescript', ...
  codeGen: {
    fileExtensions: string[];             // ['.rs.ejs']
    transform: (methods) => M[];          // Language-specific transforms
    typeMappings: Array<{tsType, targetType}>;
    getStubReturn: (rt, isColl) => string; // Default values for stubs
  };
  warp: {
    externalLayerClass: typeof ExternalLayer;    // @rust.Struct base
    fieldDecorators: Record<string, PropertyDecorator>; // { Mutex, Option }
    classDecorator: ClassDecorator | ((opts) => ClassDecorator); // Struct
    core: {
      coreClass: typeof CoreRing;         // RustCore
      createCore: (layer?) => CoreRing;   // Factory for "from nothing"
    };
    spiralers: Record<string, typeof Spiraler>; // { android: RustAndroidSpiraler }
    exposeBaseFactory?: boolean;          // loom.spiral.rust
  };
}

export const languages = new LanguageRegistry();  // Global registry
export function defineLanguage<M>(def): LanguageDefinition<M>; // Registration
```

### Self-Registration Pattern

Languages define themselves in their home files:

```typescript
// warp/rust.ts - Everything about Rust lives here
export { Mutex, Option, Struct, ... };   // Public API (unchanged)

import { defineLanguage } from '../machinery/reed/language.js';

export const rustLanguage = defineLanguage({
  name: 'rust',
  codeGen: { fileExtensions: ['.rs.ejs'], transform: transformForRust, ... },
  warp: {
    externalLayerClass: RustExternalLayer,
    fieldDecorators: { Mutex, Option, i64 },  // Direct references, not factories
    classDecorator: Struct,
    core: { coreClass: RustCore, createCore: ... },
    spiralers: { android: RustAndroidSpiraler, desktop: DesktopSpiraler }
  }
});
```

No central configuration. Languages are discovered at module load time.

## Key Design Decisions

### 1. Classes as Config (vs Descriptions)

**Rejected**: Factory-based descriptor pattern
```typescript
// What we didn't do - adds abstraction layer
fieldDecorators: [
  { name: 'Mutex', kind: 'wrapper', fn: () => ... }
]
```

**Adopted**: Direct class/function references
```typescript
// What we did - enables type inference
fieldDecorators: { Mutex, Option }  // Actual decorator functions
spiralers: { android: RustAndroidSpiraler }  // Actual classes
```

**Why**: TypeScript can infer `loom.spiral(Foundframe).android` → `RustAndroidSpiraler` when classes are passed directly. Descriptions require manual type annotations.

### 2. Registry Integration Points

```typescript
// machinery/bobbin/code-generator.ts
function transformMethods(methods, language) {
  // Try registry first (new languages)
  const lang = languages.get(language);
  if (lang?.codeGen?.transform) {
    return lang.codeGen.transform(methods);
  }
  // Fallback to built-in (backward compatibility)
  return applyBuiltinTransform(methods, language);
}

function detectLanguage(templatePath) {
  // Registry knows all file extensions
  return languages.detectByExtension(templatePath)?.name ?? 'unknown';
}
```

### 3. "From Nothing" Pattern Preserved

```typescript
// warp/spiral/index.ts
export namespace spiral {
  export const rust = createBaseSpiralerFactory(
    () => languages.get('rust').warp.core.createCore(),
    class RustSpiraler extends Spiraler {
      get android() {
        const lang = languages.get('rust');
        return new lang.warp.spiralers.android(this.innerRing);
      }
    }
  );
}

// Usage: loom.spiral.rust.android.foregroundService()
// No existing core needed - created on demand
```

## Adding Swift: One File

```typescript
// warp/swift.ts
export { Struct, Optional, weak } from './swift-impl.js';

import { defineLanguage } from '../machinery/reed/language.js';

export const swiftLanguage = defineLanguage({
  name: 'swift',
  codeGen: {
    fileExtensions: ['.swift.ejs'],
    transform: transformForSwift,
    typeMappings: [
      { tsType: 'string', targetType: 'String' },
      { tsType: 'number', targetType: 'Int' },
    ],
    getStubReturn: (rt, isColl) => isColl ? '[]' : 'nil'
  },
  warp: {
    externalLayerClass: SwiftExternalLayer,
    fieldDecorators: { Optional, weak },
    classDecorator: Struct,
    core: { coreClass: SwiftCore, createCore: ... },
    spiralers: { ios: SwiftIosSpiraler, macos: SwiftMacosSpiraler },
    exposeBaseFactory: true
  }
});
```

That's it. The language is now:
- Discoverable by file extension (`.swift.ejs`)
- Available via registry (`languages.get('swift')`)
- Type-safe (`loom.spiral.swift.ios` → `SwiftIosSpiraler`)
- Transform-capable (`transformForSwift` in codegen pipeline)

## What Was Learned

1. **Tauri is not a language concern** - It's a cross-platform multiplexer (MuxSpiraler) that aggregates multiple inner rings. Lives outside language system.

2. **Keep `warp/` as public API** - Moving decorators to `reed/` would break every WARP file. Internal implementation in `machinery/reed/`, public exports from `warp/`.

3. **Async registration is problematic** - Module load-time registration must be sync. Type mappings register asynchronously in background (fire-and-forget).

4. **Spiraler naming is inconsistent** - Some are `{Language}{Target}Spiraler` (RustAndroidSpiraler), some generic (DesktopSpiraler). Future: systematic naming via language definition.

## Files

- `machinery/reed/language.ts` - Kernel (new)
- `warp/rust.ts` - Self-registers (modified)
- `warp/typescript.ts` - Self-registers (modified)
- `machinery/bobbin/code-generator.ts` - Uses registry (modified)

## Tests

All 137 tests pass. No breaking changes.

---

> *"The reed guides the threads, but each thread knows its own color."*
