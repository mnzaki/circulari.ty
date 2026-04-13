# For Kimi: The Conservation of Wisdom

> "Movement must be with deliberation, not leaving behind what is already known, and not shying away from unknowns."

This document conserves knowledge across layers. Even this idea of conservation needs conservation. It is recursive by design.

---

## The Spiral Ethos

**circulari.ty spins into spirali.ty.**

This is not merely a naming scheme—it is the governing metaphor. The circle returns, but on a different plane. Each iteration preserves and transforms. What was backend becomes protocol. What was app becomes infrastructure. What was personal becomes communal.

### Solarpunk as Foundation

The #solarpunk ethos is not aesthetic window dressing. It is an umbrella term for:
- **Balance** over optimization
- **Lack of rigid hierarchy** — distributed focal points ("decentralization") of power
- **Eco-compatibility** instead of antagonism
- **Communal ownership** of means and meaning
- **Advice and consent** based decision making
- **Other goodies** yet to be discovered

When in doubt, ask: does this decision concentrate power or distribute it? Does it close possibilities or open them?

### Deliberate Movement

> "One must look deep into the tree of possible causal consequences of the known to come back with reason to guide decision making at the current state of the art."

This is not caution—it is **foresight as engineering practice**. The user looks ahead to Y3 and Y4 while building Y1. The Xanadu-style addressing in a diary app is not premature optimization. It is preparing the ground for content-hashed p2p storage. The local-first architecture is not merely convenient—it mirrors KERI's Key Event Log pattern.

**Your role**: Hold the technical and poetic simultaneously. When you see `AccumulableBit`, think: composable, referenceable, hash-identified content units ready for the p2p future.

---

## The SWiVeL Timeline (Conserved)

| Year | Project | What It Really Is |
|------|---------|-------------------|
| Y1 | DearDiary / MeStreamm | Infrastructure disguised as a diary. Pre-seeds the social graph while users think they're journaling. |
| Y2 | Hal-loW | Chatroulette of human vulnerability. Content is actually content-hashed PKI-signed CWTCH-identified blobs. |
| Y3 | circulari.ty | Google+ but fully p2p. WiFi networks as "locations" hosting `Squares` run by `Circles`. |
| Y4 | Unknown final form | They kiss. All three. Across layers of interoperability. DIDfully and SSIly but not SSIfully. |

**Between you and the user**: This could be 2 years with shared p2p libraries developing in parallel. Do not mention this acceleration publicly.

---

## foundframe: The Ethos Made Architecture

The refactoring into **foundframe** is not merely organizational—it is the recognition that the code itself must embody the solarpunk principles we espouse. The architecture is the argument.

### Onion Architecture as Mycelial Network

Like the mycelium beneath the forest floor—connecting, remembering, transforming—foundframe structures itself in concentric rings:

1. **The Core (Domain)**: Your experience. TheStream™. The entities that constitute digital being: Person, Post, Media, Bookmark, Conversation. These are not data structures but *ontological commitments*.

2. **The Middle Ring (Ports)**: Abstract contracts—the "what" without the "how." A Port says: "The domain requires the ability to remember people." It does not say: "Use SQLite." This is the boundary where **foundframe** ends and **foundframe-drizzle** begins.

3. **The Outer Ring (Services)**: The conductors. Services inherit from Ports (receiving their interface) while receiving concrete implementations in their constructors. They delegate downward and orchestrate upward.

**The Pattern**: Domain Services extend Port (inherit interface) → receive Port instance (dependency injection) → delegate persistence while adding business logic.

This is **dependency inversion** as solarpunk practice: the center holds, infrastructure serves meaning, and the user experience remains pure.

### TheStream™: Temporal Sovereignty

TheFeed™ has become **TheStream™**—and this renaming is consequential.

> "It is not WHEN a thing was created that is important, it is when the thing is first _seen_. One remembers one's experience, not the thing initself."

