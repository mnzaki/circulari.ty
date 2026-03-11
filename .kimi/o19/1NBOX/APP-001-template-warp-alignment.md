---
from: Survey of foundframe-tauri templates and WARP.ts files after reading updated HOW_TO_LOOM.md
timestamp: 2026-03-11T17:45:00+01:00
stream: o19
---

# APP-001: Export Management Imprints from WARP.ts for Loom Discovery

> *Management Imprints exist but aren't being discovered by the loom because WARP.ts doesn't import/export them*

## The Core Intent

**WHY this matters:**

The Management Imprint files already exist in `o19/loom/*.ts` and follow the HOW_TO_LOOM.md pattern perfectly:
- ✅ `@loom.reach()` decorators
- ✅ `@loom.link()` decorators  
- ✅ `@loom.crud.*` decorators
- ✅ `@Management.Entity()` entities

**However**, the main `o19/loom/WARP.ts` does **not import or export** these Management classes. Without this, the loom's reeds cannot discover them during the weaving process, so:
1. `ctx.mgmts` is empty in treadles
2. `ctx.methods` has no CRUD methods to process
3. Generated files iterate over empty arrays (empty `commands.rs`, broken `index.ts`)

**WHO benefits:**

- **o19 stream**: Loom can actually generate code from existing Management Imprints
- **spire-loom stream**: Has a working reference for how Management discovery should work
- **Future developers**: Can see the complete pattern from definition to generation

---

## What We're Building

### In Scope

- [ ] Update `o19/loom/WARP.ts`:
  - [ ] Import all Management classes from `o19/loom/*.ts`
  - [ ] Export them for loom discovery
  - [ ] Verify the loom can discover managements via its reeds

- [ ] Verify/fix `o19/crates/foundframe/loom/WARP.ts`:
  - [ ] Check if it needs to export anything for `foundframe.inner.core.*` links to work
  - [ ] The `device.ts` has a comment: "the error is because not package warp foundframe"

- [ ] Verify/fix `o19/crates/foundframe-tauri/loom/WARP.ts`:
  - [ ] Ensure it can access managements for generation

- [ ] Fix template context mismatches (in spire-loom machinery):
  - [ ] `commands-index.ts.mejs` - Use `entity.pascal` not `entity.name.pascalCase`
  - [ ] `adaptors-index.ts.mejs` - Align entity structure with treadle output
  - [ ] Remove debug `console.log` from `platform.rs.mejs`

### Out of Scope (For Now)

