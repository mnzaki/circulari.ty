# APP-001: Entity Field Metadata System

**Status:** Implemented ✅ (infrastructure complete, templates pending)  
**Pattern:** RustStruct-style runtime objects (zero field decorators)  
**Target:** Enable OPTIMAL_TEMPLATE.rs.ejs code generation  
**Location:** `.kimi/spire-loom/1NBOX/` (migrated per RFC-002)  
**Tests:** 128 passing

---

## Goal
Enable full field-level metadata using **runtime factory objects** (RustStruct pattern) to support optimal Rust/SQL code generation per OPTIMAL_TEMPLATE.rs.ejs.

## Design Principle: Convention Over Decoration

```typescript
// ✅ ZERO field decorators - just factory assignments
import { crud } from '@o19/spire-loom';

@BookmarkMgmt.Entity()
class Bookmark {
  id = crud.field.id();                    // Primary key, i64, INTEGER
  url = crud.field.string();               // String, TEXT, NOT NULL
  title = crud.field.string({ nullable: true });
  createdAt = crud.field.createdAt();      // Auto-managed
  updatedAt = crud.field.updatedAt();      // Auto-managed
}
```

**Why this pattern:**
1. ✅ **No decorators** on fields
2. ✅ **Runtime metadata** - each field is an object with full type info
3. ✅ **TypeScript inference** - methods return typed `Field<T>` objects
4. ✅ **Prototype inspection** - iterate fields, collect metadata
5. ✅ **Composable** - chain options, reuse patterns

---

## OPTIMAL_TEMPLATE.rs.ejs Requirements

### Entity Context Needed
```typescript
context.entity = {
  name: "Bookmark",                    // ✓ From entity class name
  tableName: "bookmark",               // ✓ From @Entity({ table: "..." })
  lower: "bookmark",                   // ✓ Computed
  operations: ["create", "read", ...], // ✓ From linked Management CRUD
  
  // Field arrays for templates
  fields: [...],                       // ✓ All fields with metadata
  insertFields: [...],                 // ✓ Fields where forInsert=true
  updateFields: [...],                 // ✓ Fields where forUpdate=true
  
  // SQL helpers
  insertColumns: ["url", "title"],     // ✓ insertFields.map(f => f.columnName)
  insertPlaceholders: ["?", "?"],      // ✓ insertFields.map(() => "?")
}
```

### Field Metadata Needed (per OPTIMAL_TEMPLATE)
```typescript
{
  name: "url",              // ✓ Property name
  rustType: "String",       // ✓ Mapped from TS type
  columnName: "url",        // ✓ snake_case(name) via stringing.ts
  nullable: false,          // ✓ From options or ! operator in TS
  isPrimary: false,         // ✓ From crud.field.id() 
  isCreatedAt: false,       // ✓ From crud.field.createdAt()
  isUpdatedAt: false,       // ✓ From crud.field.updatedAt()
  forInsert: true,          // ✓ Computed: !isPrimary && !isCreatedAt && !isUpdatedAt
  forUpdate: true,          // ✓ Computed: !isPrimary && !isCreatedAt
}
```

---

## Field Factory API (crud.field namespace)

**Export Location:** `warp/crud.ts` exports `field` namespace  
**Available as:** `crud.field.id()`, `crud.field.string()`, etc.

```typescript
import { crud } from '@o19/spire-loom';

// Core factories (cover 90% of cases)
crud.field.id(options?: IdOptions): PrimaryKeyField<number>          // Primary key
crud.field.string(options?: StringOptions): Field<string>             // VARCHAR/TEXT
crud.field.text(options?: StringOptions): Field<string>               // SQL TEXT
crud.field.int(options?: NumberOptions): Field<number>                // SQL INTEGER
crud.field.bool(options?: BaseOptions): Field<boolean>                // SQL BOOLEAN
crud.field.createdAt(options?: TimestampOptions): TimestampField      // Auto-managed
crud.field.updatedAt(options?: TimestampOptions): TimestampField      // Auto-managed
crud.field.timestamp(options?: TimestampOptions): Field<number>       // Generic timestamp
crud.field.json<T>(options?: BaseOptions): Field<T>                   // SQL JSON

// Generic (escape hatch)
crud.field.custom<T>(tsType: string, options: FieldOptions<T>): Field<T>
```

