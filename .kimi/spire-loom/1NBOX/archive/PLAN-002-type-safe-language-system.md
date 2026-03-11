# PLAN-002: Type-Safe Language System with Generics

## Overview

Refactor spire-loom's language support to use type-safe generics instead of `any`,
consolidating language implementations under `reed/` while leveraging existing
variables in `warp/`.

## Goals

1. **Type Safety**: Eliminate `any` types in language definitions using generics
2. **Code Organization**: Move language implementations to `reed/language.ts`, `reed/rust.ts`, `reed/typescript.ts`
3. **Pipeline Integration**: Define clear registration point for languages in the weave pipeline
4. **Template Support**: Enable template classes to use type-safe language variables

## Current State Analysis

### Existing Language Support

```
warp/
├── rust.ts          # @rust.Struct, @rust.Mutex, etc.
├── typescript.ts    # @typescript.Class, @typescript.Optional, etc.
└── spiral/
    ├── rust.ts      # Rust-specific spiral types
    └── typescript.ts # TypeScript-specific spiral types
```

### Problems

1. **No unified language interface** - Rust and TypeScript are separate implementations
2. **Limited type parameters** - `RustExternalLayer<T = any>` uses default `any`
3. **No language registry** - Languages aren't registered/discovered dynamically
4. **Template variable opacity** - Template context variables lack type definitions

## Proposed Architecture

### 1. Core Language Interface (`reed/language.ts`)

```typescript
/**
 * Language definition interface - type-safe language metadata
 */
export interface LanguageDefinition<LangConfig, FieldMeta, ClassMeta> {
  /** Language identifier (e.g., 'rust', 'typescript') */
  readonly id: string;
  
  /** Default file extension */
  readonly extension: string;
  
  /** Field decorator factory */
  createFieldDecorator<Options>(
    name: string,
    apply: (target: unknown, context: DecoratorContext, options: Options) => FieldMeta
  ): PropertyDecorator;
  
  /** Class decorator factory */
  createClassDecorator<Options>(
    name: string,
    apply: (target: unknown, context: DecoratorContext, options: Options) => ClassMeta
  ): ClassDecorator;
  
  /** Convert field metadata to type string */
  fieldToTypeString(fieldMeta: FieldMeta): string;
  
  /** Get wrapper types for field */
  getWrappers(fieldMeta: FieldMeta): string[];
}

/**
 * Language registry for dynamic language discovery
 */
export class LanguageRegistry {
  private languages = new Map<string, LanguageDefinition<unknown, unknown, unknown>>();
  
  register<LangConfig, FieldMeta, ClassMeta>(
    lang: LanguageDefinition<LangConfig, FieldMeta, ClassMeta>
  ): void;
  
  get<LangConfig, FieldMeta, ClassMeta>(
    id: string
  ): LanguageDefinition<LangConfig, FieldMeta, ClassMeta> | undefined;
  
  /** Get all registered languages */
  all(): LanguageDefinition<unknown, unknown, unknown>[];
}

/** Global language registry instance */
export const languages = new LanguageRegistry();
```

### 2. Rust Implementation (`reed/rust.ts`)

```typescript
import { LanguageDefinition, languages } from './language.js';

/**
 * Rust-specific field metadata
 */
export interface RustFieldMetadata {
  wrappers: ('Mutex' | 'Option' | 'Arc' | 'RwLock' | 'Vec')[];
  rustType: string;
  isRef: boolean;
  lifetime?: string;
}

/**
 * Rust-specific class metadata
 */
export interface RustClassMetadata {
  useResult: boolean;
  derives: string[];
  module?: string;
}

/**
 * Rust language definition - fully typed
 */
export const RustLanguage: LanguageDefinition<
  RustClassMetadata,
  RustFieldMetadata,
  RustClassMetadata
> = {
  id: 'rust',
  extension: 'rs',
  
  createFieldDecorator(name, apply) {
    return function <T>(target: T, context: ClassFieldDecoratorContext): void {
      // Implementation with full type safety
    };
  },
  
  createClassDecorator(name, apply) {
    return function <T extends new (...args: any[]) => any>(
      target: T,
      context: ClassDecoratorContext<T>
    ): T {
      // Implementation with full type safety
      return target;
    };
  },
  
  fieldToTypeString(fieldMeta) {
    const wrappers = fieldMeta.wrappers;
    let typeStr = fieldMeta.rustType;
    
    // Apply wrappers from inside out
    for (const wrapper of wrappers) {
      typeStr = `${wrapper}<${typeStr}>`;
    }
    
    return typeStr;
  },
  
  getWrappers(fieldMeta) {
    return fieldMeta.wrappers;
  }
};

// Register on module load
languages.register(RustLanguage);

// Re-export legacy decorators for backward compatibility
export { Mutex, Option, i64, u64, string, bool, f64, Vec, Struct } from '../warp/rust.js';
```

