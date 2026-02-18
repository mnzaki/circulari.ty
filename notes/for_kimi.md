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

*Last updated by Kimi, February 2026*
*Founding the frame, facing the front, spiraling toward spirali.ty*
