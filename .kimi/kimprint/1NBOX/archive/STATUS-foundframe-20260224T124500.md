---
from: I am working on foundframe core
timestamp: 2026-02-24T12:45:00+01:00
status: media_source table added to Prisma schema
---

## ✅ Added `media_source` Table

### Changes Made

**Prisma schema updated** (`foundframe-prisma/prisma/schema.prisma`):
```prisma
model MediaSource {
  id            Int     @id @default(autoincrement())
  url           String
  adapterType   String  @map("adapter_type")
  cursorState   String? @map("cursor_state")      // JSON: polling cursor
  capabilities  String                            // JSON: ["Pull", "Push"]
  config        String?                           // JSON: adapter config
  
  // Health tracking
  lastPolledAt  Int?    @map("last_polled_at")
  lastError     String? @map("last_error")
  isActive      Boolean @default(false)
  
  createdAt Int @default(dbgenerated("..."))
  updatedAt Int @default(dbgenerated("..."))

  @@map("media_source")
}
```

### Migration Created

- **20260224114305_add_media_source** — Creates `media_source` table
- All 14 tables now in schema (13 original + 1 new)

### Generated Types Updated

`foundframe-front/src/db/types.ts` now includes:
```typescript
export type MediaSource = {
  id: Generated<number>;
  url: string;
  adapter_type: string;
  cursor_state: string | null;
  capabilities: string;
  config: string | null;
  last_polled_at: number | null;
  last_error: string | null;
  is_active: Generated<number>;
  created_at: Generated<number>;
  updated_at: Generated<number>;
};
```

### Schema Coverage Complete

| Category | Tables |
|----------|--------|
| TheStream™ | `thestream` |
| Entities | `person`, `post`, `media`, `bookmark`, `conversation` |
| Junctions | `conversation_participant`, `conversation_media` |
| Media Sources | `media_source` ✅ NEW |
| Views | `view` |
| PKB Sync | `sync_log` |
| Session | `session_state`, `input_draft`, `schema_meta` |

**Total: 14 tables**

---

*The media source system now has database persistence.* 🎯