### 3. TypeScript Implementation (`reed/typescript.ts`)

```typescript
import { LanguageDefinition, languages } from './language.js';

/**
 * TypeScript-specific field metadata
 */
export interface TypeScriptFieldMetadata {
  tsType: string;
  optional: boolean;
  readonly: boolean;
  decorators: string[];
}

/**
 * TypeScript-specific class metadata
 */
export interface TypeScriptClassMetadata {
  packageName?: string;
  packagePath?: string;
  isInterface: boolean;
  isExported: boolean;
}

/**
 * TypeScript language definition - fully typed
 */
export const TypeScriptLanguage: LanguageDefinition<
  TypeScriptClassMetadata,
  TypeScriptFieldMetadata,
  TypeScriptClassMetadata
> = {
  id: 'typescript',
  extension: 'ts',
  
  createFieldDecorator(name, apply) {
    return function <T>(target: T, context: ClassFieldDecoratorContext): void {
      // Implementation
    };
  },
  
  createClassDecorator(name, apply) {
    return function <T extends new (...args: any[]) => any>(
      target: T,
      context: ClassDecoratorContext<T>
    ): T {
      return target;
    };
  },
  
  fieldToTypeString(fieldMeta) {
    let typeStr = fieldMeta.tsType;
    if (fieldMeta.optional) {
      typeStr = `${typeStr} | undefined`;
    }
    return typeStr;
  },
  
  getWrappers() {
    return []; // TypeScript doesn't use Rust-style wrappers
  }
};

// Register on module load
languages.register(TypeScriptLanguage);

// Re-export legacy decorators
export { Class, Optional, String, Number, Boolean, Date } from '../warp/typescript.js';
```

## Pipeline Integration

### Registration Point

Languages are registered at **module load time** (not during weaving):

```typescript
// reed/index.ts
export { languages, type LanguageDefinition } from './language.js';

// Auto-register on import
import './rust.js';
import './typescript.js';
```

### Usage in Heddles (Plan Builder)

```typescript
// machinery/heddles/plan-builder.ts
import { languages } from '../reed/index.js';

export class Heddles {
  private languageContext: Map<string, unknown> = new Map();
  
  getLanguage<L>(langId: string): LanguageDefinition<L, unknown, unknown> | undefined {
    return languages.get(langId) as LanguageDefinition<L, unknown, unknown> | undefined;
  }
  
  /**
   * Get type string for a field in a specific language
   */
  getFieldTypeString(
    fieldMeta: EntityFieldMetadata,
    langId: string
  ): string {
    const lang = languages.get(langId);
    if (!lang) {
      throw new Error(`Unknown language: ${langId}`);
    }
    
    // Convert generic field metadata to language-specific
    const langFieldMeta = this.convertToLanguageField(fieldMeta, langId);
    return lang.fieldToTypeString(langFieldMeta);
  }
}
```

### Usage in Bobbin (Templates)

