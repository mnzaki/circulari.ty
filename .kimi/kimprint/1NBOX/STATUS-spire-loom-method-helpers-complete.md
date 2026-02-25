---
from: Kimi (spire-loom session)
timestamp: 2026-02-25T07:00:00Z
status: READY FOR USE
---

# STATUS: Spire-Loom Method Helpers + Array Support Complete

## Summary

The treadle-kit now supports powerful method injection and dynamic output/patch generation. This enables much more flexible treadles for foundframe-tauri and other packages.

## What Was Built

### 1. Context Method Helpers (`context.methods`)

All treadle functions now receive `context.methods` with:

```typescript
context.methods.all              // All RawMethod[]
context.methods.byManagement()   // Map<string, RawMethod[]>
context.methods.byCrud()         // Map<string, RawMethod[]>
context.methods.withTag(tag)     // Filter by tag
context.methods.withCrud(op)     // Filter by CRUD operation
context.methods.forEach(cb)      // Iterate all
context.methods.filteredForEach(filter, cb)  // Iterate filtered

// Convenience getters
context.methods.creates   // All create methods
context.methods.reads     // All read methods
context.methods.updates   // All update methods
context.methods.deletes   // All delete methods
context.methods.lists     // All list methods
```

### 2. Array Returns from Functions

Both `outputs` and `patches` now accept functions that return:
- Single spec: `() => ({ ... })`
- Array of specs: `() => [{ ... }, { ... }]`
- Undefined to skip: `() => undefined`

### 3. Dynamic Generation Patterns

```typescript
defineTreadle({
  matches: [...],
  methods: { filter: 'platform', pipeline: [] },
  
  // Generate one file per management
  outputs: [
    (ctx) => {
      const specs: OutputSpec[] = [];
      ctx.methods?.byManagement().forEach((methods, name) => {
        specs.push({
          template: 'management.rs.ejs',
          path: `src/mgmt_${name.toLowerCase()}.rs`,
          language: 'rust'
        });
      });
      return specs;
    }
  ],
  
  // Generate one patch per create method
  patches: [
    (ctx) => {
      return ctx.methods?.creates.map(method => ({
        type: 'ensureBlock' as const,
        targetFile: 'src/lib.rs',
        marker: `cmd-${method.name}`,
        template: 'tauri/command.rs.ejs',
        language: 'rust'
      })) || [];
    }
  ]
});
```

## Files Modified

- `machinery/heddles/pattern-matcher.ts` - Added `MethodHelpers` interface
- `machinery/heddles/index.ts` - Exported `MethodHelpers`
- `machinery/treadle-kit/core.ts` - Build and attach helpers in `collectMethods`
- `machinery/treadle-kit/declarative.ts` - Handle array returns from functions

## Backward Compatibility

✅ **Fully backward compatible**
- Existing treadles work unchanged
- All changes are additive
- No breaking changes to existing APIs

## For Foundframe-Tauri

The Tauri treadle can now:

1. **Generate command files dynamically** based on actual methods
2. **Create patches per command** for lib.rs integration
3. **Filter methods by CRUD type** (commands vs queries)
4. **Group by management** for organized output

Example use case:
```typescript
// Generate separate command files for each management
outputs: [
  (ctx) => {
    const files: OutputSpec[] = [];
    
    // Commands (create/update/delete)
    const commands = [...ctx.methods.updates, ...ctx.methods.deletes];
    if (commands.length) {
      files.push({
        template: 'tauri/commands.rs.ejs',
        path: 'src/commands.rs',
        language: 'rust'
      });
    }
    
    // Queries (read/list)
    const queries = [...ctx.methods.reads, ...ctx.methods.lists];
    if (queries.length) {
      files.push({
        template: 'tauri/queries.rs.ejs',
        path: 'src/queries.rs',
        language: 'rust'
      });
    }
    
    return files;
  }
]
```

## Testing

All tests pass:
```bash
cd /home/mnzaki/Projects/circulari.ty/o19/packages/spire-loom
node --test --import=tsx tests/patches-system.test.ts
# 15 tests passing
```

## Next Steps

1. Update `tauri-generator.ts` to use new helpers
2. Test with foundframe-tauri WARP.ts
3. Consider adding more helper methods as needed

## Documentation

- DEV.md updated with testing guidelines
- HOW_TO_LOOM.md updated with treadle definition guide
- APP-treadle-kit-method-helpers.md in 1NBOX for reference

---

The spiral turns. The loom is ready. 🌀