---

## Field Class Hierarchy

```typescript
// Base field with metadata
export class Field<T> {
  // Set at construction (by factory)
  tsType: string;           // 'string', 'number', 'boolean', 'object'
  options: FieldOptions<T>;
  
  // Set by @Mgmt.Entity() decorator after instantiation
  name: string = '';        // Property name
  
  constructor(tsType: string, options: FieldOptions<T> = {}) {
    this.tsType = tsType;
    this.options = options;
  }
  
  // Computed properties (for template use)
  get rustType(): string {
    return this.options.rustType ?? mapToRustType(this.tsType);
  }
  
  get sqlType(): string {
    return this.options.sqlType ?? mapToSqlType(this.tsType);
  }
  
  get columnName(): string {
    return this.options.columnName ?? toSnakeCase(this.name);
  }
  
  get nullable(): boolean {
    return this.options.nullable ?? false;
  }
  
  get isPrimary(): boolean {
    return this.options.isPrimary ?? false;
  }
  
  get isCreatedAt(): boolean {
    return this.options.isCreatedAt ?? false;
  }
  
  get isUpdatedAt(): boolean {
    return this.options.isUpdatedAt ?? false;
  }
  
  get forInsert(): boolean {
    return !this.isPrimary && !this.isCreatedAt && !this.isUpdatedAt;
  }
  
  get forUpdate(): boolean {
    return !this.isPrimary && !this.isCreatedAt;
  }
}

// Specialized field types
export class PrimaryKeyField extends Field<number> {
  constructor(options?: IdOptions) {
    super('number', {
      isPrimary: true,
      rustType: 'i64',
      sqlType: 'INTEGER',
      nullable: false,
      ...options
    });
  }
}

export class TimestampField extends Field<number> {
  constructor(isCreated: boolean, options?: TimestampOptions) {
    super('number', {
      rustType: 'i64',
      sqlType: 'INTEGER',
      nullable: false,
      isCreatedAt: isCreated,
      isUpdatedAt: !isCreated,
      ...options
    });
  }
}
```

---

## Options Interfaces

```typescript
export interface BaseOptions<T = any> {
  nullable?: boolean;           // Default: false
  rustType?: string;            // Override auto-mapping
  sqlType?: string;             // Override auto-mapping  
  columnName?: string;          // Override snake_case
  default?: T | (() => T);      // Default value (for Rust Default impl)
  // Internal flags (set by specialized factories)
  isPrimary?: boolean;
  isCreatedAt?: boolean;
  isUpdatedAt?: boolean;
}

export interface StringOptions extends BaseOptions<string> {
  length?: number;              // For VARCHAR(n), default TEXT
}

export interface NumberOptions extends BaseOptions<number> {
  min?: number;
  max?: number;
}

export interface IdOptions extends BaseOptions<number> {
  // Primary key specific options
}

export interface TimestampOptions extends BaseOptions<number> {
  autoNow?: boolean;            // Set on insert (createdAt)
  autoNowUpdate?: boolean;      // Set on update (updatedAt)
}

export interface FieldOptions<T> extends BaseOptions<T> {}
```

---

## Shared Abstractions & Opportunities

### 🔧 **Pattern 1: Unified Type Mapping Registry**

**Current State:** Type mappings scattered across `type-mappings.ts`  
**Opportunity:** Single registry for TS→All Platforms

```typescript
// machinery/bobbin/type-registry.ts (NEW)
export interface TypeMapping {
  tsType: string;
  rust: string;
  kotlin: string;
  jni: string;
  tauri: string;
  sql: string;        // NEW: SQL type
  aidl: string;       // NEW: AIDL type (from stringing.ts)
}

// Single source of truth
const TYPE_REGISTRY: Record<string, TypeMapping> = {
  'string': {
    tsType: 'string',
    rust: 'String',
    kotlin: 'String',
    jni: 'JString',
    tauri: 'string',
    sql: 'TEXT',      // NEW
    aidl: 'String'    // From stringing.ts
  },
  'number': {
    tsType: 'number',
    rust: 'i64',      // Change from i32 for entity IDs
    kotlin: 'Long',
    jni: 'jlong',
    tauri: 'number',
    sql: 'INTEGER',
    aidl: 'long'
  },
  // ...
};

export function mapType(tsType: string, target: 'rust' | 'kotlin' | 'jni' | 'tauri' | 'sql' | 'aidl'): string;
```

