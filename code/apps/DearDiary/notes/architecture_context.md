# DearDiary: Architecture Context

## Where We Are in the SWiVeL

DearDiary is **Year 1** of the [SWiVeL plan](../../README.md#swivel-plan)—a deliberate 
progression from personal tool to communal infrastructure. Understanding this context 
helps explain why certain architectural decisions (seemingly over-engineered for a 
"simple diary app") exist.

### The Trojan Horse

DearDiary presents as a personal Instagram-style feed, but it's actually a 
**DoubleDanger**: it pre-seeds the backend architecture that will power the full 
p2p network in later years. Users get a useful personal tool; we get battle-tested 
data structures and content-addressing patterns.

> "A diary with a media-feed feedback-loop, blogs on tumblr on steroids because 
> everything is just stored locally and your stream is just your own content."
> — [Circulari.ty README](../../README.md#y1-deardiary)

## Addressing: The Xanadu Connection

We draw from [Project Xanadu](https://xanadu.com/)—Ted Nelson's vision of a hypertext 
system where everything is addressable at fine granularity, nothing is truly 
"embedded" (only referenced), and links are bidirectional.

This is implemented via **`@o19/xana`**:

```typescript
// rad:// URI format
rad://{userPublicKey}/{repoId}@{commitId}/{path}#{anchor}

// Text span: #span=0,42 (start, LENGTH)
rad://alice/blog@a1b2c3d/posts/hello.md#span=0,42

// Media anchor: time + spatial coordinates
rad://bob/photos@f8e9d2c/vacation.png#time=5000&x=10&y=20&w=100&h=100
```

**Key differences from naive addressing:**
- **Non-breaking URIs**: Commit hash ensures content doesn't move
- **Text spans use LENGTH**: `#span=0,42` = 42 characters, not ending at position 42
- **Verification workflow**: Content is cached but verified against source (`pending` → `valid`/`invalid`)
- **"Trust but verify"**: Show cached immediately, validate asynchronously

### Using @o19/xana

```typescript
import { UriHelper, XanaAnchorInfo } from '@o19/xana/uri';

// Parse and resolve a URI
const parsed = await UriHelper.parse(
  'rad://alice/blog@a1b2c3/posts/hello.md#span=0,42',
  { resolve: true }
);

const anchor = await parsed.handler.getAnchor();
// { anchorType: 'text', start: 0, length: 42 }

// The XanaXplain viewer handles rendering with span highlighting
import { XanaXplain } from '@o19/xana/xplain';

const viewer = new XanaXplain({
  container: '#viewer',
  uri: 'rad://alice/blog@a1b2c3/posts/hello.md#span=10,20'
});
```

## Data Flow: Accumulation → Commitment

```
User Action          Staging Area              Storage
─────────────────────────────────────────────────────────────
Tap "Text"    →    Text bit added       →   (ephemeral)
Paste link    →    Link preview added   →   (ephemeral)
Tag person    →    Person chip added    →   (ephemeral)
                     ↓
Tap CCCB      →   canonicalize()        →   hash → sign → store
                     ↓
                Post enters Feed        →   local (Y1)
                                        →   IPFS/DAT (Y2+)
```

The CCCB (Central Circular Capture Button) embodies the **Self as capture device**: 
always receiving, always becoming, until the moment of commitment when it releases 
into the accumulated Feed.

## Why These Types?

### `AccumulableBit` Union Type

Posts are *compositions* of bits, not monolithic blobs. This mirrors how p2p 
content addressing works: you don't store a "post with an image," you store a 
post that *references* an image by hash.

```typescript
// Current (Y1): Local SQLite
type AccumulableBit =
  | { type: 'text'; content: string }
  | { type: 'media'; uri: string; mimeType: string }
  | { type: 'link'; url: string; preview?: LinkPreview }
  | { type: 'person'; did: string; displayName: string };

// Future (Y2+): Content-addressed with xana URIs
{
  "bits": [
    { "type": "text", "content": "At the cafe..." },
    { "type": "media", "uri": "rad://self/pkb@a1b2c3/media/photo1.jpg" }
  ]
}
// → hash → sign → broadcast
```

**Note:** Text spans and media regions are no longer inline in the bit type. 
When granular addressing is needed, use `@o19/xana` URIs with appropriate anchors.

## Local-First as Foundation

DearDiary stores everything locally (for now) not because we're avoiding 
distributed systems, but because **local-first is the right default**. Even when 
the p2p layer arrives:

1. Content is authored locally
2. Hashed and signed locally
3. *Then* broadcast to the mesh
4. Local copy remains authoritative

This mirrors the [KERI](https://keri.one/) pattern: your Key Event Log is yours, 
you control it, others can verify it.

## Contributing Back

As DearDiary develops, patterns that prove useful should migrate to the shared 
library:

- URI parsing/resolution (via `@o19/xana`)
- Content canonicalization (pre-hash)
- Xana anchor handling
- ProseMirror transclusion editing

The goal: when Y2 and Y3 arrive, they import mature, tested libraries—not 
reinvented wheels.

## See Also

- [CIRCULARI.TY.md](../../CIRCULARI.TY.md) — Full vision for Circles and Squares
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — KERI, CWTCH, IPFS/DAT plans
- [CODE_ARCHITECTURE.md](../../CODE_ARCHITECTURE.md) — Shared library vision
- [notes/home_screen.md](./home_screen.md) — CCCB philosophy
- `@o19/xana` — Xanadu implementation for the 21st century