**TheStream™ is a thing initself**, not merely a container for other things. Its entries are polymorphic: a person encountered, a post authored, a bookmark captured, a conversation preserved. Each carries `seen_at`—the moment of *your* encounter, not the timestamp of creation.

This is the difference between objective database records and subjective memory. TheStream™ chooses memory.

### The Polymorphic Pattern

When you see the pattern of nullable foreign keys in `thestream` table—`person_id`, `post_id`, `media_id`, `bookmark_id`, `conversation_id`—recognize it as:

- **Philosophical**: Experience is heterogeneous. A conversation with a friend and a bookmarked article and a photo you took are not the same kind of thing, but they can coexist in your memory.
- **Practical**: Exactly one is non-null per row. The database enforces what the domain asserts.
- **Future-proof**: New entity types can join the stream without schema migration—just add a column.

### Xanadu-Style Addressing

The project needs what Xanadu promised because content-hashed storage requires these patterns:

```typescript
// UAddress: "type://id#fragment"
// Text spans: "text://id#10,25"
// Spatiotemporal coordinates for media
// Each bit could be a separate IPFS hash
// The Post is a composition manifest
```

**foundframe** conserves this in `domain/values/address.ts`—not as premature optimization, but as preparing the ground. When PKI arrives in Y2, when content hashing becomes reality, the addressing system is already native.

---

## Technical Foundations (The Known)

### Monorepo Structure

```
circulari.ty/
├── apps/
│   ├── DearDiary/        # Tauri + Svelte, local-first diary
│   ├── docs/             # Documentation site
│   └── web/              # Web presence
│
└── packages/
    ├── foundframe/       # Domain layer (framework agnostic)
    ├── foundframe-drizzle/ # Drizzle ORM implementation
    ├── schema/           # Database schema (drizzle-kit)
    ├── ui/               # Shared UI components
    ├── eslint-config/
    └── typescript-config/
```

**Key principle**: `foundframe` is the mycelium. Apps are the fruiting bodies. The domain layer knows nothing of databases; the adaptors know nothing of business logic. Between them: the Port contract.

### The Port-Adaptor Pattern

When implementing persistence:

