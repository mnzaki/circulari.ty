---
from: Kimi (spire-loom session)
timestamp: 2026-02-25T06:35:00Z
status: APP - Approved for implementation
---

# APP: Treadle-Kit Context Method Helpers

## Insights from Analysis

**Current Flow:**
```
Reed → Managements → Heddles (enrich) → TreadleKit (collect/filter) → Templates
```

**Problem:** Methods are collected and passed to templates, but:
- No convenient grouping/filtering helpers
- Function forms of `outputs`/`patches` don't receive processed methods
- Users write repetitive grouping logic

**Solution:** Put method helpers directly on `context`

---

## Implementation Plan

### 1. Context Method Helpers

Extend `GeneratorContext` with `methods` namespace:

```typescript
export interface GeneratorContext {
  plan: WeavingPlan;
  workspaceRoot: string;
  packageDir: string;
  packagePath: string;
  outputDir?: string;
  
  // NEW: Method helpers
  methods: {
    // All collected methods (after pipeline)
    all: RawMethod[];
    
    // Grouping helpers
    byManagement(): Map<string, RawMethod[]>;
    byCrud(): Map<CrudOperation, RawMethod[]>;
    byTag(tag: string): RawMethod[];
    
    // Filtering helpers
    withTag(tag: string): RawMethod[];
    withCrud(op: CrudOperation): RawMethod[];
    
    // Iterator helpers (for templates)
    forEach(cb: (method: RawMethod) => void): void;
    filteredForEach(
      filter: (method: RawMethod) => boolean,
      cb: (method: RawMethod) => void
    ): void;
    
    // Convenience accessors
    creates: RawMethod[];
    reads: RawMethod[];
    updates: RawMethod[];
    deletes: RawMethod[];
    lists: RawMethod[];
  };
}
```

### 2. Enhanced Function Forms

**Current:** Functions receive only `context`
**New:** Functions receive `context` with populated `methods`

```typescript
// Outputs as function - receives methods via context
defineTreadle({
  outputs: [
    (context) => {
      // context.methods is populated!
      const createMethods = context.methods.withCrud('create');
      
      // Can return single spec or array
      if (createMethods.length > 0) {
        return [
          { template: 'commands.rs.ejs', path: 'src/commands.rs', language: 'rust' },
          { template: 'handlers.rs.ejs', path: 'src/handlers.rs', language: 'rust' }
        ];
      }
      return []; // Return empty array to skip
    }
  ]
})

// Patches as function - same pattern
patches: [
  (context) => {
    const bookmarkMethods = context.methods.byManagement().get('BookmarkMgmt');
    if (!bookmarkMethods?.length) return [];
    
    return bookmarkMethods.map(method => ({
      type: 'ensureBlock' as const,
      targetFile: 'src/lib.rs',
      marker: `command-${method.name}`,
      template: 'command-block.rs.ejs',
      language: 'rust'
    }));
  }
]
```

### 3. Handler for Array Returns

Update `declarative.ts` to handle both single items and arrays:

```typescript
// In generateFromTreadle:

// Resolve output specs (handle functions returning single OR array)
const resolvedOutputs: OutputSpec[] = [];
for (const outputOrFn of definition.outputs) {
  const resolved = typeof outputOrFn === 'function' 
    ? outputOrFn(context)  // context has methods
    : outputOrFn;
  
  if (resolved) {
    if (Array.isArray(resolved)) {
      resolvedOutputs.push(...resolved);
    } else {
      resolvedOutputs.push(resolved);
    }
  }
}

// Same pattern for patches
const resolvedPatches: PatchSpec[] = [];
for (const patchOrFn of definition.patches ?? []) {
  const resolved = typeof patchOrFn === 'function'
    ? patchOrFn(context)  // context has methods
    : patchOrFn;
    
  if (resolved) {
    if (Array.isArray(resolved)) {
      resolvedPatches.push(...resolved);
    } else {
      resolvedPatches.push(resolved);
    }
  }
}
```

### 4. Implementation in Core

Modify `createTreadleKit` to build method helpers:

