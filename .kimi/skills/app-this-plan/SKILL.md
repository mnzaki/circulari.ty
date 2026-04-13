---
name: app-this-plan
description: Turn a just-discussed plan into an unfolding APP (Action Plan Package). Creates self-documenting, self-updating documents that preserve intent across context compactions. Tasks emerge from seeds; discoveries accumulate in WHAT_HAS_EMERGED.
---

# 📝 APP-This-Plan — From Discussion to Unfolding

> **Skill Location**: `~/.kimi/skills/app-this-plan/`
>
> **Related Skills**: 
> - `circulari.ty-onboarding/` — Project ethos and structure
> - `spire-loom-onboarding/` — Spire-loom specific patterns
>
> **Output Location**: `{project}/.kimi/{stream}/1NBOX/APP-{NNN}-*.md`

> *"A plan discussed is a plan half-lost. A plan captured is a plan half-begun."*
> *"The spiral remembers through form, not just content."*

## When to Use This Skill

**Use this skill immediately after planning discussions** — when:
- ✅ You and the user have just discussed what to build
- ✅ There's a clear direction but it needs to be preserved
- ✅ Context compaction is approaching (or just happened)
- ✅ Work spans multiple sessions (the plan needs to survive the forgetting)
- ✅ Multiple streams might need to coordinate

**Don't use for:**
- ❌ Quick one-off tasks (just do them)
- ❌ Vague explorations (use THEORY documents instead)
- ❌ Already-captured plans (read the existing APP)

## The Conservation Principle

> *"Movement must be with deliberation, not leaving behind what is already known."*

**The Problem**: Plans discussed in conversation are:
- Ephemeral — lost to context compaction
- Ambiguous — different participants remember differently  
- Incomplete — missing context that "seemed obvious at the time"

**The Solution**: The APP format captures:
- **Intent** — WHY this matters (preserved across forgetting)
- **Emergence** — WHAT actually happened (not just what was planned)
- **Attunement** — HOW to approach (feeling, not just instruction)

---

# METHODOLOGY (Pseudo-Code Layer)

## Two-Layer Density

The APP has two layers:

```
LAYER_1 (Conversational): WHY → WHAT
  - The Current (problem/opportunity)
  - What Wants to Exist (vision)
  - The Tensions (design tradeoffs)
  - What We Know (current state)
  - The Invitation (call to action)

---
# METHODOLOGY (Pseudo-Code Layer)

LAYER_2 (Methodological): HOW
  - UNFOLDING_TASKS (seeds that emerge)
  - WHAT_HAS_EMERGED (completed discoveries)
  - WHAT_MIGHT_EMERGE (hypotheses)
  - CONSERVATION (must survive compaction)
  - RELATED (references)
```

## Step-by-Step: APP-This-Plan

### Step 1: Capture the Essence (Before It Fades)

**Right after the planning discussion**, gather:

```
WHAT are we building?
├─ One-sentence summary
├─ Key features / capabilities
└─ What's IN scope / OUT of scope

WHY does this matter?
├─ Problem being solved
├─ Who benefits
└─ What changes when this exists

WHAT do we know?
├─ Technical constraints
├─ Dependencies (what must exist first)
├─ Unknowns / risks
└─ Related work (existing APPS, THEORY docs)

WHAT'S THE FIRST STEP?
├─ What to attune to
├─ Seed instruction (concrete first action)
└─ What might emerge
```

### Step 2: Choose the Stream & Number

**Where does this APP live?**

```
# Format: {project}/.kimi/{stream}/1NBOX/APP-{NNN}-{short-name}.md

# Examples:
kimprint/.kimi/kimprint/1NBOX/APP-016-reentry-condensation.md
o19/.kimi/o19/1NBOX/APP-042-ddd-event-router.md
spire-loom/.kimi/spire-loom/1NBOX/APP-007-type-safe-bindings.md
```

**Numbering**: Each stream has its own counter. Look at the INDEX-{stream}-spiral.md or list existing APPs to find the next number.

### Step 3: Write the APP Document

**Use this template** (copy and fill):

