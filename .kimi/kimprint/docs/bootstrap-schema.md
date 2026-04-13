# Bootstrap Schema Documentation

> *Self-documenting bootstrap schemas with embedded health tracking*

## Overview

Each stream needs three bootstrap files to guide re-entry:

| File | Kind | Update Frequency | Concern |
|------|------|------------------|---------|
| `{stream}-ETHOS.json` | ethos | Rare | "Why do we exist?" |
| `{stream}-STRUCTURE.json` | structure | Monthly | "What are we building?" |
| `{stream}-STATE.json` | state | Every session | "Where are we now?" |

## Self-Documenting Fields

Every bootstrap includes `_guideline` and `_health` fields:

```json
{
  "_guideline": "When and how to update this bootstrap",
  "_health": {
    "last_updated": "2026-03-15T18:00:00Z",
    "update_frequency": "rare|monthly|continuous",
    "confidence": 0.95,
    "staleness": "fresh"
  }
}
```

Every content field includes `when_to_update`:

```json
{
  "field": "value",
  "when_to_update": "Clear guidance on when this changes"
}
```

## ETHOS Bootstrap

**Purpose:** Philosophical foundation, principles, governance

**Update:** Only when core philosophy shifts

## STRUCTURE Bootstrap

**Purpose:** Architecture, tech stack, dependencies

**Update:** When technology changes

## STATE Bootstrap

**Purpose:** Current work, urgencies, active relationships

**Update:** Every session

## Continuous Improvement

1. **Call** `gyre_resonance_bootstrap({cwd})`
2. **Review** `bootstrap_health` for each file
3. **Note** todos and warnings
4. **Work** with guidance in mind
5. **Update** via `bootstrap_forge({...})`
6. **Repeat** - bootstrap improves with each session
