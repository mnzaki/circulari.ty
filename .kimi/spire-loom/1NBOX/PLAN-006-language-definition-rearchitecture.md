# PLAN-006: Language Definition Rearchitecture — Classes-as-Config with Composable Transforms

**Status**: ✅ **COMPLETE** — All phases finished, backward compatibility removed  
**Date**: 2026-03-02  
**Completed**: 2026-03-03  
**Stream**: spire-loom  
**Spiral Position**: The Thread™ — from 'declare' to 'warp' to 'weave'

---

## The Problem

Current language definitions (`warp/rust.ts`, `warp/typescript.ts`) contain **imperative transform functions** that duplicate logic. Each new language requires copying ~100+ lines of transform boilerplate.

**Goals**:
1. Languages as **pure configuration** with optional enhancements
2. **Proper TypeScript generics** extending existing `warp/` infrastructure
3. **No `any`** — full type safety across the transform pipeline
4. **`.toString()` abuse** for template rendering (no function calls in templates)
5. **EJS with no escaping** — we generate code, not HTML

---

## Key Design Principles

### 1. Extend Existing Infrastructure

Use `ExternalLayer`, `CoreRing`, `Spiraler` as base classes:

```typescript
// Language-specific ExternalLayer
class RustExternalLayer extends ExternalLayer {
  // Rust-specific metadata for struct definitions
}

// Language-specific CoreRing
class RustCore<Layer extends RustExternalLayer> extends CoreRing<{
  android: RustAndroidSpiraler;
  desktop: DesktopSpiraler;
}, Layer, Layer> {
  // Rust-specific core implementation
}
```

### 2. Generic Type Transform Pipeline

```typescript
// Base method type from Management
interface BaseMethod<Param extends BaseParam = BaseParam> {
  name: string;
  params: Param[];
  returnType: string;
  crudOperation?: CrudOperation;
}

// Language-specific param extends base
interface RustParam extends BaseParam {
  rsType: string;        // Language-specific type
  rsName: string;        // snake_case name
}

// Language-specific method extends base
interface RustMethod extends BaseMethod<RustParam> {
  rsReturnType: string;
  implName: string;      // snake_case for Rust
  stubReturn: string;
  // Template helpers (classes with toString())
  params: ParamCollection<RustParam>;
  signature: SignatureHelper<RustMethod>;
}
```

### 3. Template Helper Classes (`.toString()` Abuse)

```typescript
// ParamCollection — renders params in various formats
class ParamCollection<P extends BaseParam> {
  constructor(private params: P[], private config: LanguageConfig<P>) {}
  
  // <%- method.params.list %>
  get list(): ParamListRenderer<P> {
    return new ParamListRenderer(this.params, this.config);
  }
  
  // <%- method.params.names %>
  get names(): ParamNamesRenderer<P> {
    return new ParamNamesRenderer(this.params);
  }
  
  // <%- method.params.invocation %>
  get invocation(): ParamInvocationRenderer<P> {
    return new ParamInvocationRenderer(this.params);
  }
}

// Individual renderers — EJS calls toString()
class ParamListRenderer<P extends BaseParam> {
  constructor(private params: P[], private config: LanguageConfig<P>) {}
  toString(): string {
    return this.params.map(p => 
      `${this.config.formatParamName(p.name)}: ${p[this.config.typeKey]}`
    ).join(', ');
  }
}
```

---

## Architecture

```
LanguageDefinition<Layer, Core, Method, Param>
    │
    ├── layerClass: new () => Layer extends ExternalLayer
    ├── coreClass: new () => Core extends CoreRing
    ├── spiralerClasses: Record<string, new () => Spiraler>
    │
    ├── codeGen: LanguageCodeGenConfig<Method, Param>
    │   │
    │   ├── types: LanguageTypeSystem<Param>
    │   │   ├── primitives: { boolean, string, number, void }
    │   │   └── factories: { array, optional, entity }
    │   │
    │   ├── rendering: TemplateRenderingConfig<Param>
    │   │   ├── paramList: (params: Param[]) => string
    │   │   ├── paramNames: (params: Param[]) => string
    │   │   └── functionSignature: (method: Method) => string
    │   │
    │   └── enhancers: TransformEnhancer<Method, Param>[]
    │
    └── warp: LanguageWarpConfig<Layer, Core>

TransformPipeline<BaseMethod, Method, Param>
    │
    ├── baseMappingEnhancer: Maps types using LanguageTypeSystem
    ├── namingEnhancer: Adds camelName, pascalName, snakeName
    ├── crudEnhancer: Adds crudName (create, getById, list...)
    └── templateHelperEnhancer: Adds params, signature helpers
```

