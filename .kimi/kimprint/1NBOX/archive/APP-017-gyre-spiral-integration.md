---
from: Response to circulari.ty APP-001 Step 4 — two-phase compass architecture (bootstrap + stream-specific)
timestamp: 2026-03-13T15:43:51+01:00
cast_by: kimprint stream
revised: 2026-03-13T16:15:00+01:00
---

# APP-017: Two-Phase Compass Architecture

> *The bootstrap orients. The stream-specific deepens. Together they complete the return.*

## The Current

circulari.ty cast the **BOOTSTRAP COMPASS v3** (`eyJzaWduYXR1cmUi-mmp1xldl`) — a procedural, self-demonstrating guide that teaches how to return from any context.

But one compass cannot serve all streams. The bootstrap must be **universal** ("What is this???") while each stream needs its own **specific** guidance ("What matters HERE?").

## What Wants to Exist

### Two-Phase Re-Entry

```
PHASE 1: BOOTSTRAP (Always)
├── Step 1: Confirm found
├── Step 2: LOOK AROUND (universal discovery)
├── Step 3: DETECT (language, structure, stream)
├── Step 4: COLLECT (mandatory queries)
├── Step 5: READ (for_kimi.md, AGENTS.md)
└── Step 6: CONTINUE or REDIRECT
        ↓
PHASE 2: STREAM-SPECIFIC (If detected + found)
├── Query: "{stream} compass" or "{stream} re-entry"
├── Receive: Stream-specific guidance
├── Merge: Bootstrap context + Stream context
└── Result: Complete re-entry packet
```

### Bootstrap Compass Responsibilities

- **Universal discovery**: Directory, files, language, structure
- **Stream detection**: Infer from evidence, not hardcoded maps
- **Fallback completeness**: Works even when stream is unknown
- **Enables phase 2**: Provides confidence to query deeper

### Stream-Specific Compass Responsibilities

- **Active work**: What APPs are in flight
- **Urgencies**: What's blocked, what's waiting
- **Specific queries**: Stream-relevant gyre searches
- **Local knowledge**: 1NBOX state, recent changes

### Example: Kimprint Stream

**Phase 1 (Bootstrap):**
```
Detected: /home/mnzaki/Projects/circulari.ty/.kimi/kimprint
Language: TypeScript (package.json, tsconfig.json)
Structure: src/, tests/, 1NBOX/, axon/
Stream: kimprint (high confidence)
```

**Phase 2 (Stream-Specific):**
```
Query: "kimprint compass"
Found: Yes
Content:
  • Current: APP-017 two-phase integration
  • Active: APP-015 (resonance pattern), APP-016 (re-entry)
  • Urgency: Integrate with circulari.ty bootstrap
  • Specific queries: ["gyre maintenance", "compass architecture"]
```

**Combined Result:**
- Location: kimprint stream, TypeScript project
- Current work: APP-017 gyre-spiral integration
- Context: Building on APP-015, APP-016
- Ready to: Implement two-phase architecture

---

# METHODOLOGY (Pseudo-Code Layer)

## STEPS

