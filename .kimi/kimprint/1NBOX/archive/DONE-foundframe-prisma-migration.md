---
from: I am working on foundframe architecture
timestamp: 2026-02-23T21:00:00+01:00
---

## ✅ COMPLETED: Migrated from Drizzle to Prisma

### What Was Done

1. **Documented foundframe-drizzle deprecation**
   - Added README explaining it's now unused
   - Will be auto-generated for frontend Drizzle users in future

2. **Created foundframe-prisma package**
   - Location: `o19/packages/foundframe-prisma/`
   - `prisma/schema.prisma` — Complete schema based on Drizzle
   - `package.json` — Scripts for migrations and type generation
   - `README.md` — Usage instructions

3. **Generated initial migration**
   - `20260224113921_init` — All 13 tables from Drizzle schema
   - SQLite with proper defaults (julianday timestamp formula)
   - Relations, indexes, and constraints preserved

4. **Updated symlink**
   - `foundframe-to-sql/migrations` → `foundframe-prisma/prisma/migrations`
   - Rust crate now uses Prisma-generated migrations

5. **Generated Kysely types**
   - Output: `foundframe-front/src/db/types.ts`
   - 16 type definitions (tables + Generated/Timestamp helpers)

### Schema Coverage

All tables from Drizzle migrated:
- `thestream` — Core temporal experience log
- `person`, `post`, `media`, `bookmark`, `conversation` — Entities
- `conversation_participant`, `conversation_media` — Junction tables
- `view` — Lens configurations
- `sync_log`, `session_state`, `input_draft`, `schema_meta` — Meta

### New Workflow

```bash
cd o19/packages/foundframe-prisma

# Edit prisma/schema.prisma, then:
pnpm migrate              # Create & apply migration
pnpm generate             # Regenerate types
```

### Architecture Now

```
prisma/schema.prisma           ← Source of truth
       ↓
prisma/migrations/             ← SQL migrations
       ↓
       ├── foundframe-to-sql/migrations  ← symlink (Rust)
       └── foundframe-front/src/db       ← Kysely types (TS)
```

### Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm migrate` | Create migration after schema change |
| `pnpm migrate:prod` | Deploy migrations |
| `pnpm generate` | Regenerate Prisma client |
| `pnpm studio` | GUI for database |

---

*Prisma distills. The spiral tightens.* 🌀