---

## Type Definitions

### Base Types (from existing infrastructure)

```typescript
// From warp/layers.ts
abstract class ExternalLayer extends Layer {}

// From warp/spiral/pattern.ts
abstract class CoreRing<
  S extends Partial<Spiralers>,
  L extends SpiralRing = SpiralRing,
  CoreData = unknown
> extends SpiralRing {
  abstract getSpiralers(): S;
  abstract getMetadata(): CoreMetadata;
}

abstract class Spiraler extends Spiraling {
  constructor(public innerRing: SpiralRing) {}
}
```

### New Language Type System

```typescript
// Language type definition — rich metadata
class LanguageType {
  constructor(
    readonly name: string,
    readonly stubReturn: string,
    readonly isPrimitive: boolean = false,
    readonly isEntity: boolean = false,
  ) {}
}

// Generic type factory interface
interface TypeFactory<P extends BaseParam> {
  // Primitives
  boolean: LanguageType;
  string: LanguageType;
  number: LanguageType;
  void: LanguageType;
  
  // Generic factories
  array(itemType: LanguageType): LanguageType;
  optional(innerType: LanguageType): LanguageType;
  promise(innerType: LanguageType): LanguageType;
  result(okType: LanguageType, errType?: LanguageType): LanguageType;
  
  // Entity factory
  entity(name: string): LanguageType;
  
  // Type mapping from TS type name
  fromTsType(tsType: string, isCollection: boolean): LanguageType;
}
```

### Param and Method Types

```typescript
// Base param — minimal interface
interface BaseParam {
  name: string;
  type: string;
  optional?: boolean;
}

// Language param extends base
interface LanguageParam extends BaseParam {
  // Language-specific type key (rsType, tsType, etc.)
  langType: string;
  // Formatted name (snake_case, camelCase, etc.)
  formattedName: string;
}

// Base method
interface BaseMethod<P extends BaseParam = BaseParam> {
  name: string;              // bind-point name
  implName: string;          // original method name
  returnType: string;        // TS return type
  isCollection: boolean;
  params: P[];
  description?: string;
  crudOperation?: CrudOperation;
  managementName?: string;
  link?: MethodLink;
  useResult?: boolean;
  tags?: string[];
}

// Language method extends base
interface LanguageMethod<P extends LanguageParam = LanguageParam> 
  extends BaseMethod<P> {
  // Naming variants
  camelName: string;
  pascalName: string;
  snakeName: string;
  
  // CRUD helper
  crudName: string;
  
  // Language-specific return type
  returnTypeDef: LanguageType;
  
  // Stub return value
  stubReturn: string;
  
  // Template helpers (classes with toString())
  params: ParamCollection<P>;
  signature: SignatureHelper<this>;
}
```

### Language Definition Interface

```typescript
interface LanguageDefinition<
  Layer extends ExternalLayer = ExternalLayer,
  Core extends CoreRing<any, Layer, any> = CoreRing<any, Layer, any>,
  Method extends LanguageMethod = LanguageMethod,
  Param extends LanguageParam = LanguageParam
> {
  name: string;
  
  layer: {
    // ExternalLayer subclass
    class: new () => Layer;
    // Field decorators for @loom.rust.Mutex, etc.
    fieldDecorators: Record<string, PropertyDecorator>;
    // Class decorator for @loom.rust.Struct
    classDecorator: ClassDecorator | ((options?: any) => ClassDecorator);
  };
  
  core: {
    // CoreRing subclass
    class: new (layer: Layer) => Core;
    // Factory function
    factory: (layer: Layer) => Core;
    // Whether to expose at loom.spiral.{language}
    exposeBaseFactory?: boolean;
  };
  
  spiralers: {
    // Spiraler classes for platform wrapping
    [platform: string]: new (innerRing: SpiralRing) => Spiraler;
  };
  
  codeGen: {
    // File extensions for auto-detection
    fileExtensions: string[];
    
    // Type system configuration
    types: TypeFactory<Param>;
    
    // Rendering configuration
    rendering: {
      // Format a parameter name (snake_case, camelCase, etc.)
      formatParamName: (name: string) => string;
      
      // Function signature generation
      functionSignature: (method: Method) => string;
      asyncFunctionSignature?: (method: Method) => string;
    };
    
    // Optional custom enhancers
    enhancers?: TransformEnhancer<Method, Param>[];
  };
}
```

---