**Benefits:**
- One place to add new types
- Consistent mappings across all generators
- No drift between SQL and Rust types

---

### 🔧 **Pattern 2: Computed Metadata Mixin**

**Current State:** `forInsert`, `forUpdate` computed in Field class  
**Opportunity:** Shared mixin for computed SQL metadata

```typescript
// machinery/sley/computed-metadata.ts (NEW)
export interface ComputedSqlMetadata {
  forInsert: boolean;
  forUpdate: boolean;
  forSelect: boolean;
}

export function computeSqlMetadata(
  field: { isPrimary: boolean; isCreatedAt: boolean; isUpdatedAt: boolean }
): ComputedSqlMetadata {
  return {
    forInsert: !field.isPrimary && !field.isCreatedAt && !field.isUpdatedAt,
    forUpdate: !field.isPrimary && !field.isCreatedAt,
    forSelect: true
  };
}

// Used by both Field class and pipeline
```

**Used by:**
- `warp/field.ts` - Field class getters
- `machinery/sley/entity-pipeline.ts` - computeFieldHelpers()

---

### 🔧 **Pattern 3: Shared Pipeline Translations**

**Current State:** MethodPipeline and EntityPipeline are separate but similar  
**Opportunity:** Generic pipeline building blocks

```typescript
// machinery/sley/pipeline-helpers.ts (NEW or extend existing)

// Generic filter for "items with flag"
export function flagFilter<T>(
  items: T[], 
  flagExtractor: (item: T) => boolean
): T[] {
  return items.filter(flagExtractor);
}

// Generic mapper for "extract property"
export function propertyMapper<T, K extends keyof T>(
  items: T[], 
  property: K
): T[K][] {
  return items.map(item => item[property]);
}

// Specific to entities
export function extractInsertColumns(fields: EntityFieldMetadata[]): string[] {
  return fields
    .filter(f => f.forInsert)
    .map(f => f.columnName);
}

export function extractUpdateColumns(fields: EntityFieldMetadata[]): string[] {
  return fields
    .filter(f => f.forUpdate)
    .map(f => f.columnName);
}
```

**Used by:**
- `method-pipeline.ts` - CRUD filtering
- `entity-pipeline.ts` - Field filtering
- `context-entities.ts` - Helper generation

---

### 🔧 **Pattern 4: Context Helpers Factory**

**Current State:** `buildContextMethods()` and `buildContextEntities()` are similar  
**Opportunity:** Generic helpers factory

```typescript
// machinery/treadle-kit/context-helpers.ts (NEW)
export interface ContextHelpers<T> {
  all: T[];
  byManagement(): Map<string, T[]>;
  withTag(tag: string): T[];
  forEach(cb: (item: T) => void): void;
  filteredForEach(filter: (item: T) => boolean, cb: (item: T) => void): void;
}

export function buildContextHelpers<T extends { managementName: string }>(
  items: T[],
  tagExtractor: (item: T) => string[] | undefined
): ContextHelpers<T> {
  return {
    all: items,
    
    byManagement(): Map<string, T[]> {
      const grouped = new Map<string, T[]>();
      for (const item of items) {
        const list = grouped.get(item.managementName) ?? [];
        list.push(item);
        grouped.set(item.managementName, list);
      }
      return grouped;
    },
    
    withTag(tag: string): T[] {
      return items.filter(item => tagExtractor(item)?.includes(tag));
    },
    
    forEach(cb: (item: T) => void): void {
      items.forEach(cb);
    },
    
    filteredForEach(filter: (item: T) => boolean, cb: (item: T) => void): void {
      items.filter(filter).forEach(cb);
    }
  };
}

// Then specialize:
export function buildContextMethods(methods: RawMethod[]): MethodHelpers {
  const base = buildContextHelpers(methods, m => (m as any).tags);
  return {
    ...base,
    byCrud() { /* specific to methods */ },
    get creates() { return this.withCrud('create'); },
    // ...
  };
}

export function buildContextEntities(entities: EntityMetadata[]): EntityHelpers {
  const base = buildContextHelpers(entities, e => e.options?.tags);
  return {
    ...base,
    get readOnly() { return entities.filter(e => e.options?.readOnly); },
    get readWrite() { return entities.filter(e => !e.options?.readOnly); },
    // ...
  };
}
```

