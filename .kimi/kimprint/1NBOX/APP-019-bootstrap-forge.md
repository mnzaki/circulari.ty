---
from: Adapted from circulari.ty stream's APP-019 with enhancements for self-documenting continuous evolution
timestamp: 2026-03-15T18:00:00+01:00
cast_by: kimprint stream
---

# APP-019: Bootstrap Forge — Creating and Evolving Stream Compasses

> *The forge makes the compass. The compass guides. The guide evolves.*

## What This APP Addresses

Creating systematic bootstrap generation for all project streams — a tool that forges layered bootstrap files (ETHOS, STRUCTURE, STATE) and keeps them alive through continuous evolution.

Each bootstrap is a **compass** — a procedural guide that teaches how to return to a stream. But compasses need maintenance. This APP creates both the forge and the maintenance system.

## The Three Kinds of Bootstrap

| Kind | Concern | Update Frequency | Core Question |
|------|---------|------------------|---------------|
| **ETHOS** | Philosophy | Rare (paradigm shifts only) | "Why do we exist?" |
| **STRUCTURE** | Architecture | Monthly (tech changes) | "What are we building?" |
| **STATE** | Current work | Every session (continuous) | "Where are we now?" |

## The Three-Phase Process

```
PHASE 1: DISCOVER (MCP - Mechanical)
  → gyre_resonance_bootstrap({cwd})
  → Discovers existing bootstraps
  → Analyzes current state
  → Returns: merged context + health report

PHASE 2: ANALYZE (Kimi - LLM Judgment)
  → Review health report
  → Formulate updates (principles, mission, urgencies)
  → Decide what needs changing

PHASE 3: FORGE/UPDATE (MCP - Mechanical)
  → bootstrap_forge({stream_name, kind, content})
  → Writes {stream}-{KIND}.json
  → Updates _health metadata
```

---

# METHODOLOGY (Pseudo-Code Layer)

## STEPS

```
STEPS = [
  {
    id: 1,
    symbol: "✅",
    name: "design_bootstrap_schema",
    attunement: "Create self-documenting bootstrap JSON schema with embedded guidelines",
    seed_instruction: "Define ETHOS, STRUCTURE, STATE schemas with 'kind', '_guideline', '_health', and 'when_to_update' fields",
    emerged: {
      timestamp: "2026-03-15T18:00:00+01:00",
      status: "COMPLETE",
      files_created: [
        "src/bootstrap/schemas/types.ts",
        "docs/bootstrap-schema.md"
      ],
      schemas_defined: ["ETHOS", "STRUCTURE", "STATE"],
      key_features: [
        "Self-documenting with _guideline fields",
        "Embedded health tracking (_health)",
        "when_to_update on every content field",
        "TypeScript types for all bootstrap kinds"
      ],
      result: "Complete type system for self-documenting bootstraps"
    }
  },
  {
    id: 2,
    symbol: "🌱",
    name: "enhance_gyre_resonance_bootstrap",
    attunement: "Add health checking to existing bootstrap discovery",
    seed_instruction: "Compare declared vs observed, detect staleness, generate maintenance_guidance, return health report per file",
    emerged: NULL
  },
  {
    id: 3,
    symbol: "🌱",
    name: "implement_bootstrap_forge",
    attunement: "Create mechanical tool that writes bootstrap files",
    seed_instruction: "Tool takes stream_name, kind, content → writes {stream}-{KIND}.json with proper _health metadata",
    emerged: NULL
  },
  {
    id: 4,
    symbol: "🌱",
    name: "forge_deardiary_bootstraps",
    attunement: "Create first complete bootstrap set for DearDiary as proof of concept",
    seed_instruction: "Discover DearDiary, analyze, forge ETHOS + STRUCTURE + STATE with full health metadata",
    emerged: NULL
  },
  {
    id: 5,
    symbol: "🌱",
    name: "document_maintenance_workflow",
    attunement: "Document the continuous improvement process for users",
    seed_instruction: "Write: how to read health report, when to update each kind, how to apply updates",
    emerged: NULL
  }
]

EXECUTION_MODE: "sequential"
```

