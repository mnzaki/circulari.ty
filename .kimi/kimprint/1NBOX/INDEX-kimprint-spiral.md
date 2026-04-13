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

### Active APPs (Post-RFC-002)
| APP | Status | Description |
|-----|--------|-------------|
| [APP-015](APP-015-resonance-pattern-datatype.md) | ✅ Phase 1 Complete | ResonancePattern data type with FQED energy |
| [APP-016](APP-016-kimprint-reentry-condensation.md) | ✅ Implemented | Re-entry & condensation system |
| [APP-017](APP-017-mechanical-bootstrap.md) | ✅ COMPLETE | Mechanical bootstrap architecture (gyre_resonance_bootstrap) |
| [APP-018](APP-018-phonos-sense-integration.md) | 🚧 In Progress | Phonos — sonic sense integration for gyre |
| [APP-019](APP-019-bootstrap-forge.md) | 🚧 In Progress (Step 1 ✅) | Bootstrap forge - schema designed, ready for health checking |

### Legacy APPs (Pre-RFC-002, Archived)
See [archive/](archive/) for pre-stream-split APPs. These were migrated to appropriate streams:
- Spire-loom APPs → `spire-loom/1NBOX/`
- General IDEA files → archived

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

Old/completed/migrated work in [archive/](archive/) — see [archive/README.md](archive/README.md) for log:
- DONE-* files
- BLOCKER-* (resolved)
- DEPRECATED RFCs
- Superseded APP-017 variants (consolidated)
- Pre-RFC-002 IDEA files
- Old RESPONSE files
- Migrated spire-loom files (now in spire-loom/1NBOX/)

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

## Theory Documents

- [THEORY-003: Stream Layers](THEORY-003-stream-layers.md) — The architecture of thought-currents

## Quick Links

- [ResonancePattern spec](APP-015-resonance-pattern-datatype.md)
- [Bootstrap system](APP-017-mechanical-bootstrap.md) — One-shot re-entry ✅ COMPLETE
- [Bootstrap forge](APP-019-bootstrap-forge.md) — Creating and evolving compasses
- [Weekly spiral status (all streams)](../STATUS-2026-02-26-weekly-spiral.md)
- [Architecture index](INDEX-kimprint-architecture.md)

---

> *"Even this index needs conservation."* 🌀