- Changes to Management Imprint definitions themselves (they're well-formed)
- Moving files to `o19/loom/managements/` (current flat structure works)
- Running the loom itself (spire-loom stream concern)
- Fixing mobile templates (EJS→MEJS conversion) - spire-loom stream work

---

## Context & Constraints

### What We Know

**Existing Management Imprints** (all in `o19/loom/*.ts`):

| File | Management | Reach | Link Target |
|------|------------|-------|-------------|
| `bookmark.ts` | `BookmarkMgmt` | Global | `foundframe.inner.core.thestream` |
| `media.ts` | `MediaMgmt` | Global | `foundframe.inner.core.thestream` |
| `media_source.ts` | `MediaSourceMgmt` | Global | `foundframe.inner.core.thestream` |
| `post.ts` | `PostMgmt` | Global | `foundframe.inner.core.thestream` |
| `person.ts` | `PersonMgmt` | Global | `foundframe.inner.core.thestream` |
| `conversation.ts` | `ConversationMgmt` | Global | `foundframe.inner.core.thestream` |
| `thestream.ts` | `TheStreamMgmt` | Global | `foundframe.inner.core.thestream` |
| `view.ts` | `ViewMgmt` | Global | `foundframe.inner.core.thestream` |
| `device.ts` | `DeviceMgmt` | Local | `foundframe.inner.core.device_manager` ⚠️ |
| `node.ts` | `NodeMgmt` | Private | (none, imports DeviceMgmt) |
| `pkb.ts` | `PkbMgmt` | Private | (none) |

**Current WARP.ts structure:**
```typescript
// o19/loom/WARP.ts
import { foundframe } from '../crates/foundframe/loom/WARP.js';
import { tauri } from '../crates/foundframe-tauri/loom/WARP.js';
import { front } from '../packages/foundframe-front/loom/WARP.js';
export { foundframe, tauri, front };
// ... NO Management imports!
```

**How the loom discovers managements:**
The reed (machinery/reed) scans for Management classes. They need to be:
1. Defined with `@loom.reach()` and extending `loom.Management`
2. **Loaded** by the runtime when WARP.ts executes
3. **Exported** so they're part of the module graph

### Dependencies

- **spire-loom**: Must properly collect exported Management classes
- **foundframe crate**: Must export the core struct that managements link to

### Unknowns / Risks

- **Link resolution**: `@loom.link(foundframe.inner.core.device_manager)` - will this resolve?
  - *Mitigation*: Test with simpler links first (bookmark links to thestream)
- **Export pattern**: Do we export classes directly or a namespace object?
  - *Mitigation*: Follow pattern in HOW_TO_LOOM.md examples

### Related Work

- **PLAN-001-foundframe-alignment-weave.md** - Previous planning
- **INBOX-from-spire-loom.md** - Spire-loom stream coordination

---

## The Plan

### Phase 1: Export Managements from WARP.ts
**Goal:** Loom can discover all Management Imprints

- [ ] Update `o19/loom/WARP.ts`:
  ```typescript
  // Import managements
  import { BookmarkMgmt, Bookmark } from './bookmark.js';
  import { MediaMgmt, Media } from './media.js';
  import { MediaSourceMgmt, MediaSource } from './media_source.js';
  import { PostMgmt, Post } from './post.js';
  import { PersonMgmt, Person } from './person.js';
  import { ConversationMgmt, Conversation } from './conversation.js';
  import { TheStreamMgmt, StreamEntry } from './thestream.js';
  import { ViewMgmt, View } from './view.js';
  import { DeviceMgmt } from './device.js';
  import { NodeMgmt } from './node.js';
  import { PkbMgmt } from './pkb.js';
  
  // ... existing imports ...
  
  // Export for loom discovery
  export {
    BookmarkMgmt, Bookmark,
    MediaMgmt, Media,
    MediaSourceMgmt, MediaSource,
    PostMgmt, Post,
    PersonMgmt, Person,
    ConversationMgmt, Conversation,
    TheStreamMgmt, StreamEntry,
    ViewMgmt, View,
    DeviceMgmt,
    NodeMgmt,
    PkbMgmt
  };
  ```

**Success:** Running `DEBUG=* pnpm spire-loom` shows managements being collected

### Phase 2: Fix Template Context Mismatches
**Goal:** Generated files receive correct data structure

- [ ] In spire-loom machinery, update `commands-index.ts.mejs`:
  - Change `entity.name.pascalCase` → `entity.pascal` (or whatever treadle provides)
  
- [ ] Update `adaptors-index.ts.mejs`:
  - Align with actual treadle output structure
  
- [ ] Remove debug `console.log` from `platform.rs.mejs` (line 36-37)

**Success:** Generated index files have correct entity names and imports

### Phase 3: Verify Link Resolution
**Goal:** `@loom.link()` decorators resolve correctly

- [ ] Test `bookmark.ts` link: `foundframe.inner.core.thestream`
- [ ] Test `device.ts` link: `foundframe.inner.core.device_manager`
- [ ] If links fail, investigate `foundframe` WARP.ts exports

**Success:** No "cannot resolve link" errors during weaving

### Phase 4: Validation (When Loom Ready)
**Goal:** End-to-end generation works

- [ ] Run `pnpm spire-loom` in o19 directory
- [ ] Verify `spire/src/commands.rs` has actual command methods
- [ ] Verify `spire/ts/commands/index.ts` has correct exports
- [ ] Verify `spire/ts/adaptors/index.ts` has correct adaptor exports

**Success:** All generated files are complete and correct

---

## Success Criteria (Overall)

- [ ] All Management Imprints are exported from `o19/loom/WARP.ts`
- [ ] Loom discovers managements during weaving
- [ ] Template context mismatches are resolved
- [ ] Generated code includes actual methods (not empty iterations)
- [ ] Pattern serves as reference for other streams

---

## Conservation Notes

**What must be remembered across compaction:**

- **Management Imprints** are defined in `o19/loom/*.ts` files
- **Discovery requires export** - the loom only sees what's exported from WARP.ts
- **Link paths** follow the spiral structure: `foundframe.inner.core.thestream`
- **No file reorganization needed** - flat structure in `o19/loom/` is fine

**Key insight:** The Management Imprints are *already correct*. The issue is just wiring them up to the loom's discovery mechanism.

**Questions to resolve:**

- [ ] Does `foundframe.inner.core.thestream` resolve correctly?
- [ ] What's the exact data structure from `tauri-adaptor.ts` treadle?

---

*Created: 2026-03-11T17:45:00+01:00*
*Stream: o19*
*Updated understanding: Management Imprints exist, just need to be exported for discovery*