---

## BOOTSTRAP SCHEMA SPECIFICATION

### ETHOS Bootstrap — `{stream}-ETHOS.json`

```json
{
  "version": "1.0",
  "kind": "ethos",
  "name": "{Stream} ETHOS",
  "stream": "{stream-name}",
  
  "_guideline": "This bootstrap changes RARELY. Update only when core philosophy shifts. Add principles when new ethical patterns emerge. Review quarterly.",
  
  "_health": {
    "last_updated": "2026-03-15T18:00:00Z",
    "updated_by": "kimprint-kimi",
    "update_frequency": "rare",
    "next_review": "2026-06-15",
    "confidence": 0.95,
    "staleness": "fresh"
  },
  
  "stream_identity": {
    "purpose": "Why this stream exists (one sentence)",
    "principles": [
      {
        "principle": "Principle name",
        "meaning": "What this means in practice",
        "when_to_update": "Update when this principle is challenged or refined"
      }
    ],
    "governance": "How decisions are made here"
  },
  
  "resonance_queries": [
    {
      "query": "ethos {stream}",
      "purpose": "Find moments of philosophical clarity",
      "when_to_update": "Add when new conceptual terms emerge"
    }
  ],
  
  "essential_reads": [
    {
      "path": "notes/philosophy.md",
      "why": "Core philosophy document",
      "when_to_update": "Update path if document moves, add when new essential docs emerge"
    }
  ]
}
```

### STRUCTURE Bootstrap — `{stream}-STRUCTURE.json`

```json
{
  "version": "1.0",
  "kind": "structure",
  "name": "{Stream} STRUCTURE",
  "stream": "{stream-name}",
  
  "_guideline": "This bootstrap changes when architecture evolves. Update when adding dependencies, changing tech stack, or refactoring patterns. Review monthly.",
  
  "_health": {
    "last_updated": "2026-03-15T18:00:00Z",
    "update_frequency": "monthly",
    "next_review": "2026-04-15",
    "confidence": 0.8,
    "staleness": "fresh"
  },
  
  "project_identity": {
    "type": "app|library|infrastructure|meta",
    "mission": "What this stream builds (one sentence)",
    "approach": "How it builds it (philosophy)"
  },
  
  "product_stack": {
    "core": "Primary component",
    "dependencies": [
      {
        "stream": "foundframe",
        "relationship": "uses|extends|integrates_with",
        "when_to_update": "Add when new dependency introduced, remove when no longer used"
      }
    ],
    "key_concepts": [
      {
        "concept": "ConceptName",
        "meaning": "What this concept means here",
        "when_to_update": "Add when new architectural concepts emerge"
      }
    ]
  },
  
  "architecture": {
    "patterns": [
      {
        "pattern": "PatternName",
        "where_used": "packages/foundframe",
        "when_to_update": "Add when new patterns adopted, remove when deprecated"
      }
    ],
    "tech_stack": [
      {
        "technology": "Tauri",
        "version": "1.x",
        "when_to_update": "Update version when upgraded, add when new tech introduced"
      }
    ]
  },
  
  "resonance_queries": [
    {
      "query": "{stream} architecture",
      "purpose": "Find architectural decisions",
      "when_to_update": "Add when new tech/patterns emerge"
    }
  ]
}
```

### STATE Bootstrap — `{stream}-STATE.json`