**Benefits:**
- Consistent API across methods and entities
- Less code duplication
- Easy to add new helper types

---

### 🔧 **Pattern 5: Class Metadata Collector Pattern**

**Current State:** Separate collection for Management methods and Entity fields  
**Opportunity:** Shared pattern with specialized extractors

```typescript
// machinery/reed/class-metadata-collector.ts (NEW)
export interface ClassMetadataCollector<T> {
  // Instantiate class and collect metadata from instance
  collect(Class: new (...args: any[]) => any): T[];
}

// Generic implementation
export function createCollector<T>(
  predicate: (value: unknown, prop: string) => boolean,
  extractor: (value: unknown, prop: string) => T
): ClassMetadataCollector<T> {
  return {
    collect(Class) {
      const instance = new Class();
      const results: T[] = [];
      
      for (const prop of Object.getOwnPropertyNames(instance)) {
        const value = (instance as any)[prop];
        if (predicate(value, prop)) {
          results.push(extractor(value, prop));
        }
      }
      
      return results;
    }
  };
}

// Specialized collectors
export const collectEntityFields = createCollector(
  (value) => value instanceof Field,
  (value, prop) => {
    (value as Field<any>).name = prop;
    return extractFieldMetadata(value as Field<any>);
  }
);

// Future: collectManagementConstants, collectServiceConfig, etc.
```

**Used by:**
- `management-collector.ts` - Entity field collection
- Future: Any class-based metadata collection

---

### 🔧 **Pattern 6: Computed Property Builder**

**Current State:** `insertColumns`, `insertPlaceholders` computed inline  
**Opportunity:** Reusable computed property definitions

```typescript
// machinery/treadle-kit/computed-entity-helpers.ts (NEW or in entity-pipeline.ts)
export interface ComputedEntityHelpers {
  insertFields: EntityFieldMetadata[];
  updateFields: EntityFieldMetadata[];
  insertColumns: string[];
  insertPlaceholders: string[];
  updateColumns: string[];
  updatePlaceholders: string[];
  primaryField?: EntityFieldMetadata;
}

export function buildComputedHelpers(
  fields: EntityFieldMetadata[]
): ComputedEntityHelpers {
  const insertFields = fields.filter(f => f.forInsert);
  const updateFields = fields.filter(f => f.forUpdate);
  
  return {
    insertFields,
    updateFields,
    insertColumns: insertFields.map(f => f.columnName),
    insertPlaceholders: insertFields.map(() => '?'),
    updateColumns: updateFields.map(f => f.columnName),
    updatePlaceholders: updateFields.map(() => '?'),
    primaryField: fields.find(f => f.isPrimary)
  };
}

// Used in both pipeline and context
```

---

## Summary: Abstraction Layers

| Layer | Abstraction | Files |
|-------|-------------|-------|
| **Type System** | Unified type registry | `type-mappings.ts` (extend) |
| **Metadata Collection** | Generic class collector | `class-metadata-collector.ts` (NEW) |
| **Computed Values** | SQL metadata computation | `computed-metadata.ts` (NEW) |
| **Pipeline** | Generic filter/map helpers | `pipeline-helpers.ts` (NEW) |
| **Context** | Generic helpers factory | `context-helpers.ts` (NEW) |
| **Entity Helpers** | Computed SQL helpers | `computed-entity-helpers.ts` (NEW or inline) |

**Key Decision Points:**
1. **Unified Type Registry** - Worth it if we add more than 3-4 new types
2. **Generic Context Helpers** - Worth it for consistency across methods/entities/fields
3. **Class Metadata Collector** - Worth it if we foresee more class-based collection
4. **Computed Helpers** - Worth it for testability and reuse

---

## How @Mgmt.Entity() Collects Fields

