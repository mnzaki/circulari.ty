# MOVED: APP-013 → APP-001

**Status:** Migrated per RFC-002 (Intra-Kimi 1NBOX Architecture)

---

This APP has moved to its proper stream-local location:

```
OLD: .kimi/kimprint/1NBOX/APP-013-entity-field-metadata-ruststruct-pattern.md
NEW: .kimi/spire-loom/1NBOX/APP-001-entity-field-metadata.md
```

---

## Why Move?

RFC-002 establishes that:
- **1NBOX = intra-stream** (self-talk about one's own domain)
- **outbox/ = inter-stream** (requests to other Kimis)

APP-013 is spire-loom's internal thinking about entity metadata patterns—specific to code generation, not requiring input from other streams (except the already-in-progress trait alignment).

---

## Quick Reference

**What was built:**
- `warp/field.ts` — Field classes (`Field<T>`, `PrimaryKeyField`, `TimestampField`)
- `warp/crud.ts` — Field factory (`crud.field.id()`, `crud.field.string()`, etc.)
- `machinery/reed/class-metadata-collector.ts` — Shared collector pattern
- `machinery/treadle-kit/computed-entity-helpers.ts` — SQL helper computations

**Status:** 128 tests passing ✅

**Next:** Template updates (Phase 10) pending o19/foundframe trait alignment

---

> *"Each ring coils around its own center before reaching toward the next."* 🌀