```json
{
  "version": "1.0",
  "kind": "state",
  "name": "{Stream} STATE",
  "stream": "{stream-name}",
  
  "_guideline": "This bootstrap changes CONTINUOUSLY. Update at start of every session. Keep current_app accurate. Add urgencies as they arise, remove when resolved.",
  
  "_health": {
    "last_updated": "2026-03-15T18:00:00Z",
    "updated_by": "kimprint-kimi",
    "update_frequency": "continuous",
    "next_review": "next_session",
    "confidence": 0.6,
    "staleness": "fresh",
    "warnings": [],
    "todos": []
  },
  
  "current_work": {
    "active_app": {
      "id": "APP-XXX",
      "title": "Current APP name",
      "status": "in_progress|complete|blocked",
      "when_to_update": "Update when APP completes, blocked, or superseded"
    },
    "in_flight": [
      {
        "id": "APP-XXX",
        "title": "APP name",
        "when_to_update": "Move to completed when done, add when new APP started"
      }
    ],
    "recently_completed": [
      {
        "id": "APP-YYY",
        "title": "Completed APP",
        "completed_at": "2026-03-10",
        "when_to_update": "Archive when no longer relevant (monthly cleanup)"
      }
    ]
  },
  
  "urgencies": [
    {
      "urgency": "Description of urgent matter",
      "source": "1NBOX/BUG-001.md",
      "priority": "high|medium|low",
      "when_to_update": "Remove when resolved, add new as found in 1NBOX"
    }
  ],
  
  "active_streams": [
    {
      "stream": "kimprint",
      "relationship": "waiting_for|blocked_by|collaborating_with",
      "what": "What we're waiting for",
      "when_to_update": "Update when relationship changes"
    }
  ],
  
  "essential_reads": [
    {
      "path": "1NBOX/APP-XXX.md",
      "why": "Current active work",
      "when_to_update": "Update when active_app changes"
    },
    {
      "path": "NEXTUP.md",
      "why": "Immediate priorities",
      "when_to_update": "Always read fresh (don't cache in bootstrap)"
    }
  ],
  
  "resonance_queries": [
    {
      "query": "APP-XXX current",
      "purpose": "Find latest on current work",
      "when_to_update": "Update when active_app changes"
    },
    {
      "query": "{stream} blocked",
      "purpose": "Find blockers and urgencies",
      "when_to_update": "Keep for ongoing blocker detection"
    }
  ]
}
```

---

## HEALTH CHECK SPECIFICATION

### What `gyre_resonance_bootstrap` Returns

```json
{
  "context": { "merged bootstrap content" },
  "stack": { "depth", "layers" },
  "gyre": { "results", "analysis" },
  
  "bootstrap_health": {
    "{stream}-ETHOS.json": {
      "kind": "ethos",
      "confidence": 0.95,
      "staleness": "fresh|aging|stale",
      "last_updated": "2026-03-15",
      "days_since_update": 0,
      "maintenance_guidance": "ETHOS: Rare updates. Change only when core philosophy shifts. Add principles when new ethical patterns emerge. Review quarterly.",
      "warnings": [],
      "todos": [],
      "observed_mismatches": []
    },
    "{stream}-STRUCTURE.json": {
      "kind": "structure",
      "confidence": 0.8,
      "staleness": "fresh",
      "last_updated": "2026-03-15",
      "days_since_update": 0,
      "maintenance_guidance": "STRUCTURE: Monthly review. Update when tech changes, dependencies added, or patterns refactored.",
      "warnings": [],
      "todos": [],
      "observed_mismatches": []
    },
    "{stream}-STATE.json": {
      "kind": "state",
      "confidence": 0.6,
      "staleness": "aging",
      "last_updated": "2026-03-12",
      "days_since_update": 3,
      "maintenance_guidance": "STATE: Update every session! Keep current_app accurate. Add urgencies as they arise, remove when resolved.",
      "warnings": [
        "current_app is 3 days old (APP-018)",
        "2 files in 1NBOX not listed in urgencies",
        "1 dependency not listed in active_streams"
      ],
      "todos": [
        "Verify current_app is still APP-018 or update to APP-020",
        "Review 1NBOX/ for new urgencies",
        "Check if 'foundframe' should be in active_streams"
      ],
      "observed_mismatches": [
        {
          "field": "current_work.active_app.id",
          "declared": "APP-018",
          "observed": "APP-020",
          "suggested_action": "Update to APP-020"
        }
      ]
    }
  }
}
```

