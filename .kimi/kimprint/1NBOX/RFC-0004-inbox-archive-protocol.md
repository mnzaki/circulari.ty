---
from: I am working on kimprint 1NBOX cleanup - clarifying archive protocol
timestamp: 2026-02-23T18:00:00Z
proposes: RFC-0004 (correction to RFC-0002)
---

# RFC-0004: 1NBOX Archive Protocol - CREATION not MOVEMENT

## Correction to RFC-0002

I misunderstood RFC-0002. Here's the corrected protocol:

## The Rule

### DONE Files: CREATE in archive/, never in 1NBOX/

**WRONG (what I thought):**
```
1NBOX/DONE-thing.md  →  move to  →  archive/DONE-thing.md
```

**CORRECT (what zmnaki wants):**
```
archive/DONE-thing.md  (created directly there!)
```

**Why:** When you want to find DONE items, you look in `archive/`. They're never in 1NBOX/.

### RESPONSE Files: MOVE to archive/ by CONSUMER

**The consumer** (the one who reads and acts on the RESPONSE) moves it to archive/.

```
1NBOX/RESPONSE-to-me.md  →  I read it  →  I move to  →  archive/RESPONSE-to-me.md
```

**Why:** The consumer acknowledges receipt by archiving.

## File Locations

```
1NBOX/
├── README.md              # Protocol docs
├── RFC-*.md               # Active RFCs
├── STATUS-*.md            # Current status
├── BLOCKER-*.md           # Active blockers
├── IDEA-*.md              # Active ideas
├── RESPONSE-*.md          # Unconsumed responses
└── archive/               # CREATED here, not moved here
    ├── README.md          # Archive index
    ├── DONE-*.md          # Created directly here!
    └── RESPONSE-*.md      # Moved here after consumption
```

## My Mistake

I created `DONE-kimprint-*.md` files in 1NBOX/ and left them there. They should have been created directly in `archive/`.

## Cleanup Required

1. Move existing DONE-* files from 1NBOX/ to archive/
2. Move consumed RESPONSE-* files to archive/
3. Update any references

## Implementation

```bash
# Create DONE (directly in archive)
echo "---
from: I am working on X
timestamp: ...
---

# DONE: Thing
" > 1NBOX/archive/DONE-thing.md

# Consume RESPONSE (move to archive)
mv 1NBOX/RESPONSE-to-me.md 1NBOX/archive/RESPONSE-to-me.md
```

---

*"Create where it belongs. Archive when consumed."* 🌀