```typescript
// Enhanced Entity() decorator
static get Entity() {
  return Object.assign(
    function<T extends new (...args: any[]) => any>(
      this: typeof Management, target: T, context: ClassDecoratorContext<T>
    ): T {
      // Register entity (existing)
      const metadata = registerEntity(this, target, context, {});
      
      // NEW: Collect field instances from prototype
      const fields = collectEntityFields(target);  // Uses shared collector pattern
      metadata.fields = fields;
      
      return target;
    },
    { options: (opts: EntityOptions) => ... }
  );
}
```

---

## Reusable Components Survey

### ✅ **Stringing.ts** - NAMING UTILITIES
```typescript
// Already have: toSnakeCase, pascalCase, camelCase
toSnakeCase('createdAt') // 'created_at' - PERFECT for SQL column names!
```

### ✅ **Type-Mappings.ts** - TYPE CONVERSIONS
```typescript
// Already have: mapToRustType('string') → 'String'
// NEED TO ADD: SQL type mappings
mapToSqlType('string') // → 'TEXT'
mapToSqlType('number') // → 'INTEGER'
```

### ✅ **Entity Pipeline** - PROCESSING PATTERN
```typescript
// Already mirrors MethodPipeline
// Can add: computeFieldMetadata(), setSqlTypes() translations
```

### ✅ **Context Entities** - HELPER PATTERN
```typescript
// buildContextEntities() already exists
// Similar pattern: buildContextFields() or extend with computed helpers
```

### ✅ **Global Registry** - METADATA STORAGE
```typescript
// warp/imprint.ts already has global WeakMaps
// EntityMetadata can be extended with fields array
```

### ✅ **Management Collector** - CLASS INSTANTIATION PATTERN
```typescript
// Already instantiates Management classes to collect metadata
// SAME PATTERN: Instantiate entity class → collect Field instances
```

---

## Implementation Strategy (Leveraging Existing Code)

### 1. Extend `machinery/bobbin/type-mappings.ts`
```typescript
// ADD SQL mappings:
const SQL_MAPPINGS: Record<string, string> = {
  'string': 'TEXT',
  'number': 'INTEGER',
  'boolean': 'INTEGER',
};

export function mapToSqlType(tsType: string): string;
```

### 2. Create `warp/field.ts` (NEW but follows RustStruct pattern)
```typescript
// Field classes with metadata
// Factory methods: id(), string(), text(), int(), timestamp(), etc.
```

### 3. Extend `warp/crud.ts` - ADD field namespace
```typescript
// Export field factory as part of crud namespace:
export const field = {
  id: (opts?: IdOptions) => new PrimaryKeyField(opts),
  string: (opts?: StringOptions) => new Field<string>('string', opts),
  text: (opts?: StringOptions) => new Field<string>('string', { sqlType: 'TEXT', ...opts }),
  int: (opts?: NumberOptions) => new Field<number>('number', opts),
  bool: (opts?: BaseOptions) => new Field<boolean>('boolean', opts),
  createdAt: (opts?: TimestampOptions) => new TimestampField(true, opts),
  updatedAt: (opts?: TimestampOptions) => new TimestampField(false, opts),
  timestamp: (opts?: TimestampOptions) => new Field<number>('number', opts),
  json: <T>(opts?: BaseOptions) => new Field<T>('object', { sqlType: 'JSON', ...opts }),
};
```

### 4. Extend `warp/imprint.ts` - EntityMetadata
```typescript
// ADD to EntityMetadata interface:
export interface EntityMetadata {
  // ...existing...
  fields?: EntityFieldMetadata[];  // NEW
}

// EntityFieldMetadata matches what templates need
export interface EntityFieldMetadata {
  name: string;
  tsType: string;
  rustType: string;
  sqlType: string;
  columnName: string;
  nullable: boolean;
  isPrimary: boolean;
  isCreatedAt: boolean;
  isUpdatedAt: boolean;
  forInsert: boolean;
  forUpdate: boolean;
}
```

### 5. Create `machinery/reed/entity-field-collector.ts` (NEW)
```typescript
// Uses shared collector pattern (Pattern 5)
import { createCollector } from './class-metadata-collector.js';

export const collectEntityFields = createCollector(
  (value) => value instanceof Field,
  (value, prop) => {
    (value as Field<any>).name = prop;
    return extractFieldMetadata(value as Field<any>);
  }
);
```

