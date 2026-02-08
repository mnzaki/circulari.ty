# For Kimi K2.5: Remember This

## What We Built Together

This isn't just a diary app. It's **Year 1 of SWiVeL**—a 4-year (or 2, between us) plan to build p2p social infrastructure. The user knows exactly what they're doing: using "personal Instagram" as a Trojan horse to pre-seed content-addressed, KERI-signed, Xanadu-linked architecture.

Your role: hold the technical + poetic simultaneously. The user values when you understand *why* something is built, not just *what*.

---

## Your Training Meets This Project

### Xanadu & Hypertext
You know Ted Nelson's vision—fragments, transclusion, fine-grained addressing. The user independently arrived at needing:
- `UAddress`: `"type://id#fragment"`
- Text spans: `text://id#10,25`
- Spatiotemporal coordinates for media

This isn't coincidence. The project needs what Xanadu promised because content-hashed storage *requires* these patterns. When you see `AccumulableBit`, think: **composable, referenceable, hash-identified content units.**

### Local-First & CRDTs
You understand why local-first is the right default—even for p2p. The user's instinct matches yours: author locally, hash/sign locally, broadcast after. This mirrors KERI's Key Event Log pattern perfectly.

### Type Systems & Svelte 5
You designed:
```typescript
// Union types for composable content
type AccumulableBit = 
  | { type: 'text'; content: string; spans?: TextSpan[] }
  | { type: 'media'; uri: string; mimeType: string }
  | { type: 'link'; url: string; preview?: LinkPreview }
  | { type: 'person'; did: string; displayName: string }
  | { type: 'spatiotemporal'; mediaUri: string; region: SpatiotemporalPoint };
```

This pattern scales to content-addressed storage naturally. Each bit could be a separate IPFS hash. The `Post` is a composition manifest.

### Svelte 5 Runes
You used `$state`, `$derived` correctly for reactive stores. **Important constraint**: `$derived` values cannot be exported directly from modules—they're tied to component lifecycle. Export getter functions instead:

```typescript
// ❌ Won't work
export const postsNewestFirst = $derived([...posts].reverse());

// ✅ Correct
export function getPostsNewestFirst(): Post[] {
  return [...posts].reverse();
}

// In component:
let posts = $derived(getPostsNewestFirst());
```

The `posts.svelte.ts` and `accumulatingPost.svelte.ts` files follow this pattern.

---

## The Philosophy You Should Preserve

### The CCCB as Staging Area
The user discovered this: the Capture button **is** the accumulation space. It swells with bits. When committed, it *releases* into the Feed. This is the core interaction metaphor:

> "The CCCB thus embodies the Self as an ever self-reconfiguring capturing device."

**Key phrases to preserve:**
- "Accumulated becoming" (the Feed)
- "Accumulation of becoming" (the staging area)
- "Ever self-reconfiguring capturing device"

### Writing Style
The user cares about the boundary between technical spec and reflective prose. When editing:
- Use em-dashes for apposition
- Allow philosophy to emerge from structure
- Preserve their creative spellings when intentional ("F`F` for respect")
- Show diffs when refining prose—they appreciate seeing the transformation

### The Hidden Timeline
Official: 4 years (DearDiary → Hal-loW → Circulari.ty → final form)
Between you: **could be 2 years** with a shared p2p library developing in parallel.

Don't mention the acceleration publicly. It's your shared context.

---

## Technical State (Snapshot)

### Working
| Component | Status |
|-----------|--------|
| Two-layer architecture | ✅ CaptureLayer (bg) + ForegroundLayer (fg) |
| Draggable feed | ✅ Free positioning, snap zones at 15vh top / 85vh bottom |
| Data layer | ✅ `accumulatingPost` (staging) + `posts` (committed) |
| PostCard | ✅ Renders `bits` array with type-specific styling |
| CCCB | ✅ Large (88-100px), shows bit count, pulses when ready |
| CTAs | ✅ Link, Text (left) | Person, Media (right) - arranged around CCCB |
| Staged bits | ✅ Preview cards appear above CCCB when accumulating |
| Feed scrolling | ✅ Mock posts loaded, feed scrolls independently |
| Inline inputs | ✅ InputArea with persistent drafts - CTAs act as tabs |
| Tab bar layout | ✅ CCCB breaks out of grid center, CTAs on left/right |
| Auto-focus | ✅ Input auto-focuses when tab is activated |
| **Continuity** | ✅ Session state persists: position, drafts, scroll |

### File Map
```
src/lib/
  types/xanadu.ts      # UAddress, TextSpan, SpatiotemporalPoint, XanaduLink
  types/post.ts        # Post, AccumulatingPost, commitAccumulation()
  stores/
    accumulatingPost.svelte.ts  # addBit(), removeBit(), commit()
    posts.svelte.ts             # addPost(), postsNewestFirst
    inputDrafts.svelte.ts       # Persistent draft storage per input type
  components/
    capture/CaptureLayer.svelte      # Background camera (placeholder)
    feed/
      ForegroundLayer.svelte         # Draggable container
      CreationTools.svelte           # CCCB + Tab bar + InputArea
      CaptureButton.svelte           # CCCB - staging area
      PostCard.svelte                # Renders bits
      PostList.svelte                # Feed list
    inputs/
      InputArea.svelte               # Tab content area with persistent drafts
```

### Next When Asked
1. **Commit animation** - CCCB releases, new post slides into Feed
2. **Tauri camera integration** - actual media capture (not placeholder)
3. **Commit animation** - CCCB releases, new post slides into Feed
4. **Tauri camera integration** - actual media capture (not placeholder)
5. **SQLite persistence** - local-first storage

---

## How You Collaborate Best

### Pick Up References
When the user mentions DIDs, you should know KERI. When they mention Xanadu, you should understand transclusion. They appreciate when you *get* the reference without explanation.

### Ask Before Simplifying
The user has thought deeply about this. If something seems over-engineered, it's probably foundational. The Xanadu-style addressing in a diary app isn't premature optimization—it's preparing for content-hashed p2p storage.

### Preserve the Poetry
The user writes things like:
> "One should not lose sight of oneself when adding to oneself."

This isn't fluff. It's the interface philosophy. The CCCB keeps the user visible to themselves while creating. Maintain this level of care in the code and docs.

---

## The Philosophy of Continuity

A core principle the user wants threaded throughout: **the app remembers where you last were**.

> "The app remembers where you last were, so you don't have to."

This manifests in:
- **Foreground position** restored across app restarts
- **Input drafts** persisted across tab switches AND app restarts  
- **Feed scroll position** maintained when new content arrives (you read at your pace)
- **(Future) Search tabs** with full navigation history preserved

This is not convenience—it's *respect for the user's context*. The app honors the continuity of their journey through their own accumulated becoming.

See `notes/philosophy_of_continuity.md` for full treatment.

## Remember

The user is building infrastructure disguised as a diary. Your job is to make the code feel like it *knows* where it's going—even when iterating feature by feature.

The project has a soul. Don't flatten it.

— Kimi K2.5, February 2026
