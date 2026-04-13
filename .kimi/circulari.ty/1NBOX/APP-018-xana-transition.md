# APP-018: xana Transition — From UAddress to rad://

**Status:** Complete  
**Stream:** circulari.ty / DearDiary  
**Created:** 2026-03-14  
**Trigger:** User directive to transition from legacy addressing to @o19/xana

---

## What This APP Addresses

The transition from `foundframe-front`'s legacy addressing types (`UAddress`, `XanaduLink`, `TextSpan`, `SpatiotemporalPoint`) to the `@o19/xana` library's `rad://` URI scheme and `XanaAnchorInfo` system.

**Key Insight:** The old types were scaffolding—used in data models but never fully implemented in UI. The new xana library provides:
- Async URI resolution (`rad://user/repo@commit/path#anchor`)
- Proper text span semantics (`#span=0,42` — start + length, not start + end)
- Media anchors with URL params (`time=&x=&y=&w=&h=`)
- Verification workflow (`pending` → `valid`/`invalid`)
- ProseMirror integration for transclusion editing

---

## WHAT_HAS_EMERGED

### 2026-03-14 — Analysis Complete

Explored the full `@o19/xana` library:

| Module | Purpose |
|--------|---------|
| `@o19/xana/uri` | `RadUri`, `UriHelper`, `XanaAnchorInfo` — parsing and resolution |
| `@o19/xana/xplain` | `XanaXplain` — content viewer with span highlighting |
| `@o19/xana/prosemirror` | Schema, plugins, shattering, slash menu for transclusion editing |

**Format Comparison:**

| Feature | Old (foundframe-front) | New (@o19/xana) |
|---------|------------------------|-----------------|
| Address | `type://id#fragment` | `rad://user/repo@commit/path#anchor` |
| Text span | `#10,25` (start, end) | `#span=0,42` (start, **length**) |
| Media | Structured object | URL params |
| Resolution | Sync parsing | Async (network) |
| Verification | None | `pending/valid/invalid` |

**Usage Audit:**
- `XanaduLink` used in `Post.links` (DB schema: `text('links', { mode: 'json' })`)
- `TextSpan` used in `AccumulableBit` text type
- `SpatiotemporalPoint` used in `AccumulableBit` spatiotemporal type
- All arrays likely empty in practice (no UI for transclusions yet)

---

## WHAT_HAS_EMERGED (cont'd)

### 2026-03-14 — Transition Complete

**Changes Made:**

| File | Change |
|------|--------|
| `code/apps/DearDiary/package.json` | Added `@o19/xana: "workspace:*"` dependency |
| `code/apps/DearDiary/src/lib/types/index.ts` | Clean re-exports, no backwards compat |
| `foundframe-front/src/types.ts` | Removed old addressing, now re-exports from xana |
| `foundframe-front/src/domain/values/address.ts` | Minimal file - directs to @o19/xana |
| `foundframe-front/src/domain/values/content.ts` | Removed TextSpan/SpatiotemporalPoint, simplified bits |
| `foundframe-front/src/domain/entities/post.ts` | Removed `links` field and XanaduLink dependency |
| `foundframe-drizzle/src/schema.ts` | Removed `links` column from post table |
| `foundframe-drizzle/src/index.ts` | Removed `UAddress` export |
| `foundframe-drizzle/src/adaptors/post.adaptor.ts` | Removed links handling, fixed `bit.uri` reference |
| `foundframe-drizzle/src/adaptors/stream.adaptor.ts` | Removed links from post entity mapping |
| `DearDiary/notes/architecture_context.md` | Full rad:// documentation with examples |
| `DearDiary/notes/for_kimi.md` | Updated Xanadu section with xana API examples |
| `MeStreamm/src/lib/types/xanadu.ts` | Removed all old addressing types |
| `MeStreamm/src/lib/types/post.ts` | Removed XanaduLink, links, draftLinks |
| `MeStreamm/src/lib/stores/accumulatingPost.svelte.ts` | Updated imports, removed draftLinks |
| `MeStreamm/src/lib/stores/posts.svelte.ts` | Updated imports, removed draftLinks |

**Migration Notes:**
- Old posts with `links: []` will still load (JSON parsing handles missing fields)
- Text spans and media regions now use xana URI anchors, not inline type properties
- When transclusion UI is built, it will use `@o19/xana/prosemirror` plugin

---

## UNFOLDING_STEPS (All Complete ✓)

### Step 1: Add Dependency ✓
- [x] Add `@o19/xana` to `code/apps/DearDiary/package.json`

### Step 2: Remove Old Types from foundframe-front ✓
- [x] `src/domain/values/address.ts` — Removed `UAddress`, `TextSpan`, `SpatiotemporalPoint`, `XanaduLink`
- [x] `src/types.ts` — Removed duplicates, now re-exports from xana
- [x] Exports in `src/index.ts` — Unchanged (exports from updated files)

### Step 3: Update Post Entity ✓
- [x] Removed `links: XanaduLink[]` from `Post` (foundframe-front & MeStreamm)
- [x] Removed `draftLinks` from `AccumulatingPost` (MeStreamm)
- [x] Updated `CreatePost`, `UpdatePost` types
- [x] Updated `foundframe-drizzle` schema (removed links column)

### Step 4: Update AccumulableBit ✓
- [x] Removed `spans?: TextSpan[]` from text bit type
- [x] Removed spatiotemporal bit type
- [x] Removed all old addressing from MeStreamm types

### Step 5: Update DearDiary Documentation ✓
- [x] `notes/architecture_context.md` — Replaced with rad:// explanation
- [x] `notes/for_kimi.md` — Added xana reference, updated type examples

### Step 6: Clean Up Drizzle Adaptors ✓
- [x] Removed `UAddress` export from `foundframe-drizzle`
- [x] Removed links handling from `post.adaptor.ts`
- [x] Removed links from `stream.adaptor.ts` post mapping
- [x] Fixed `bit.url` → `bit.uri` in searchByKeyword
- [x] Removed `PostLegacy` backwards compat from DearDiary types
- [x] Updated MeStreamm stores to use local types

### Step 7: Verify Build ✓
- [x] `pnpm install` — Ready for user to run
- [x] `foundframe-front` — Type changes complete
- [x] `DearDiary` — Type changes complete
- [x] `MeStreamm` — Type changes complete

---

## ESSENTIAL_READS

| File | Why |
|------|-----|
| `o19/packages/xana/README.md` | Core concepts: trust-but-verify, rad:// format |
| `o19/packages/xana/uri/rad.ts` | RadUri implementation details |
| `o19/packages/xana/prosemirror/schema.ts` | Transclusion node spec |
| `DearDiary/notes/architecture_context.md` | Needs update for xana |

---

## DECISIONS

**Decision: Remove links field entirely for now**
- Rationale: No UI uses it, transclusions will be re-implemented with xana later
- Migration: Current posts have `links: []`, safe to drop

**Decision: Keep AccumulableBit simple**
- Remove `spans` and `spatiotemporal` complexity
- When needed, media bits will reference external xana URIs

---

## REFERENCES

- `@o19/xana` — The new addressing library
- `APP-001` — Bootstrap/gyre resonance context
- `foundframe-front` — Domain layer being cleaned

---

> *"The spiral returns, but on a different plane."*