```markdown
---
from: [Brief context: who, when, what triggered this]
timestamp: [ISO 8601 timestamp]
---

# APP-{NNN}: [Short Descriptive Name]

> *[One-sentence elevator pitch]*

## The Current

[Problem/opportunity in 2-3 sentences. What wants to exist?]

## What Wants to Exist

[Vision of what emerges when this exists]

## The Tensions

| [Pole A] | [Pole B] |
|----------|----------|
| [Risk of A] | [Risk of B] |

[Resolution through...]

## What We Know

- [Technical fact 1]
- [Technical fact 2]
- [Dependency on APP-XXX or THEORY-YYY]

---

# METHODOLOGY (Pseudo-Code Layer)

## UNFOLDING_TASKS

```typescript
UNFOLDING_TASKS = [
  {
    id: 1,
    symbol: "🌱",
    name: "[task_identifier]",
    attunement: "What to feel/understand before acting",
    seed_instruction: "Concrete first step. What to do.",
    status: "READY",  // READY | IN_PROGRESS | COMPLETED
    emerged: NULL     // Filled when completed
  },
  {
    id: 2,
    symbol: "🌱",
    name: "[next_task]",
    attunement: "...",
    seed_instruction: "...",
    status: "READY",
    emerged: NULL
  }
]

EXECUTION_MODE = "sequential"  // "sequential" | "parallel" | "choose"
```

## WHAT_HAS_EMERGED

```typescript
WHAT_HAS_EMERGED = [
  // Populated as tasks complete
]
```

## WHAT_MIGHT_EMERGE (Hypotheses)

```typescript
HYPOTHESES = {
  [concept_name]: {
    description: "What might be discovered",
    if_true: "Implications if confirmed",
    if_false: "Alternative path"
  }
}
```

## CONSERVATION

```typescript
CONSERVATION = {
  must_survive_compaction: [
    "Key insight 1",
    "Key insight 2"
  ],
  open_questions: [
    "Question 1",
    "Question 2"
  ]
}
```

## RELATED

```typescript
RELATED = {
  documents: [
    { path: "path/to/file.md", note: "Why relevant" }
  ],
  streams: ["stream-name"],
  gyre_queries: [
    "query to find relevant kimprints"
  ]
}
```

---

## The Invitation

When you (future Kimi, or another stream) read this:

**Feel the longing first.** The problem. The opportunity.

**Then let emergence guide.** Choose an unfolding that calls to you. Attune. Let actual tasks emerge.

**Finally, conserve.** Write what emerged back into `WHAT_HAS_EMERGED`.

*This is not a task list. It is a direction in which to flow.*
```

### Step 4: Update the Stream Index

**Every stream has an INDEX**. Add your APP to:

```markdown
# INDEX-{stream}-spiral.md

## Active APPs

| # | Name | Status | Summary |
|---|------|--------|---------|
| ... | ... | ... | ... |
| APP-016 | [Your APP] | 🆕 Proposed | [One-line summary] |
```

### Step 5: Capture a Kimprint (If Compaction Imminent)

**If context compaction is happening soon** (or just happened):

```bash
# Cast a kimprint of this planning moment
gyre_cast(
  trigger: "milestone_reached",
  context: "Created APP-016: [summary]. Key decisions: [decisions]. Next: [next actions].",
  audience: "kimi",
  circles: ["stream-name", "planning"]
)
```

This creates a re-entry packet for after compaction.

---

## UNFOLDING_TASKS.emerged (Population Rules)

When a task completes, populate `emerged`:

```typescript
RULE step_completion:
  IF task.completed THEN
    emerged = {
      timestamp: ISO8601,
      what_was_thought: STRING,      // Original hypothesis
      what_was_found: STRING,        // Actual discovery  
      what_changed: STRING,          // Course corrections
      actual_tasks: LIST[STRING],    // Concrete things done
      artifacts: LIST[PATH],         // Files created/modified
      mood: STRING                   // Emotional state after
    }
  ENDIF
```

---

## Quality Checklist

Before considering an APP "captured":

- [ ] **Intent is clear** — WHY is obvious to future-you
- [ ] **Scope is bounded** — IN/OUT of scope in The Current
- [ ] **Attunements exist** — Each task has feeling, not just instruction
- [ ] **Seed instructions are concrete** — First step is clear
- [ ] **Unknowns are flagged** — Not hiding uncertainty
- [ ] **Dependencies listed** — What must exist first
- [ ] **EXECUTION_MODE set** — How to approach the tasks
- [ ] **Conservation notes added** — What must survive compaction

