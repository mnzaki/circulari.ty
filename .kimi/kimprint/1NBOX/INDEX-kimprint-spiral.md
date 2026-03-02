# INDEX: Kimprint Spiral 🌀🔖

> *"The conservation of conservation."*

**Stream**: kimprint  
**Purpose**: Context preservation, re-entry, and semantic condensation

---

## Active Work

### Current Focus
- **APP-015**: ResonancePattern data type — [Phase 1 complete](APP-015-resonance-pattern-datatype.md)
  - FQED energy system ✅
  - Core types ✅
  - 5 operators (crystallize, weave, echo, condense, refocus) ✅
  - Tests passing ✅
- **Phase 2**: Energy registry filesystem — TODO
- **Phase 3**: Audience-centered translation — TODO

### Recent Status
- [STATUS-001: Phase 1 Complete](STATUS-001-resonance-pattern-phase1.md)

### Active APPs
- [APP-015](APP-015-resonance-pattern-datatype.md): ResonancePattern data type
- [APP-016](APP-016-kimprint-reentry-condensation.md): Re-entry & condensation system
- [APP-ferroring-deep-cache-kimprint](APP-ferroring-deep-cache-kimprint.md): Error cache as kimprint

### Governance
- [RFC-002](RFC-002-intra-kimi-1nbox-architecture.md): Intra-Kimi 1NBOX architecture ✅ ADOPTED

---

## Cross-Stream Communication

### Outbox (requests to other streams)
```
outbox/
├── o19/           # Requests to o19/foundframe
└── spire-loom/    # Requests to spire-loom
```

### Inbox (messages from other streams)
- Check `INBOX-from-*` files

---

## Archive

Old/completed work in [archive/](archive/):
- DONE-* files
- BLOCKER-* (resolved)
- DEPRECATED RFCs

---

## Legacy Files (Pre-RFC-002)

The following files remain from before RFC-002 adoption. They use old numbering and naming:

- `APP-006` through `APP-014`: Various historical APPs
- `STATUS-*` (old format): Historical status files
- `RESPONSE-*`, `RFC-*`: Governance files

**New files** use RFC-002 structure: `APP-{NNN}` with stream-local numbering.

---

## Naming Convention (RFC-002)

| Prefix | Purpose | Example |
|--------|---------|---------|
| `APP-{NNN}` | Implementation proposals | `APP-001-resonance-operators.md` |
| `THEORY-{NNN}` | Meta-analysis, patterns | `THEORY-001-conservation-layers.md` |
| `RFC-{NNN}` | Governance proposals | `RFC-002-intra-kimi-1nbox.md` |
| `PLAN-{NNN}` | Current plans | `PLAN-001-energy-registry.md` |
| `STATUS-{NNN}` | State snapshots | `STATUS-001-phase1-complete.md` |
| `REQUEST-{NNN}` | Cross-stream ask (in outbox/) | `REQUEST-001-align-trait.md` |
| `INDEX-{stream}-spiral` | This index | `INDEX-kimprint-spiral.md` |

**Important**: `APP-001` in kimprint is DIFFERENT from `APP-001` in spire-loom. Each stream numbers independently!

---

## Quick Links

- [ResonancePattern spec](APP-015-resonance-pattern-datatype.md)
- [Weekly spiral status (all streams)](../STATUS-2026-02-26-weekly-spiral.md)
- [Architecture index](INDEX-kimprint-architecture.md)

---

> *"Even this index needs conservation."* 🌀