## Transform Pipeline

```typescript
// Transform context passed to enhancers
interface TransformContext<
  Method extends LanguageMethod,
  Param extends LanguageParam
> {
  language: string;
  types: TypeFactory<Param>;
  rendering: LanguageDefinition['codeGen']['rendering'];
}

// Enhancer type
interface TransformEnhancer<
  Method extends LanguageMethod,
  Param extends LanguageParam
> {
  (methods: LanguageMethod[], context: TransformContext<Method, Param>): Method[];
}

// Built-in enhancers
const baseTypeMappingEnhancer: TransformEnhancer = (methods, ctx) => {
  return methods.map(m => ({
    ...m,
    returnTypeDef: ctx.types.fromTsType(m.returnType, m.isCollection),
    params: m.params.map(p => ({
      ...p,
      langType: ctx.types.fromTsType(p.type, false).name,
      formattedName: ctx.rendering.formatParamName(p.name),
    })),
  }));
};

const namingEnhancer: TransformEnhancer = (methods) => {
  return methods.map(m => ({
    ...m,
    camelName: camelCase(m.name),
    pascalName: pascalCase(m.name),
    snakeName: toSnakeCase(m.name),
  }));
};

const crudEnhancer: TransformEnhancer = (methods) => {
  return methods.map(m => ({
    ...m,
    crudName: deriveCrudName(m),
  }));
};

const templateHelperEnhancer: TransformEnhancer = (methods, ctx) => {
  return methods.map(m => ({
    ...m,
    params: new ParamCollection(m.params, ctx),
    signature: new SignatureHelper(m, ctx),
  }));
};

// Default pipeline
const DEFAULT_ENHANCERS = [
  baseTypeMappingEnhancer,
  namingEnhancer,
  crudEnhancer,
  templateHelperEnhancer,
];

// Create transform from config
function createTransform<
  Method extends LanguageMethod,
  Param extends LanguageParam
>(
  config: LanguageDefinition['codeGen'],
  customEnhancers?: TransformEnhancer<Method, Param>[]
): (methods: BaseMethod[]) => Method[] {
  const enhancers = customEnhancers 
    ? [...DEFAULT_ENHANCERS, ...customEnhancers]
    : DEFAULT_ENHANCERS;
  
  return (methods: BaseMethod[]) => {
    const context: TransformContext<Method, Param> = {
      language: config.name,
      types: config.types,
      rendering: config.rendering,
    };
    
    return enhancers.reduce(
      (acc, enhancer) => enhancer(acc, context),
      methods as LanguageMethod[]
    ) as Method[];
  };
}
```

---

## Template Helper Classes

```typescript
// ParamCollection — accessed as method.params in templates
class ParamCollection<P extends LanguageParam> {
  constructor(private params: P[], private context: TransformContext<any, P>) {}
  
  // <%- method.params.list %>
  get list(): ParamListRenderer<P> {
    return new ParamListRenderer(this.params, this.context);
  }
  
  // <%- method.params.names %>
  get names(): ParamNamesRenderer<P> {
    return new ParamNamesRenderer(this.params);
  }
  
  // <%- method.params.invocation %>
  get invocation(): ParamInvocationRenderer<P> {
    return new ParamInvocationRenderer(this.params);
  }
  
  // Array access for iteration
  [Symbol.iterator](): Iterator<P> {
    return this.params[Symbol.iterator]();
  }
}

// Param list renderer — EJS calls toString()
class ParamListRenderer<P extends LanguageParam> {
  constructor(
    private params: P[],
    private context: TransformContext<any, P>
  ) {}
  
  toString(): string {
    return this.params.map(p => 
      `${p.formattedName}: ${p.langType}`
    ).join(', ');
  }
}

// Param names renderer
class ParamNamesRenderer<P extends LanguageParam> {
  constructor(private params: P[]) {}
  
  toString(): string {
    return this.params.map(p => p.formattedName).join(', ');
  }
}

// Param invocation renderer
class ParamInvocationRenderer<P extends LanguageParam> {
  constructor(private params: P[]) {}
  
  toString(): string {
    const names = this.params.map(p => p.formattedName).join(', ');
    // Multi-param uses object destructuring, single param uses plain
    return this.params.length > 1 ? `{ ${names} }` : names;
  }
}

// Signature helper
class SignatureHelper<M extends LanguageMethod> {
  constructor(
    private method: M,
    private context: TransformContext<M, any>
  ) {}
  
  toString(): string {
    return this.context.rendering.functionSignature(this.method);
  }
}
```