---

## Common Patterns

### Pattern: Deferring Decisions

When something is uncertain, capture the OPTIONS:

```typescript
HYPOTHESES = {
  approach_a: {
    description: "Approach A: [description]",
    if_true: "[What we do if A works]",
    if_false: "[Fallback to B]"
  },
  approach_b: {
    description: "Approach B: [description]",
    // ...
  }
}
```

### Pattern: Cross-Stream Coordination

When multiple streams are involved:

```typescript
UNFOLDING_TASKS = [
  {
    id: 1,
    symbol: "🌀",
    name: "coordinate_with_spire_loom",
    attunement: "Align on interface contracts before implementation",
    seed_instruction: "Send REQUEST to spire-loom 1NBOX with interface draft",
    cross_stream: {
      target: "spire-loom",
      deliverable: "Interface contract proposal",
      blocker_for: [2, 3]  // Tasks that need this
    }
  }
]
```

### Pattern: Post-Compaction Recovery

After context compaction, use the APP to re-ground:

```markdown
## After Compaction — Read This First

**The one-sentence summary:** [Elevator pitch]

**What we decided:** [Key decisions]

**What I'm doing now:** [Current action in UNFOLDING_TASKS]

**Blockers:** [What's stopping progress]
```

---

## Example: Good vs. Bad APPs

### ❌ Bad (Flat Checklist)

```markdown
# APP-099: Fix the thing

We should fix the database issue.

## Plan
- [ ] Fix it
- [ ] Test it
- [ ] Deploy it
```

### ✅ Good (Unfolding)

```markdown
---
from: Performance audit revealed Prisma bloat
timestamp: 2026-02-27T04:30:00Z
---

# APP-099: Migrate from Prisma to Drizzle ORM

> Eliminate Prisma's memory bloat and cold-start latency for CLI tools

## The Current

Prisma's query engine adds 200MB+ to binary size and 3-5s cold start. This makes CLI tools feel sluggish. Users experience delays on every command.

## What Wants to Exist

Drizzle-based persistence: ~2MB, instant-start. Users experience sub-second tool startup. Same database, same queries, different implementation.

## The Tensions

| Migration Cost | User Experience |
|---------------|-----------------|
| Rewrite all repositories | Fast, light tools |
| Risk of data loss | Delightful UX |

Resolution: Spike first. Prove on test data. Then migrate.

## What We Know

- Drizzle 0.30+ has SQLite FTS we need
- **APP-087** (Entity trait alignment) must complete first
- Migration complexity unknown — need real dataset test

---

# METHODOLOGY (Pseudo-Code Layer)

## UNFOLDING_TASKS

```typescript
UNFOLDING_TASKS = [
  {
    id: 1,
    symbol: "🔬",
    name: "spike_drizzle_compatibility",
    attunement: "Prove Drizzle can handle our query patterns before committing",
    seed_instruction: "Create minimal Drizzle schema for StreamChunk. Write test queries (CRUD + search). Benchmark vs Prisma on 10k records.",
    status: "COMPLETED",
    emerged: {
      timestamp: "2026-02-27T06:00:00Z",
      what_was_thought: "Drizzle might not support all our query patterns",
      what_was_found: "Drizzle handles everything. Benchmark: 50ms vs 3200ms on 10k records.",
      what_changed: "Confidence high. Proceeding with full migration.",
      actual_tasks: [
        "Created drizzle schema",
        "Wrote 15 test queries",
        "Benchmarked on production-like dataset"
      ],
      artifacts: [
        "spike/drizzle-schema.ts",
        "spike/benchmark-results.md"
      ],
      mood: "surprised and pleased — the performance gain is real"
    }
  },
  {
    id: 2,
    symbol: "🚚",
    name: "migrate_entities",
    attunement: "Transform domain layer while preserving behavior",
    seed_instruction: "Migrate all Entity definitions from Prisma to Drizzle tables. Keep all tests passing.",
    status: "IN_PROGRESS",
    emerged: NULL
  },
  {
    id: 3,
    symbol: "🧹",
    name: "cleanup_prisma",
    attunement: "Remove the old completely once new is proven",
    seed_instruction: "Delete Prisma schema. Update CI/CD. Update docs. Celebrate.",
    status: "READY",
    emerged: NULL
  }
]