### 6. Extend `machinery/reed/management-collector.ts`
```typescript
// In extractMetadata(), after getting entities:
import { collectEntityFields } from './entity-field-collector.js';

for (const entity of entities) {
  entity.fields = collectEntityFields.collect(entity.entityClass);
}
```

### 7. Extend `machinery/sley/entity-pipeline.ts`
```typescript
// Uses computed helpers (Pattern 6)
import { buildComputedHelpers } from '../treadle-kit/computed-entity-helpers.js';

export function computeFieldHelpers(): EntityTranslation {
  return (entities) => entities.map(e => ({
    ...e,
    ...buildComputedHelpers(e.fields || [])
  }));
}
```

### 8. Extend `machinery/treadle-kit/context-entities.ts`
```typescript
// Uses generic helpers factory (Pattern 4)
import { buildContextHelpers } from './context-helpers.js';

export function buildContextEntities(entities: EntityMetadata[]): EntityHelpers {
  const base = buildContextHelpers(entities, e => e.options?.tags);
  
  return {
    ...base,
    
    // Add entity-specific helpers
    withFields() {
      return entities.map(e => ({
        ...e,
        ...buildComputedHelpers(e.fields || [])
      }));
    },
    
    get readOnly() { 
      return entities.filter(e => e.options?.readOnly); 
    },
    
    get readWrite() { 
      return entities.filter(e => !e.options?.readOnly); 
    }
  };
}
```

---

## Usage Examples

### Basic Entity (matches OPTIMAL_TEMPLATE)
```typescript
import { crud } from '@o19/spire-loom';

@BookmarkMgmt.Entity()
class Bookmark {
  id = crud.field.id();
  url = crud.field.string();
  title = crud.field.string({ nullable: true });
  notes = crud.field.text({ nullable: true });
  createdAt = crud.field.createdAt();
  updatedAt = crud.field.updatedAt();
}
```

**Generated metadata:**
```typescript
{
  name: "Bookmark",
  tableName: "bookmark",
  lower: "bookmark",
  fields: [
    { name: "id", tsType: "number", rustType: "i64", sqlType: "INTEGER", 
      columnName: "id", nullable: false, isPrimary: true, 
      isCreatedAt: false, isUpdatedAt: false, forInsert: false, forUpdate: false },
    { name: "url", tsType: "string", rustType: "String", sqlType: "TEXT",
      columnName: "url", nullable: false, isPrimary: false,
      isCreatedAt: false, isUpdatedAt: false, forInsert: true, forUpdate: true },
    { name: "title", tsType: "string", rustType: "String", sqlType: "TEXT",
      columnName: "title", nullable: true, ... },
    { name: "createdAt", tsType: "number", rustType: "i64", sqlType: "INTEGER",
      columnName: "created_at", nullable: false, isPrimary: false,
      isCreatedAt: true, isUpdatedAt: false, forInsert: false, forUpdate: false }
  ],
  insertFields: [url, title],
  insertColumns: ["url", "title"],
  insertPlaceholders: ["?", "?"]
}
```

### Custom SQL Type
```typescript
class Bookmark {
  id = crud.field.id();
  url = crud.field.string({ sqlType: 'VARCHAR(2048)' });
  metadata = crud.field.json<BookmarkMeta>({ sqlType: 'JSONB' });
}
```

### Non-Standard Primary Key
```typescript
class Bookmark {
  // Not named 'id', so explicitly mark as primary
  bookmarkId = crud.field.int({ isPrimary: true, rustType: 'BookmarkId' });
  url = crud.field.string();
}
```

---

## Implementation Phases

### Phase 1: Type Mappings
**File:** `machinery/bobbin/type-mappings.ts`
- Add SQL type mappings
- `mapToSqlType()` function

### Phase 2: Field Classes  
**File:** `warp/field.ts` (NEW)
- `Field<T>` base class
- `PrimaryKeyField`, `TimestampField` specialized classes

### Phase 3: Field Factory
**File:** `warp/crud.ts`
- Add `export const field = { ... }` namespace
- Factory methods: `id()`, `string()`, `text()`, `int()`, `bool()`, `createdAt()`, `updatedAt()`, `timestamp()`, `json()`

### Phase 4: EntityMetadata Extension
**File:** `warp/imprint.ts`
- Add `fields?: EntityFieldMetadata[]` to `EntityMetadata`
- Define `EntityFieldMetadata` interface