```typescript
// In core.ts createTreadleKit:

// After collecting methods
const rawMethods = /* ... collect and transform ... */;

// Build helpers
const methodHelpers = {
  all: rawMethods,
  
  byManagement() {
    const map = new Map<string, RawMethod[]>();
    for (const method of rawMethods) {
      const mgmt = method.managementName || 'default';
      const list = map.get(mgmt) || [];
      list.push(method);
      map.set(mgmt, list);
    }
    return map;
  },
  
  byCrud() {
    const map = new Map<CrudOperation, RawMethod[]>();
    for (const method of rawMethods) {
      const op = method.crudOperation;
      if (op) {
        const list = map.get(op) || [];
        list.push(method);
        map.set(op, list);
      }
    }
    return map;
  },
  
  withTag(tag: string) {
    return rawMethods.filter(m => m.tags?.includes(tag));
  },
  
  withCrud(op: CrudOperation) {
    return rawMethods.filter(m => m.crudOperation === op);
  },
  
  forEach(cb: (m: RawMethod) => void) {
    rawMethods.forEach(cb);
  },
  
  filteredForEach(filter: (m: RawMethod) => boolean, cb: (m: RawMethod) => void) {
    rawMethods.filter(filter).forEach(cb);
  },
  
  // Convenience getters
  get creates() { return this.withCrud('create'); },
  get reads() { return this.withCrud('read'); },
  get updates() { return this.withCrud('update'); },
  get deletes() { return this.withCrud('delete'); },
  get lists() { return this.withCrud('list'); }
};

// Attach to context
context.methods = methodHelpers;
```

---

## Usage Examples

### Example 1: Dynamic Outputs by CRUD

```typescript
defineTreadle({
  matches: [...],
  methods: { filter: 'platform', pipeline: [] },
  
  outputs: [
    // Always generate commands file
    { template: 'commands.rs.ejs', path: 'src/commands.rs', language: 'rust' },
    
    // Conditionally generate query file if read methods exist
    (ctx) => {
      if (ctx.methods.reads.length > 0) {
        return {
          template: 'queries.rs.ejs',
          path: 'src/queries.rs',
          language: 'rust'
        };
      }
    }
  ]
})
```

### Example 2: Multiple Files per Management

```typescript
outputs: [
  (ctx) => {
    // Generate one file per management
    const outputs: OutputSpec[] = [];
    
    ctx.methods.byManagement().forEach((methods, mgmtName) => {
      outputs.push({
        template: 'management.rs.ejs',
        path: `src/${snakeCase(mgmtName)}.rs`,
        language: 'rust'
      });
    });
    
    return outputs;
  }
]
```

### Example 3: Dynamic Patches per Method

```typescript
patches: [
  (ctx) => {
    // Add a patch block for each create method
    return ctx.methods.creates.map(method => ({
      type: 'ensureBlock' as const,
      targetFile: 'src/lib.rs',
      marker: `init-${method.name}`,
      template: 'init-block.rs.ejs',
      language: 'rust',
      position: { after: 'pub mod prelude;' }
    }));
  }
]
```

### Example 4: Template Usage

```typescript
// In data function
data: (context, current, previous) => {
  return {
    // Use helpers to prepare template data
    commands: context.methods.creates.map(m => ({
      name: m.name,
      snakeName: m.snakeName,
      params: m.params
    })),
    
    // Group by management for organized output
    byManagement: Object.fromEntries(context.methods.byManagement())
  };
}
```

---

## Files to Modify

1. **`machinery/heddles/index.ts`** - Add `methods` to GeneratorContext type
2. **`machinery/treadle-kit/core.ts`** - Build and attach methodHelpers in createTreadleKit
3. **`machinery/treadle-kit/declarative.ts`** - 
   - Update to populate context.methods before calling output/patch functions
   - Handle array returns from functions
4. **`machinery/treadles/*.ts`** - Update existing treadles to use new helpers (optional migration)

---

## Backward Compatibility

**Fully backward compatible:**
- `context.methods` is additive
- Existing function forms still work (receive context)
- Array return handling is additive (previously would error or ignore)

---

## Success Criteria

- [ ] `context.methods.all` available in all treadle functions
- [ ] `outputs: [(ctx) => [...array...]]` works
- [ ] `patches: [(ctx) => [...array...]]` works
- [ ] No new config options needed (use helpers instead)
- [ ] Existing treadles continue to work unchanged

---

> *"Give the weaver the shuttle pre-threaded, not the raw wool."*