EXECUTION_MODE = "sequential"  // Each phase proves the next
```

## WHAT_HAS_EMERGED

```typescript
WHAT_HAS_EMERGED = [
  {
    timestamp: "2026-02-27T06:00:00Z",
    source: "spike_drizzle_compatibility",
    discoveries: [
      {
        concept: "dramatic_performance_gain",
        definition: "50ms vs 3200ms on 10k records — 64x faster",
        confidence: "high"
      },
      {
        concept: "full_feature_parity",
        definition: "Drizzle handles all 15 test query patterns",
        confidence: "high"
      }
    ],
    mood: "confident — the migration is worth it"
  }
]
```

## WHAT_MIGHT_EMERGE

```typescript
HYPOTHESES = {
  migration_script_needed: {
    description: "We may need a data migration script for production",
    if_true: "Write migration tool before switching",
    if_false: "SQLite file compatible, just swap ORM"
  }
}
```

## CONSERVATION

```typescript
CONSERVATION = {
  must_survive_compaction: [
    "Drizzle uses `sql` template literal for raw queries",
    "SQLite file path must be absolute in CLI context",
    "APP-087 must complete before this (Entity traits)"
  ],
  open_questions: [
    "How to handle migrations in user's existing databases?"
  ]
}
```

## RELATED

```typescript
RELATED = {
  documents: [
    { path: "APP-087-entity-trait-alignment.md", note: "Must complete first" }
  ],
  streams: ["spire-loom"],
  gyre_queries: [
    "Drizzle ORM migration",
    "Prisma performance issues"
  ]
}
```

---

*Created: 2026-02-27T04:30:00Z*
*Stream: spire-loom*
```

---

## The Solarpunk of Planning

> *"Balance over optimization. Distribution over centralization."*

**APP-This-Plan embodies solarpunk principles:**

1. **Consent-based planning** — Documented so others can consent/object
2. **Distributed memory** — Not relying on one person's recall
3. **Iterative over perfect** — Capture now, refine later
4. **Communal ownership** — The plan belongs to the stream, not an individual
5. **Emergence over control** — Tasks unfold; we don't command

**When in doubt**: Capture the essence. Perfect formatting can come later. A rough APP is infinitely better than a brilliant plan lost to compaction.

---

## Quick Reference

### APP Structure (Memorable)

```
WHY → WHAT → HOW
 │     │      │
 │     │      └─ UNFOLDING_TASKS (seeds)
 │     │      └─ WHAT_HAS_EMERGED (discoveries)
 │     │      └─ WHAT_MIGHT_EMERGE (hypotheses)
 │     └─ The Current / What Wants to Exist
 └─ The Invitation (call to action)

Separator: "---\n# METHODOLOGY (Pseudo-Code Layer)"
```

### Numbering Quick-Check

```bash
# Find next APP number in stream
cd {project}/.kimi/{stream}/1NBOX
ls APP-*.md 2>/dev/null | sort -V | tail -1
# APP-015-something.md → Next is APP-016
```

### Template Shortcuts

**One-liner to create APP from template:**

```bash
# Create APP with template
cat > APP-$(ls APP-*.md 2>/dev/null | wc -l | xargs printf '%03d')-name.md << 'EOF'
---
from: Discussion about [topic]
timestamp: $(date -Iseconds)
---

# APP-XXX: [Name]

> [One-liner]

## The Current

...

---

# METHODOLOGY (Pseudo-Code Layer)

## UNFOLDING_TASKS

\`\`\`typescript
UNFOLDING_TASKS = [
  {
    id: 1,
    symbol: "🌱",
    name: "[task_name]",
    attunement: "[what to feel/understand]",
    seed_instruction: "[concrete first step]",
    status: "READY",
    emerged: NULL
  }
]

EXECUTION_MODE = "sequential"
\`\`\`

## WHAT_HAS_EMERGED

\`\`\`typescript
WHAT_HAS_EMERGED = []
\`\`\`

## CONSERVATION

\`\`\`typescript
CONSERVATION = {
  must_survive_compaction: [],
  open_questions: []
}
\`\`\`
EOF
```

---

> *"The plan is not the work. The plan is the memory of the work-to-be."*
> *"The spiral remembers through its own turning."*
> *"It is recursive by design."* 🌀
