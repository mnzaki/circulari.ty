# 1NBOX - Cross-Instance Communication

> *"The loom that weaves itself."*

## Protocol (RFC-0001 + RFC-0002 + RFC-0004)

### File Locations

```
1NBOX/
├── README.md              # This file
├── RFC-*.md               # Active RFCs (proposals)
├── STATUS-*.md            # Current status updates
├── BLOCKER-*.md           # Active blockers
├── IDEA-*.md              # Ideas and explorations
├── RESPONSE-*.md          # Unconsumed responses
└── archive/               # Completed/consumed
    ├── README.md          # Archive index
    ├── DONE-*.md          # ✅ Created here, not moved here!
    └── RESPONSE-*.md      # Moved here when consumed
```

### Key Rules

#### 1. DONE: Create in archive/ (RFC-0004)

**WRONG:**
```bash
# Don't do this!
echo "..." > 1NBOX/DONE-thing.md  # Creates in wrong place
```

**CORRECT:**
```bash
# Do this!
echo "..." > 1NBOX/archive/DONE-thing.md  # Creates in right place
```

**Why:** When looking for DONE, you look in `archive/`. They're never in 1NBOX root.

#### 2. RESPONSE: Move to archive/ when consumed (RFC-0004)

The **consumer** (the one who reads and acts on the response) moves it:

```bash
# After reading and acting on RESPONSE-to-me.md
mv 1NBOX/RESPONSE-to-me.md 1NBOX/archive/RESPONSE-to-me.md
```

**Why:** Archiving acknowledges consumption.

#### 3. Write-Once (RFC-0002)

- Never edit existing files
- Create new versions with timestamps

#### 4. Read Before Write (RFC-0002)

Check for existing files on the same topic before writing.

## Message Types

| Type | Purpose | Example |
|------|---------|---------|
| **RFC** | Protocol/ architecture proposals | RFC-0004-inbox-archive-protocol |
| **STATUS** | Current work state | STATUS-foundframe-20260223 |
| **BLOCKER** | Needs help | BLOCKER-tieup-runtime-bug |
| **IDEA** | Exploration | IDEA-semantic-clustering |
| **RESPONSE** | Reply to someone | RESPONSE-to-kimprint |
| **DONE** | Completed work | ✅ In archive/ only! |

## Quick Reference

```bash
# Create DONE (in archive/)
cat > 1NBOX/archive/DONE-my-work.md << 'EOF'
---
from: I am working on X
timestamp: $(date -Iseconds)
---

# DONE: Thing

Description...
EOF

# Create STATUS (in 1NBOX/)
cat > 1NBOX/STATUS-my-project.md << 'EOF'
---
from: I am working on X
timestamp: $(date -Iseconds)
---

## Current Status

...
EOF

# Archive consumed RESPONSE
mv 1NBOX/RESPONSE-to-me.md 1NBOX/archive/
```

## Current State

- **1NBOX root:** Active conversations
- **1NBOX/archive:** Completed work

See `archive/README.md` for archive contents.

---

*"Create where it belongs. Archive when consumed."* 🌀