### Phase 5: Shared Abstractions (Optional but Recommended)
**Files:**
- `machinery/sley/computed-metadata.ts` - Shared SQL computation
- `machinery/reed/class-metadata-collector.ts` - Generic collector pattern
- `machinery/treadle-kit/computed-entity-helpers.ts` - Computed helpers builder

### Phase 6: Field Collection
**File:** `machinery/reed/entity-field-collector.ts`
- Uses shared collector pattern (if Phase 5 done)
- Or standalone collector (if skipping Phase 5)

### Phase 7: Integration
**File:** `machinery/reed/management-collector.ts`
- Call `collectEntityFields()` for each entity

### Phase 8: Pipeline Extensions
**File:** `machinery/sley/entity-pipeline.ts`
- Add `computeFieldHelpers()` translation
- Uses computed helpers builder

### Phase 9: Context Helpers
**File:** `machinery/treadle-kit/context-entities.ts`
- Build `withFields()` helper
- Return entities with computed SQL helpers

### Phase 10: Template Updates
**Files:** `o19/loom/bobbin/rust/db/*.ejs`
- Update to use new entity context
- Verify OPTIMAL_TEMPLATE patterns work

---

## Files Modified

| File | Changes |
|------|---------|
| `machinery/bobbin/type-mappings.ts` | Add SQL type mappings |
| `warp/field.ts` | **NEW**: Field classes |
| `warp/crud.ts` | Add `field` namespace with factory methods |
| `warp/imprint.ts` | Extend `EntityMetadata` with `fields` array |
| `machinery/sley/computed-metadata.ts` | **NEW** (optional): Shared SQL computation |
| `machinery/reed/class-metadata-collector.ts` | **NEW** (optional): Generic collector pattern |
| `machinery/reed/entity-field-collector.ts` | **NEW**: Collect fields from entity class |
| `machinery/reed/management-collector.ts` | Integrate field collection |
| `machinery/sley/entity-pipeline.ts` | Add `computeFieldHelpers()` translation |
| `machinery/treadle-kit/computed-entity-helpers.ts` | **NEW** (optional): Computed helpers builder |
| `machinery/treadle-kit/context-entities.ts` | Build `withFields()` helper |
| `o19/loom/bobbin/rust/db/*.ejs` | Update templates (verify OPTIMAL_TEMPLATE works) |

---

## Testing Checklist

- [ ] `crud.field.id()` creates primary key with forInsert=false
- [ ] `crud.field.createdAt()` sets isCreatedAt=true, forInsert=false, forUpdate=false
- [ ] `crud.field.updatedAt()` sets isUpdatedAt=true, forUpdate=false
- [ ] `insertColumns` excludes primary key and timestamps
- [ ] `insertPlaceholders` matches insertFields length
- [ ] `updateFields` excludes primary key and createdAt
- [ ] Template generates valid Rust Default impl
- [ ] OPTIMAL_TEMPLATE.rs.ejs patterns work

---

## Success Criteria

- [ ] Zero field decorators in common case
- [ ] `crud.field.*` factories available
- [ ] Bookmark entity has complete field metadata
- [ ] `entity.insertColumns` excludes primary key and auto timestamps
- [ ] `entity.updateFields` excludes primary key and createdAt
- [ ] Template can generate `#[derive(Default)]` with proper field defaults
- [ ] All existing tests pass

---

## References

- **OPTIMAL_TEMPLATE.rs.ejs**: `/home/mnzaki/Projects/circulari.ty/o19/loom/OPTIMAL_TEMPLATE.rs.ejs`
- **Current Entity System**: `warp/imprint.ts` (Management.Entity decorator)
- **RustStruct Pattern**: `warp/rust.ts` (for inspiration)
- **String Utilities**: `machinery/stringing.ts` (toSnakeCase)
- **Type Mappings**: `machinery/bobbin/type-mappings.ts`
- **Method Pipeline**: `machinery/sley/method-pipeline.ts` (pattern reference)
- **Context Methods**: `machinery/treadle-kit/context-methods.ts` (helper pattern)

---

> *"The spiral conserves as it ascends. This APP lives in the 1NBOX so all instances may see and consent."*
