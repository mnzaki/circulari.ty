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

## DearDiary → Future Integration

| DearDiary (Now) | Hal-loW / Circulari.ty (Future) |
|-----------------|--------------------------------|
| `Post.id` (UUID) | Content hash / CID |
| Local device storage | IPFS / DAT communal storage |
| `XanaduLink` with `UAddress` | CWTCH-identified transclusion |
| `person.did` (stub) | KERI AID (Autonomous IDentity) |
| `spatiotemporal` coordinates | Time-space addressable media |
| Text spans (`text://id#start,end`) | Fine-grained annotation & linking |
| `commitAccumulation()` | Sign + broadcast to p2p mesh |

### The Xanadu Connection

Our addressing system (`UAddress`, fragment identifiers, transclusion types) draws 
from [Project Xanadu](https://xanadu.com/)—Ted Nelson's vision of a hypertext 
system where:

- Everything is addressable at fine granularity
- Nothing is ever truly "embedded," only referenced
- Links are bidirectional and first-class
- Documents are composed of transclusions

This isn't academic fancy: content-addressed storage *requires* these patterns. 
When a Post is identified by its hash, you can't "embed" a video—you reference 
it by hash, possibly with spatiotemporal coordinates (`#t=10.5,x=0.5,y=0.3`).

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
// Future serialization (canonical JSON)
{
  "bits": [
    { "type": "text", "content": "At the cafe..." },
    { "type": "media", "uri": "ipfs://QmXyz..." },
    { "type": "person", "did": "did:keri:abc123..." }
  ],
  "links": [
    { "target": "post://QmAbc...#text:10,25", "type": "reference" }
  ]
}
// → hash → sign → broadcast
```

### `XanaduLink`

Links aren't just URLs—they're typed relationships with source/target addresses:

- `reference`: Points to something (like a citation)
- `transclusion`: Embeds content from elsewhere (live inclusion)
- `annotation`: Commentary layered over content
- `response`: Threaded conversation

In Y2+, these become CWTCH-identified, gossiped across the p2p mesh.

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

- `UAddress` parsing/resolution
- Content canonicalization (pre-hash)
- Spatiotemporal coordinate handling
- Xanadu link management

The goal: when Y2 and Y3 arrive, they import a mature, tested library—not 
reinvented wheels.

## See Also

- [CIRCULARI.TY.md](../../CIRCULARI.TY.md) — Full vision for Circles and Squares
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — KERI, CWTCH, IPFS/DAT plans
- [CODE_ARCHITECTURE.md](../../CODE_ARCHITECTURE.md) — Shared library vision
- [notes/home_screen.md](./home_screen.md) — CCCB philosophy