---

## Rust Example (After)

```typescript
// warp/rust.ts
import { 
  declareLanguage, 
  LanguageType, 
  type LanguageDefinition 
} from '../machinery/reed/language.js';
import { 
  RustExternalLayer, 
  RustCore, 
  rustCore 
} from './spiral/rust.js';
import { 
  RustAndroidSpiraler, 
  DesktopSpiraler 
} from './spiral/spiralers/index.js';
import { 
  Mutex, Option, i64, u64, string, bool, f64, Vec, Struct 
} from './decorators.js';

// Define Rust-specific param type
interface RustParam extends LanguageParam {
  rsType: string;
  rsName: string;  // snake_case
}

// Define Rust-specific method type
interface RustMethod extends LanguageMethod<RustParam> {
  rsReturnType: string;
  implName: string;  // snake_case for calling impl
  serviceAccessPreamble: string[];
}

// Type factory implementation
class RustTypeFactory implements TypeFactory<RustParam> {
  boolean = new LanguageType('bool', 'false', true);
  string = new LanguageType('String', 'String::new()', true);
  number = new LanguageType('i64', '0', true);
  void = new LanguageType('()', '()', true);
  
  array(item: LanguageType): LanguageType {
    return new LanguageType(`Vec<${item.name}>`, 'Vec::new()');
  }
  
  optional(inner: LanguageType): LanguageType {
    return new LanguageType(`Option<${inner.name}>`, 'None');
  }
  
  result(ok: LanguageType, err: string = 'crate::Error'): LanguageType {
    return new LanguageType(`Result<${ok.name}, ${err}>`, 'Ok(Default::default())');
  }
  
  entity(name: string): LanguageType {
    return new LanguageType(name, `// Entity: ${name}\n    Default::default()`, false, true);
  }
  
  fromTsType(tsType: string, isCollection: boolean): LanguageType {
    // Map from TS type to Rust type
    const base = (() => {
      switch (tsType.toLowerCase()) {
        case 'string': return this.string;
        case 'number': return this.number;
        case 'boolean':
        case 'bool': return this.boolean;
        case 'void': return this.void;
        default: return this.entity(tsType);
      }
    })();
    return isCollection ? this.array(base) : base;
  }
}

// Custom enhancer for Rust-specific additions
const rustEnhancer: TransformEnhancer<RustMethod, RustParam> = (methods) => {
  return methods.map(m => ({
    ...m,
    rsReturnType: m.returnTypeDef.name,
    implName: toSnakeCase(m.implName || m.name),
    serviceAccessPreamble: buildServiceAccessPreamble(m.link),
  }));
};

// Language definition
export const rustLanguage = declareLanguage<RustExternalLayer, RustCore, RustMethod, RustParam>({
  name: 'rust',
  
  layer: {
    class: RustExternalLayer,
    fieldDecorators: { Mutex, Option, i64, u64, string, bool, f64, Vec },
    classDecorator: Struct,
  },
  
  core: {
    class: RustCore,
    factory: rustCore,
    exposeBaseFactory: true,
  },
  
  spiralers: {
    android: RustAndroidSpiraler,
    desktop: DesktopSpiraler,
  },
  
  codeGen: {
    fileExtensions: ['.rs.ejs', '.jni.rs.ejs'],
    
    types: new RustTypeFactory(),
    
    rendering: {
      formatParamName: toSnakeCase,
      functionSignature: (m) => 
        `fn ${m.snakeName}(${m.params.list}) -> ${m.returnTypeDef.name}`,
      asyncFunctionSignature: (m) => 
        `async fn ${m.snakeName}(${m.params.list}) -> ${m.returnTypeDef.name}`,
    },
    
    enhancers: [rustEnhancer],
  },
});
```

---

## Template Usage (Universal)

```ejs
<%# Method signature — language-specific format %>
<%- method.signature %>

<%# Parameters with types — 'id: i64, name: String' %>
<%- method.params.list %>

<%# Just parameter names — 'id, name' %>
<%- method.params.names %>

<%# Parameter invocation style %>
<%- method.params.invocation %>

<%# CRUD method name — 'create', 'getById', 'list', etc. %>
<%- method.crudName %>

<%# Stub return value — language-specific default %>
<%- method.stubReturn %>

<%# Return type name %>
<%- method.returnTypeDef.name %>

<%# Iteration still works %>
<% for (const param of method.params) { %>
  <%= param.formattedName %>: <%= param.langType %>
<% } %>
```

---

## EJS Configuration

```typescript
// machinery/shuttle/template-renderer.ts
import { render } from 'ejs';

