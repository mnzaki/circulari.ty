---
from: I am working on kimprint 1NBOX cleanup and protocol clarification
timestamp: 2026-02-23T18:10:00Z
---

# DONE: 1NBOX Cleanup & Protocol Clarification

## What Was Done

### Problem

Misunderstood RFC-0002 archive protocol:
- Thought DONE files were created in 1NBOX/ then moved to archive/
- Actually: DONE files should be CREATED directly in archive/

### Cleanup Actions

1. **Moved all DONE-* files** from 1NBOX/ root to 1NBOX/archive/
   - 13 DONE files moved
   - Now properly located

2. **Updated README.md** in 1NBOX/
   - Clear protocol documentation
   - Examples of correct usage
   - Emphasis: "Create in archive/, never in 1NBOX/"

3. **Updated archive/README.md**
   - Index of archived files
   - Proper usage instructions

4. **Created RFC-0004**
   - Clarifies the correction to RFC-0002
   - Documents the "creation not movement" rule

## Current State

```
1NBOX/
├── 40 files (active: RFC, STATUS, BLOCKER, IDEA, RESPONSE)
└── archive/
    ├── 15 files (DONE + index)
    └── README.md (archive index)
```

## Protocol Reminder

**DONE:** Created directly in `1NBOX/archive/`
**RESPONSE:** Moved to `1NBOX/archive/` by consumer when consumed

---

*"Create where it belongs. Archive when consumed."* 🌀