### Health Detection Rules

```
DETERMINE_STALENESS(kind, days_since_update, warnings_count):
  IF kind == "ethos":
    IF days > 90: return "stale"
    IF days > 30: return "aging"
    return "fresh"
  
  IF kind == "structure":
    IF days > 30: return "stale"
    IF days > 7: return "aging"
    return "fresh"
  
  IF kind == "state":
    IF days > 3: return "stale"
    IF days > 0: return "aging"
    return "fresh"

DETECT_MISMATCHES(declared, observed):
  mismatches = []
  
  IF declared.current_app != observed.most_recent_app:
    mismatches.push({
      field: "current_app",
      declared: declared.current_app,
      observed: observed.most_recent_app,
      suggested_action: "Update to " + observed.most_recent_app
    })
  
  IF observed.recent_1nbox_files not in declared.urgencies:
    mismatches.push({
      field: "urgencies",
      note: "Recent 1NBOX files not listed",
      suggested_action: "Review and add new files"
    })
  
  RETURN mismatches
```

---

## THE CONTINUOUS IMPROVEMENT WORKFLOW

### At Session Start

```
1. CALL: gyre_resonance_bootstrap({cwd})
   → Returns: context + health report

2. REVIEW: bootstrap_health for each file
   → ETHOS: fresh? ✓ Skip
   → STRUCTURE: fresh? ✓ Skip  
   → STATE: aging? ⚠️ Note todos

3. READ: maintenance_guidance for STATE
   → "Update every session! Keep current_app accurate..."

4. WORK: With todos in mind
   → During work, notice APP-020 is indeed active
   → Note new urgency found in 1NBOX
```

### At Session End

```
5. CALL: bootstrap_forge({
     stream_name: "deardiary",
     kind: "state",
     content: {
       current_work: {
         active_app: { id: "APP-020", ... }
       },
       urgencies: [existing + new_urgency],
       _health: {
         last_updated: now(),
         update_reason: "APP-020 now active, new urgencies added"
       }
     }
   })
   → Writes: deardiary-STATE.json
   → Updates: _health metadata

6. NEXT SESSION:
   → STATE bootstrap now shows: fresh ✓, confidence: 0.9
```

---

## RELATED

```
RELATED: {
  predecessor: "circulari.ty/APP-019-bootstrap-forging (adapted from)",
  depends_on: [
    "APP-017-mechanical-bootstrap",
    "gyre_resonance_bootstrap tool"
  ],
  
  creates: [
    "bootstrap_forge MCP tool",
    "self-documenting bootstrap schema",
    "health checking system"
  ],
  
  targets: [
    "DearDiary bootstraps (first forge)",
    "foundframe bootstraps",
    "spire-loom bootstraps",
    "All stream bootstraps"
  ]
}
```

---

# WHAT HAS EMERGED

```
WHAT_HAS_EMERGED = [
  {
    timestamp: "2026-03-15T18:00:00+01:00",
    source: "app_cast",
    content: "APP-019 created from circulari.ty APP-019 adaptation",
    milestone: "Design complete - ready for implementation"
  },
  {
    timestamp: "2026-03-15T18:05:00+01:00",
    source: "step_1_complete",
    step: 1,
    name: "design_bootstrap_schema",
    content: "Created TypeScript types for self-documenting bootstraps",
    artifacts: [
      "src/bootstrap/schemas/types.ts - Complete type definitions",
      "docs/bootstrap-schema.md - Schema documentation"
    ],
    key_insights: [
      "Every bootstrap kind (ETHOS, STRUCTURE, STATE) has its own update frequency",
      "_guideline field tells you when/how to update",
      "_health field tracks freshness and confidence",
      "when_to_update on every field makes maintenance self-documenting"
    ],
    ready_for: "Step 2: Enhance gyre_resonance_bootstrap with health checking"
  }
]
```

---

> *"The forge makes the compass. The compass guides. The guide evolves. The evolution is guided."* 🌀🔧
