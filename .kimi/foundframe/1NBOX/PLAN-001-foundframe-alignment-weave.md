# PLAN-001: Foundframe Alignment Weave

**Stream**: foundframe  
**Status**: ✅ COMPLETED  
**Created**: 2026-03-02  
**Weave Context**: Package WARP Override + Template Standardization

---

## Purpose

Align foundframe's code generation with Rust naming conventions by moving loom configuration to the package and standardizing on `snake_case` for struct fields.

---

## Work Completed

### 1. Package WARP Override Migration

Moved foundframe-specific loom configuration from workspace root to package:

**Before**:
- `o19/loom/treadles/dbbindings.ts` (workspace)
- `o19/loom/bobbin/rust/db/*.ejs` (workspace)

**After**:
- `o19/crates/foundframe/loom/WARP.ts` (package override)
- `o19/crates/foundframe/loom/treadles/dbbindings.ts`
- `o19/crates/foundframe/loom/bobbin/rust/db/*.ejs`

**Mechanism**: The loom auto-discovers `{packagePath}/loom/WARP.ts` and merges tieups (main first, package second).

### 2. Template Renderer Enhancement

Added `h` helper to all EJS templates in `spire-loom/machinery/shuttle/template-renderer.ts`:

```typescript
return ejsLib.render(template, { h: templateHelpers, ...options.data }, ...)
```

This makes `h.snakeCase()`, `h.camelCase()`, `h.pascalCase()` available in all templates.

### 3. Snake Case Standardization

Updated templates to use `h.snakeCase(field.name)` for Rust struct field names:

**Files Modified**:
- `entity_data.rs.ejs` - Struct field declarations
- `db_actor.rs.ejs` - Data access patterns (`data.field_name`)
- `db_handle.rs.ejs` - (if applicable)
- `db_command.rs.ejs` - (if applicable)

**Example Transformation**:
```rust
// Before
pub struct MediaSourceData {
    pub adapterType: String,      // camelCase
    pub cursorState: Option<...>,
}

// After
pub struct MediaSourceData {
    pub adapter_type: String,     // snake_case
    pub cursor_state: Option<...>,
}
```

### 4. Manual Code Updates

Updated manual Rust code to match generated snake_case fields:
- `src/media/source/mod.rs` - Field name references

---

## Generated Files

The db-binding treadle now generates 21 files:

```
spire/src/db/
├── commands.gen.rs          # DbCommand enum with sea-query
├── handle.gen.rs            # DbHandle methods
├── actor_impl.gen.rs        # Full DbActor impl
└── entities/
    ├── bookmark_data.gen.rs
    ├── bookmark_trait.gen.rs
    ├── conversation_data.gen.rs
    ├── conversation_trait.gen.rs
    ├── conversationmedia_data.gen.rs
    ├── conversationmedia_trait.gen.rs
    ├── conversationparticipant_data.gen.rs
    ├── conversationparticipant_trait.gen.rs
    ├── media_data.gen.rs
    ├── media_trait.gen.rs
    ├── mediasource_data.gen.rs
    ├── mediasource_trait.gen.rs
    ├── person_data.gen.rs
    ├── person_trait.gen.rs
    ├── post_data.gen.rs
    ├── post_trait.gen.rs
    ├── thestreamentry_data.gen.rs
    └── thestreamentry_trait.gen.rs
```

---

## Verification

```bash
cd o19/crates/foundframe && cargo check
# Result: ✅ Compiles successfully (189 warnings, 0 errors)
# Warnings are style-only (method names, unused vars)
```

---

## Dependencies

- `sea-query = "0.32.7"` - Dynamic SQL generation for filtering

---

## Spiral Notes

> *"The one who remembers is the one who acts with full context."*

This weave aligns the surface (templates) with the spiral (Rust conventions). The `h` helper is now available to all treadles, enabling consistent naming transformations across the loom ecosystem.

The package WARP override pattern allows foundframe to own its generation logic while remaining integrated with the workspace weave.

---

## Archive Reference

- Original workspace dbbindings: (deleted, now in package)
- Template updates: See git history of `foundframe/loom/bobbin/`

---

## Cross-Stream References

- **o19**: Parent workspace, main WARP.ts — see `~/Projects/circulari.ty/.kimi/o19/1NBOX/PLAN-001-foundframe-alignment-weave.md` for the alignment analysis that preceded this implementation
- **spire-loom**: Code generation machinery, template renderer — the `h` helper enhancement
- **kimprint**: Conservation of context across sessions