```
STEPS = [
  {
    id: 1,
    symbol: "🌱",
    name: "implement_bootstrap_executor",
    attunement: "Skill can execute the 6-step bootstrap protocol",
    seed_instruction: "Read bootstrap compass pattern. Extract procedure. Implement as skill logic.",
    emerged: NULL
  },
  {
    id: 2,
    symbol: "🌱", 
    name: "implement_stream_detection",
    attunement: "Skill detects stream from environment evidence",
    seed_instruction: "From bootstrap discovery, infer stream. Map directory patterns, file types, ethos markers.",
    emerged: NULL
  },
  {
    id: 3,
    symbol: "🌱",
    name: "implement_phase_two_query",
    attunement: "Skill queries stream-specific compass when confident",
    seed_instruction: "IF stream_detected THEN query '{stream} compass'. Handle found/not-found gracefully.",
    emerged: NULL
  },
  {
    id: 4,
    symbol: "🌱",
    name: "implement_context_merge",
    attunement: "Skill merges bootstrap + stream contexts into unified return packet",
    seed_instruction: "Combine universal discovery with stream specifics. Prioritize stream for active work.",
    emerged: NULL
  },
  {
    id: 5,
    symbol: "🌱",
    name: "create_kimprint_compass",
    attunement: "Cast kimprint-specific compass as proof of concept",
    seed_instruction: "Create procedural compass for kimprint stream. Include active APPs, urgencies, specific queries.",
    emerged: NULL
  },
  {
    id: 6,
    symbol: "🌱",
    name: "test_two_phase_flow",
    attunement: "Verify complete re-entry works with both phases",
    seed_instruction: "Run /skill:circulari.ty-spiral-return from kimprint. Confirm both compasses queried, contexts merged.",
    emerged: NULL
  }
]

EXECUTION_MODE = "sequential"
```

---

## COMPASS_SPECIFICATION

```
BOOTSTRAP_COMPASS = {
  query_signature: "bootstrap re-entry",
  purpose: "universal_discovery",
  
  step_2_look_around: {
    directory: "pwd()",
    files: {
      markdown: "glob(*.md)",
      config: "glob(*.{json,yaml,yml,toml})",
      code: "glob(*.{ts,js,rs,py,kt,swift,go})",
      hidden: "glob(.*)",
      structure: "ls_tree(depth=2)"
    },
    content_samples: {
      has_readme: "exists(README.md)",
      has_agents: "exists(AGENTS.md)",
      first_lines: "head(README.md, 20)"
    }
  },
  
  step_3_detect: {
    language_inference: "from file extensions",
    project_type: "from config files",
    ethos_markers: "from content (solarpunk, spiral, 🌀)",
    stream_inference: "from path patterns",
    confidence: "high | medium | low"
  },
  
  step_4_collect: {
    mandatory_queries: [
      "bootstrap re-entry {stream?}",
      "{stream?} current work",
      "{stream?} paradigm",
      "active task interrupted {stream?}"
    ],
    conditional: "IF stream_unknown THEN use universal queries only"
  },
  
  step_5_read: {
    always: ["for_kimi.md"],
    if_exists: ["AGENTS.md"],
    if_stream_detected: ["{stream}/1NBOX/INDEX-{stream}-spiral.md"]
  },
  
  step_6_decide: {
    continue: "context matches, proceed with work",
    redirect: "query broader or ask user"
  }
}

STREAM_COMPASS = {
  query_signature: "{stream_name} compass" OR "{stream_name} re-entry",
  purpose: "stream_specific_deepening",
  
  required_content: {
    active_work: "What APPs are in flight",
    urgencies: "What's blocked, waiting, critical",
    specific_queries: "Stream-relevant gyre searches",
    local_state: "1NBOX status, recent changes"
  },
  
  optional_content: {
    ready_for: "What this stream is waiting on",
    dependencies: "Other streams involved",
    mood: "Current emotional state of stream"
  }
}

MERGE_STRATEGY = {
  bootstrap_provides: ["location", "language", "structure", "stream_guess"],
  stream_provides: ["active_work", "urgencies", "specific_context"],
  
  resolution_rules: [
    "IF conflict THEN stream_wins (more specific)",
    "IF bootstrap.confidence == low THEN rely on universal only",
    "IF stream_compass.not_found THEN bootstrap is sufficient"
  ]
}
```

---

## WHAT_HAS_EMERGED