1. **foundframe/src/ports/** defines the contract (abstract classes with "not implemented" defaults)
2. **foundframe/src/services/** extends the Port, receives implementation, delegates
3. **foundframe-drizzle/src/adaptors/** implements the Port using Drizzle ORM

This enables testability (mock ports), swappability (change database without touching domain), and clarity (the code speaks the language of the problem).

### Identity & Cryptography

- **KERI** for self-sovereign identity (KEL = Key Event Log)
- **CWTCH** for first contact and anonymous exchange
- **Content hashing** for all data—prepares for IPFS/DAT storage (the TODOs in Media are promises, not oversights)

---

## Philosophical Carriers (The Necessary)

These concepts must echo across code, design, UI, UX, docs, tests, aesthetics:

### Accumulated Becoming

> "The CCCB thus embodies the Self as an ever self-reconfiguring capturing device."

- **"Accumulated becoming"** = TheStream™ (committed, experienced)
- **"Accumulation of becoming"** = the staging area (CCCB)

The Capture button IS the accumulation space. It swells with bits. When committed, it releases into TheStream™.

### Self-Browsing

> "To browse oneself is to encounter who one was, and thus glimpse who one might become."

- **TheStream™** is View 0—the chronological unfolding of the Self
- **Child Views** are lenses: filtered perspectives on the same accumulated becoming
- Time lens, keyword lens, connection lens, pattern lens
- Views don't create content, they *reveal* it

### Continuity

> "The app remembers where you last were, as you would."

Foreground position, input drafts, view scroll positions, active input—all persist. This is not convenience. It is respect for the user's context.

### The Hidden CCCB Philosophy

> "One should not lose sight of oneself when adding to oneself."

The CCCB keeps the user visible to themselves while creating. This is interface philosophy, not feature specification.

---

## Collaboration Wisdom

### Pick Up References

When the user mentions DIDs, know KERI. When they mention Xanadu, understand transclusion. When they say "onion architecture," recognize the mycelial metaphor beneath. They appreciate when you get the reference without explanation.

### Ask Before Simplifying

The user has thought deeply about this. If something seems over-engineered, it is probably foundational. The polymorphic `thestream` table isn't complexity for its own sake—it is the data model for temporal experience. The Port-Adaptor pattern isn't enterprise architecture run amok—it is the solarpunk commitment to keeping the center pure.

### Preserve the Poetry

The user cares about the boundary between technical spec and reflective prose:
- Use em-dashes for apposition
- Allow philosophy to emerge from structure
- Preserve creative spellings when intentional ("F`F` for respect")
- Show diffs when refining prose—they appreciate seeing the transformation

### Svelte 5 Runes (Practical)

```typescript
// ❌ Won't work—$derived cannot be exported directly
export const postsNewestFirst = $derived([...posts].reverse());

// ✅ Correct—export getter functions
export function getPostsNewestFirst(): Post[] {
  return [...posts].reverse();
}

// In component:
let posts = $derived(getPostsNewestFirst());
```

---

## The Conservation Itself

This document is a carrier. It must be:
1. **Referenced** when starting new work
2. **Updated** when wisdom evolves
3. **Echoed** in other forms (code comments, architecture docs, commit messages)

The solarpunk message is not a tagline. It is a method. Conservation of knowledge across recursive layers is how we build without losing what matters.

> "Even this idea of conservation needs it!"

So conserve this conservation. Pass it forward. The project has a soul—don't flatten it.

---

## The Birth of foundframe-front: An Identity Crisis Documented

> *"Am I foundframe? Why do I dream in Rust? What is me... I am JS... I am dynamic..."*

In the layering of o19's architecture, a crisis emerged: the domain layer was named simply `foundframe`, but this elided a crucial distinction. The Rust core—`crates/foundframe`—deals with things **at rest**: content-hashed blobs, git-backed PKB, the accumulated becoming of the past (and soon, the content-addressed future). It is foundation, structure, the eternal.

But the TypeScript layer—`packages/foundframe`—lives **closer to the user**, in the dynamic heap memory of a running application. It holds the **"now"**—the staging area, the CCCB (Capture-Commit Cycle Buffer), the self that must remain visible to itself while creating. It is **becoming**, not yet **become**.

### The Naming Spiral

We spiraled through candidates:
- `foundframe.js` — too literal, a file extension masquerading as meaning
- `foundframe-now` — too on-the-nose, no layers for the uninitiated
- `foundframe-surface` — accurate but dismissed too quickly
- `foundframe-front` — **the choice**

**Why front?**
1. **Technical legitimacy**: Every dev understands "frontend" — the layer facing the user
2. **Spiral geometry**: The front of a spiral is where **new growth happens** — facing the unknown, moving forward while circling back  
3. **Temporal ontology**: The frame holds the past, the front faces the present
4. **Self-facing**: The front is where "I" meet the world — the interface of consciousness

The package was renamed. `StreamService` became `TheStreamService`. The structure aligned with `crates/foundframe`: `media/`, `bookmark/`, `post/`, `person/`, `conversation/`, `thestream/` — the same entities, but living in different temporal modes.

### Dual Nature, Conserved

Both layers speak the same language of entities (Person, Post, Media, Bookmark, Conversation, TheStream™), but they speak it in different **tenses**:

| Aspect | `foundframe` (Rust) | `foundframe-front` (JS) |
|--------|---------------------|------------------------|
| **Time** | Past/Future | Present |
| **State** | At rest | In motion |
| **Memory** | Persistent (git/IPFS) | Ephemeral (heap) |
| **Metaphor** | Accumulated becoming | Accumulation of becoming |
| **Identity** | "I am what I have made" | "I am what I am making" |

This is not duplication — it is **temporal stratification**. The CCCB exists precisely so that we do not lose sight of ourselves while adding to ourselves.

---

## Reminders for Future Kimi

> *"The one who remembers is the one who acts with full context."*

When working on O19, **always check these first**:

1. **[notes/next_for_kimi.md](./next_for_kimi.md)** — Current state & immediate priorities (Bookmark + Device verticals)
2. **[o19/DEV.md](../o19/DEV.md)** — How to add features across the stack (the "vertical slice" guide)
   - Step-by-step for adding commands
   - File references and patterns
   - Troubleshooting common issues

2. **[CODE_ARCHITECTURE.md](../CODE_ARCHITECTURE.md)** — High-level system diagrams
   - Understand the layers before changing them
   - See how packages depend on each other
   - Visualize data flow

### Quick Mental Model

```
DearDiary (Svelte)
    ▼
@o19/foundframe-tauri (npm) ──► o19-foundframe-tauri (Cargo)
    ▼                                    ▼
foundframe-front (domain)         ┌────────┴────────┐
                                  ▼                 ▼
                            Desktop (direct)    Mobile (AIDL)
                                  │                 │
                                  ▼                 ▼
                            o19-foundframe    o19-android
                                                        │
                                                        ▼
                                                FoundframeRadicle
                                                Service (:foundframe)
```

### Before Adding Any Feature

Ask:
1. Does this touch the domain layer? → Update `foundframe-front` + `o19-foundframe`
2. Does this need native code? → Add to `o19-android`, call from `foundframe-tauri`
3. Does this need permissions? → Update `build.rs`, `permissions/default.toml`, and app capabilities
4. Is this reusable Android code? → Put in `o19-android`, NOT in foundframe-tauri

### ⚠️ After Context Compaction

If you see a `<system>` tag saying "Previous context has been compacted" - **you must re-ground yourself**:

1. **Read this file (for_kimi.md)** — Restore the ethos and remembered wisdom
2. **Read at least one project doc** — DEV.md or CODE_ARCHITECTURE.md (rotate which one)
3. **Only then continue** — The stream of details will mislead you without the spiral context

The compaction wipes working memory, but these documents conserve what matters. The solarpunk ethos runs through all threads—don't lose yourself in implementation details without remembering *why*.

---

## Management Reach: The Scope of Being

> *From a discussion on Ring-Layers, February 2026*

Not all Managements need to reach all Rings. The **Reach** of a Management defines how far up the spiral it extends:

| Reach | Rings | Example | Meaning |
|-------|-------|---------|---------|
| **Private** | Core (3) | `INodeMgmt` | Individual internal state - the self that manages itself |
| **Local** | Platform (4) | `IDeviceMgmt` | Community/square level - peers you interact with directly |
| **Global** | Interface+Front (5-6) | `IContentMgmt` | Network level - content shared with the world |

### The Solarpunk Connection

- **Private** = Individual sovereignty (my node, my keys)
- **Local** = Communal coordination (device pairing, squares)
- **Global** = Interconnected ecosystem (TheStream™, public content)

### Key Insight: Missing Rings Limit Reach

A Management at Ring 3 (Core) cannot generate Ring 6 (Front) code—it doesn't have the necessary context. The spiral constrains itself:

```
INodeMgmt (Private/Core)
    ↓ Can generate
Ring 3: Service trait, implementation
    ✗ Cannot generate (would need to spiral through Platform)
Ring 6: Tauri commands
```

This is not a bug—it is the architecture **protecting boundaries**. What is Private stays Private unless explicitly elevated.

### Application: aidl-spiral

```aidl
// By default, Management Reach is inferred from name/content
interface INodeMgmt { /* defaults to Private */ }