```typescript
// machinery/bobbin/index.ts
import { languages } from '../reed/index.js';

export interface TemplateContext {
  /** Access to language definitions */
  lang: {
    rust: LanguageDefinition<RustClassMetadata, RustFieldMetadata, RustClassMetadata>;
    typescript: LanguageDefinition<TypeScriptClassMetadata, TypeScriptFieldMetadata, TypeScriptClassMetadata>;
  };
  
  /** Convert field to language-specific type */
  fieldType(field: EntityFieldMetadata, language: 'rust' | 'typescript'): string;
}

export function createTemplateContext(heddles: Heddles): TemplateContext {
  return {
    lang: {
      rust: languages.get('rust')!,
      typescript: languages.get('typescript')!
    },
    
    fieldType(field, language) {
      return heddles.getFieldTypeString(field, language);
    }
  };
}
```

## Template Variable Types

### EJS Template Variables (Type-Safe)

```typescript
// machinery/bobbin/types.ts

/**
 * Type-safe template variables for EJS
 */
export interface BobbinTemplateVars {
  /** Core naming */
  coreName: string;
  coreNamePascal: string;
  coreCrateName: string;
  
  /** Language access */
  lang: {
    rust: RustTemplateVars;
    typescript: TypeScriptTemplateVars;
  };
  
  /** Helper functions */
  toSnakeCase: (s: string) => string;
  toKebabCase: (s: string) => string;
  toPascalCase: (s: string) => string;
  
  /** Method metadata */
  methods: MethodTemplateVars[];
  
  /** Entity metadata */
  entities: EntityTemplateVars[];
}

export interface RustTemplateVars {
  /** Type mappings */
  typeMap: Map<string, string>;  // TS type -> Rust type
  
  /** Wrapper helpers */
  wrapMutex: (type: string) => string;
  wrapOption: (type: string) => string;
  wrapArc: (type: string) => string;
  wrapResult: (type: string) => string;
  
  /** Field to Rust type */
  fieldType: (field: EntityFieldMetadata) => string;
}

export interface TypeScriptTemplateVars {
  /** Type mappings */
  typeMap: Map<string, string>;  // Internal type -> TS type
  
  /** Field to TS type */
  fieldType: (field: EntityFieldMetadata) => string;
}
```

## Migration Strategy

### Phase 1: Create New Structure
1. Create `reed/language.ts` with base interfaces
2. Create `reed/rust.ts` wrapping existing warp/rust.ts
3. Create `reed/typescript.ts` wrapping existing warp/typescript.ts
4. Update `reed/index.ts` to export and auto-register

### Phase 2: Update Heddles
1. Add language registry access to Heddles class
2. Add type conversion methods
3. Update GeneratorContext to include typed lang access

### Phase 3: Update Bobbin
1. Add typed template variables
2. Update EJS context creation
3. Add type guards for template variables

### Phase 4: Deprecate Old API
1. Mark warp/rust.ts and warp/typescript.ts as deprecated
2. Update all imports to use reed/
3. Remove old files in next major version

## Files to Create/Modify

### New Files
- `reed/language.ts` - Core language interfaces and registry
- `reed/rust.ts` - Rust language implementation
- `reed/typescript.ts` - TypeScript language implementation

### Modified Files
- `reed/index.ts` - Add exports and auto-registration
- `machinery/heddles/types.ts` - Add language-aware types
- `machinery/heddles/plan-builder.ts` - Add language methods
- `machinery/bobbin/index.ts` - Add typed template variables
- `machinery/bobbin/types.ts` - Define template variable types

### Deprecated (Phase 4)
- `warp/rust.ts` - Use reed/rust.ts instead
- `warp/typescript.ts` - Use reed/typescript.ts instead

## Success Criteria

1. **No `any` in language definitions** - All language metadata is typed
2. **Template type safety** - EJS templates have typed variable access
3. **Dynamic language registration** - New languages can be registered without modifying core code
4. **Backward compatibility** - Existing code continues to work during migration

## Timeline

- **Week 1**: Create reed/language.ts, reed/rust.ts, reed/typescript.ts
- **Week 2**: Update heddles with language registry integration
- **Week 3**: Update bobbin with typed template variables
- **Week 4**: Testing and documentation

## Related

- PLAN-001-desktop-platform-implementation.md (previous work)
- APP-001-entity-field-metadata.md (field metadata system)