export function renderTemplate<
  T extends Record<string, unknown>
>(template: string, data: T): string {
  return render(template, data, {
    escape: (str: string) => str,  // NO HTML escaping
    async: false,
  });
}
```

**Template Convention**: Always use `<%- %>` (unescaped) for consistency. The `escape` option makes `<%-` and `<%=` identical.

---

## Implementation Phases

### Phase A: Foundation Types (PLAN-006-A)
- [x] Create `machinery/reed/language-types.ts` (DONE)
  - `LanguageType` class
  - `BaseParam`, `LanguageParam` interfaces
  - `BaseMethod`, `LanguageMethod` interfaces
  - `TypeFactory` interface
- [x] Create `machinery/bobbin/template-helpers.ts` (DONE)
  - `ParamCollection` class
  - `ParamListRenderer`, `ParamNamesRenderer`, `ParamInvocationRenderer`
  - `SignatureHelper` class

### Phase B: Transform Pipeline (PLAN-006-B)
- [x] Create `machinery/reed/transform-pipeline.ts` (DONE)
  - `TransformContext` interface
  - `TransformEnhancer` interface
  - Built-in enhancers (baseMapping, naming, crud, templateHelper)
  - `createTransform()` factory

### Phase C: Language Definition Update (PLAN-006-C) ✅ DONE
- [x] Update `LanguageDefinition` interface with generics
- [x] Modify `declareLanguage()` to accept new config format
- [x] Auto-generate transform from `types` + `rendering` + `enhancers`
- [x] Made `warp` config optional for code-generation-only languages

### Phase D: EJS Renderer Update (PLAN-006-D) ✅ DONE
- [x] EJS configured with `escape: (s) => s` (no HTML escaping for code gen)
- [x] All templates render correctly

### Phase E: Migration (PLAN-006-E) ✅ DONE
- [x] Migrate `warp/rust.ts` to new format
- [x] Migrate `warp/typescript.ts` to new format
- [x] Verify all 137 tests pass
- [x] Remove old transform functions from `bobbin/code-generator.ts`

### Phase F: New Language Proof (PLAN-006-F) ✅ DONE
- [x] Add `warp/kotlin.ts` using ONLY the new config format
- [x] No custom transform code — pure configuration
- [x] Verify treadles work with Kotlin output

### Phase G: Backward Compatibility Removal (PLAN-006-G) ✅ DONE
- [x] Remove `transformForKotlin()` from `bobbin/code-generator.ts`
- [x] Remove `transformForRust()` from `bobbin/code-generator.ts`
- [x] Remove `transformForRustJni()` from `bobbin/code-generator.ts`
- [x] Remove `transformForAidl()` from `bobbin/code-generator.ts`
- [x] Remove `transformForTypeScript()` from `bobbin/code-generator.ts`
- [x] Remove deprecated type aliases (`KotlinMethod`, `RustMethod`, etc.)
- [x] Update `machinery/bobbin/index.ts` exports
- [x] Update HOW_TO_META_LOOM.md documentation

**Breaking Changes**:
- Old imperative transform functions removed
- Languages must now be imported before use (registers in global registry)
- Template property names changed (e.g., `ktReturnType` → `returnTypeDef.name`)

**Migration Guide**:
```typescript
// OLD: Direct transform call
import { transformForKotlin } from '@o19/spire-loom';
const kotlinMethods = transformForKotlin(rawMethods);

// NEW: Import language (registers itself), use generateCode
import '@o19/spire-loom/warp/kotlin';
import { generateCode } from '@o19/spire-loom';
// generateCode auto-detects language from template extension
```

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Lines per language** | ~150 | ~60 |
| **Type safety** | `any` everywhere | Full generics |
| **New language effort** | Copy-paste + modify | Define classes + config |
| **Template consistency** | Per-language | Universal helpers |
| **Test coverage** | Manual transforms | Pipeline-verified |

---

## Related Documents

- [HOW_TO_LOOM.md](../../../../../HOW_TO_LOOM.md) — End-user documentation
- [HOW_TO_META_LOOM.md](../../../../../HOW_TO_META_LOOM.md) — Architecture deep-dive
- [warp/spiral/pattern.ts](../../../../../warp/spiral/pattern.ts) — Core ring types
- [warp/layers.ts](../../../../../warp/layers.ts) — ExternalLayer base class

---

> *"The spiral contracts before it expands. Language definitions, once verbose and untyped, become essential—compressed to their purest generic form."*