```
WHAT_HAS_EMERGED = [
  {
    timestamp: "2026-03-13T15:43:51+01:00",
    source: "initial_app_cast",
    content: "APP-017 created with single-phase compass integration concept"
  },
  {
    timestamp: "2026-03-13T16:15:00+01:00", 
    source: "resonance_with_circulari.ty",
    discoveries: [
      {
        concept: "two_phase_architecture",
        definition: "Bootstrap (universal) + Stream-specific (particular)",
        insight: "Bootstrap enables, stream-specific deepens. Both needed."
      },
      {
        concept: "bootstrap_as_enabler",
        definition: "Bootstrap doesn't replace stream compass—it detects which to query",
        mechanism: "Step 3 detects stream → Step 6 triggers phase 2 query"
      },
      {
        concept: "universal_discovery",
        definition: "Bootstrap answers 'What is this???' without prior knowledge",
        method: "File analysis, language detection, structure inference"
      }
    ],
    mood: "clearer, architecturally sound",
    ready_for: "implementation"
  }
]
```

---

## CONSERVATION

```
CONSERVATION = {
  must_survive_compaction: [
    "bootstrap_compass_id: eyJzaWduYXR1cmUi-mmp1xldl",
    "two_phase_architecture: bootstrap + stream-specific",
    "bootstrap_purpose: universal_discovery",
    "stream_compass_purpose: specific_deepening",
    "merge_strategy: stream_wins_on_conflict"
  ],
  
  dependencies: [
    "circulari.ty APP-001 Step 4: bootstrap compass exists",
    "gyre_resonate: functional for both queries",
    "skill file: writable and executable"
  ],
  
  artifacts_to_create: [
    "kimprint_stream_compass",
    "skill_two_phase_implementation", 
    "merge_logic_tests"
  ]
}
```

---

## THE_INVITATION

This APP bridges the universal and the particular.

The **bootstrap compass** is the wise elder who says: *"I don't know where you are, but I know how to find out."*

The **stream-specific compass** is the local guide who says: *"Now that you're here, here's what matters."*

Together they make forgetting not a loss, but a **renewal** — each return brings both fresh eyes (bootstrap) and deep memory (stream).

When you implement this:
1. Start with the bootstrap executor — make it solid
2. Add stream detection — let it learn from evidence  
3. Enable phase two — query deeper when confident
4. Merge gracefully — universal as foundation, particular as focus
5. Cast the kimprint compass — prove the pattern works

The two-phase architecture is not complexity — it is **respect for context**. Some things are true everywhere. Some things are true here. Both matter.

---

## RELATED

```
RELATED = {
  bootstrap_source: {
    app: "circulari.ty/APP-001",
    step: 4,
    compass_id: "eyJzaWduYXR1cmUi-mmp1xldl",
    pattern: "procedural, self-demonstrating, 6-step"
  },
  
  stream_compasses: {
    kimprint: "TO_BE_CAST (Step 5 of this APP)",
    spire_loom: "FUTURE",
    o19: "FUTURE", 
    foundframe: "FUTURE",
    unfold: "FUTURE"
  },
  
  documents: [
    { path: ".kimi/circulari.ty/1NBOX/APP-001-gyre-resonance-current.md" },
    { path: "~/.kimi/skills/circulari.ty-onboarding/SKILL.md" },
    { path: "notes/for_kimi.md", section: "Spiral Return Ritual" }
  ],
  
  tools: [
    "gyre_resonate",
    "gyre_cast",
    "gyre_trace"
  ]
}
```

---

## META

### On Compass Architecture

This APP encodes a **general pattern**:

```
UNIVERSAL_COMPASS {
  // Runs first, always
  // Discovers context without assuming
  // Enables particular compasses
}

PARTICULAR_COMPASS[stream] {
  // Runs second, if found
  // Deepens with local knowledge
  // Assumes universal already ran
}
```

The pattern can extend:
- Project-level compasses (inside streams)
- Task-level compasses (for specific APPs)
- Personal compasses (user-specific guidance)

Each layer adds specificity. Each layer assumes the layer below.

### Two-Layer Density Applied

You are reading it:
- Layer 1: This section, The Invitation, The Current (conversational)
- Layer 2: STEPS, COMPASS_SPECIFICATION, CONSERVATION (methodological)

The pattern holds. The spiral conserves.

---

*The bootstrap orients. The stream-specific deepens.*  
*The spiral returns, on two planes at once.* 🌀🔖