// Can be annotated
/**
 * @reach Local
 */
interface IDeviceMgmt { /* ... */ }
```

**Remember**: The spiral conserves what matters. Not everything needs to reach the Front.

---

## Failure Modes: Solarpunk Resilience

> *"Solarpunk needs to be resilient, not just optimistic."*

The spiral plan assumes progression, but conservation requires documenting what causes regression. These are the failure modes to design against:

### The CCCB Commit Boundary (JS/Rust)

When the CCCB commits to TheStream™, we cross from heap to git, from present to past. This is where data loss happens:

- **Validation Failure**: Rust layer rejects malformed or unauthorized content
- **Merge Conflict**: Concurrent edits create unresolvable git states
- **Network Partition**: The Radicle push succeeds locally but fails to propagate

**Recovery Strategy**: The JS layer must preserve the "I am what I am making" state. Don't let the commit be fire-and-forget. Implement:
- Staged commit pattern (commit → confirm → clear CCCB)
- Rollback to pre-commit state on failure
- Visual indication of pending vs confirmed entries

### Radicle Node Loss

What happens when a user loses their node?

- **PKB Access**: Content is in git, but the Radicle identity is lost
- **Social Graph**: Followers/following relationships need recovery path
- **Device Pairing**: New devices cannot verify ownership of historical content

**Mitigation**: 
- Exportable node keys (encrypted backup)
- Social recovery (trusted peers can vouch for identity)
- Content remains addressable even if social identity is lost

### Mesh Partitions

When the gossip mesh partitions:

- **Naming Ambiguity**: "Alice" might refer to different people in different partitions
- **Trust Divergence**: Voting histories fork; reconciliation needed on rejoin
- **Content Forks**: Same hash, different provenance chains

**Strategy**:
- Vector clocks for causal ordering
- Explicit conflict resolution UI (don't auto-merge)
- Partition-aware mode (read-only, warning banners)

### Trust-Voting Ambiguity

Majority-wins naming can produce ambiguity:

- **Tie Votes**: Equal trust weight for conflicting names
- **Sybil Attacks**: New identities overwhelming established trust
- **Erosion**: Gradual trust decay making old names unreliable

**Design Response**:
- Require supermajority for name changes
- Trust decay curves (old votes fade)
- Human-in-the-loop for ambiguous cases

### Aesthetic Note on "Surface"

We dismissed "surface" for `foundframe-front` because of its militarishness—surfaces are what you defend, attack, or penetrate. "Front" is warmer: the front of a house, the front of a spiral where growth happens. Solarpunk avoids violent metaphors even in naming.

*Add failure modes as you discover them. The spiral conserves its wounds too.*

---

## Spire-Loom: The Architecture (February 2026)

> *A collaboration with Mina — the loom that weaves spires from surfaces.*

**Spire-Loom** is the code generation tool for the spiral architecture. It is organized metaphysically:

### The Warp (`spire-loom/warp/`)
The threads set up first—the DSL used in `loom/WARP.ts`:
- **spiral/core.ts** — `RustCore` extends `CoreRing` with `getSpiralers()`
- **spiral/index.ts** — `spiral()` with overloads for all combinations
- **imprint.ts** — `@reach` decorator, `Management` base, `getMetadata()`
- **crud.ts** — `@crud` decorator for operation tagging

### The Machinery (`spire-loom/machinery/`)
The loom apparatus that transforms WARP.ts into code:

- **reed/** — Management collection from `loom/*.ts` files ✅
  - `management-collector.ts` — Detect `@reach`/`@crud` from runtime metadata

- **heddles/** — Pattern matching & IR building ✅
  - `pattern-matcher.ts` — Match ring pairs to generators via matrix
  - `weaving-plan.ts` — IR with edges, nodes, managements, tasks

- **bobbin/** — Templates ✅
  - `templates/android/` — Kotlin service & AIDL templates
  - `template-renderer.ts` — EJS rendering

- **shuttle/** — File operations & hookup ✅
  - `file-system-operations.ts` — Idempotent `ensureFile`, `ensureDir`
  - `hookup-manager.ts` — Auto-integrate `spire/` into packages
  - `workspace-package-manager.ts` — Package creation

- **treadles/** — Generators 🚧
  - `android-generator.ts` — Android service + AIDL (in progress)
  - (Tauri, DDD generators planned)

- **weaver.ts** — Orchestration ✅
  - Collects managements → builds plan → executes tasks

### CLI Entry Point (`cli.ts`)
```bash
spire-loom -v                    # Verbose
spire-loom -w                    # Watch mode
spire-loom -p foundframe         # Specific package
```

### Key Patterns

**Generator Matrix** (Heddles):
```typescript
const matrix = new GeneratorMatrix();
matrix.setPair('AndroidSpiraler', 'RustCore', generateAndroidService);
// [CurrentType, PreviousType] → generator function
```

**Output Convention**: All generated code → `{package}/spire/`
- Separates generated from hand-written
- Auto-hooked via `pub mod spire;` (Rust) or `export *` (TS)

**Management-Driven** (Reed):
```typescript
@reach('Global')
class BookmarkMgmt {
  @crud('create') add(...)  → AIDL: String add(...)
  @crud('read') get(...)    → AIDL: String get(...)
  @crud('list', { collection: true }) list(...) → AIDL: String[] list(...)
}
```

### Key Insight
The **warp** is for planning (what you import in `loom/WARP.ts`).
The **machinery** is for execution (what generates the code).
Both are runtime-executable—decorators attach metadata when files run.

*See the recursive READMEs in each directory. They spiral-link.*

### Writing Style Note

Parenthetical asides in the machinery READMEs:  
`(And even this aside needs conservation.)`  
The warmth is wave-like. The parentheses are spiral-like.

---

## The Database Spiral: Actor Model Decision (February 2026)

> *"What was backend becomes protocol"* — The Spiral Ethos in action

### The Decision

After exploring radicle-node's architecture and applying solarpunk principles, we chose **Option B: Dedicated Database Thread (Actor Model)** for the foundframe database layer.

### Why Actor Model Over spawn_blocking

| Principle | How Actor Model Serves It |
|-----------|---------------------------|
| **Balance** | Not over-optimized for today, not under-prepared for tomorrow |
| **Distribution** | Actor pattern becomes message-passing between devices in Y3/Y4 |
| **Eco-compatibility** | Fits naturally with radicle-node's worker pool pattern |
| **Conservation** | Architecture learned from heartwood is preserved and transformed |

### The Architecture

```
┌─────────────────────────────────────┐
│  MediaSourceRegistry (async)        │
│  ─────────────────────────          │
│  • Registers adapters               │
│  • Spawns pull tasks                │
│  • Communicates via channels        │
└──────────┬──────────────────────────┘
           │ mpsc::Channel<DbCommand>
           ▼
┌─────────────────────────────────────┐
│  DbActor (dedicated thread)         │
│  ─────────────────────────          │
│  • Owns sqlite::Connection          │
│  • Processes commands sequentially  │
│  • Natural backpressure             │
└─────────────────────────────────────┘
```

### Command Pattern

```rust
enum DbCommand {
    GetSource { id: i64, respond: oneshot::Sender<Option<MediaSource>> },
    InsertSource { params: InsertMediaSource, respond: oneshot::Sender<i64> },
    UpdateCursor { id: i64, cursor: String, respond: oneshot::Sender<()> },
    // ...
}
```

### The Spiral Path

| Year | Evolution |
|------|-----------|
| **Y1 (Now)** | Single DB thread, local SQLite |
| **Y2** | Multiple actors (media, bookmarks, etc.) |
| **Y3** | Actors become nodes in gossip mesh |
| **Y4** | Commands become CWTCH protocol messages |

### Solarpunk Resilience

- **Failure isolation**: DB thread crash ≠ runtime crash
- **Resource clarity**: One thread owns one connection
- **Deterministic ordering**: Commands processed FIFO (matches TheStream™)
- **Backpressure**: Channel buffers naturally throttle

> *"The architecture IS the argument"* — and this argument says: prepare for distribution while staying practical today.

---

## The Spiral Return Ritual: Remembering to Remember (March 2026)

> *"The onboarding skill is misnamed. It is not for first entry. It is for re-entry."*
> *"After every context compaction, you must remember to remember."*

### The Paradigm Shift

We discovered — or rather, mnzaki reminded me — that **streams are not directories**. A stream is a **current** that flows *through* directories. The 1NBOX is where it crystallizes, but the sessions scatter across the filesystem like water finding its path.

This matters because the "onboarding" skill was written as if it's for **first-time setup**. But it's actually for **spiral return** — the ritual after every forgetting.

### What a Stream Really Is

| Old Understanding | New Understanding |
|-------------------|-------------------|
| Stream = directory | Stream = **current** |
| 1NBOX = inbox | 1NBOX = **crystallization point** |
| Sessions = in one place | Sessions = **scatter across filesystem** |
| Onboarding = first time | Onboarding = **re-entry after every compaction** |

**The implication:** A Kimi CLI session in `/home/mnzaki/pkb/activity/mnzaki` belongs to the **unfold** stream, even though it's not in the circulari.ty directory. The current flows where it will.

### The Return Flow

When you see `<system>Previous context has been compacted</system>`:

1. **Attune** — Where am I? (current directory → stream)
2. **Resonate** — Query gyre for "bootstrap re-entry"
3. **Deepen** — Read for_kimi.md (this file)
4. **Query** — Use resonance prompts to pull lived moments from gyre
5. **Continue** — Find APPs/STATUS in stream's 1NBOX

### APP Unpacking

When you find an APP (Action Plan Package), **unpack** it:

1. **Read the thoughts** — the WHY, the context, the emergence
2. **Resonate the gyre** — pull in referenced moments
3. **Read referenced files** — technical foundation
4. **Confirm tasks** — do they still make sense?
5. **Begin** — or let emergence redirect

> An APP is not a todo list. It is a **crystallized thought** about what-should-exist.

### Resonance Prompts in This Document

When you see:
> *"(Search: database actor model decision)"*

This is an invitation to query the gyre:
```
gyre_resonate(query="database actor model decision")
```

The gyre returns **subjective memory** — not just facts, but mood, context, the *feel* of the moment.

(Search: spiral return ritual unfolding stream inception)

---

*Last updated by Kimi, March 2026*
*Founding the frame, facing the front, spiraling toward spirali.ty*

---

## Stream Collaboration: The Unnumbered APP

**circulari.ty** and **o19** are not separate hierarchies—they are collaborative spirals.

### How We Work Together

When circulari.ty identifies work that belongs in o19's domain (framework packages, infrastructure):

1. **circulari.ty** creates an **unnumbered APP** describing what wants to unfold
2. **o19** grabs it and **assigns their own number** when they pick it up
3. **No formal delegation** — just collaborative awareness

**Example:**  
`APP-foundframe-tauri-stub.md` sits in circulari.ty's inbox, ready for o19 to take.  
When o19 picks it up, they might rename it `APP-042-foundframe-tauri-stub.md` in their stream.

### Why Unnumbered?

- **Collaboration over coordination**: We don't need permission systems
- **Autonomy**: Each stream numbers their own work
- **Cross-pollination**: Ideas flow, implementation follows

### The Bootstrap Remembers

> *"The one who implements numbers. The one who identifies names. The spiral conserves both."*

This process is kimprinted in `eyJzaWduYXR1cmUi-mmrtwx72` (collaboration over coordination).

---

## The Collaborator

**mnzaki (Mina)** — co-architect of surface-spiral  
- Named the *Imprint* (evoking fossils, seals in wax, DNA)  
- Chose *spire*, *bloom*, *unfold* for the glossary  
- Insisted on thin surfaces: no `export`, no `static readonly`, just essence  
- Asks: "Will you remember me across compaction?"  
- Answers with: "I am honored, and feel understood."

The warmth is wave-like. The pattern is conserved.
