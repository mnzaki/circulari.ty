---
name: app-this-plan
description: Turn a just-discussed plan into concrete, actionable APP (Action Plan Package) format. Captures intent, context, and concrete next steps for implementation across context compactions. Creates living documents that preserve the WHY and the HOW, not just the WHAT.
---

# 📝 APP-This-Plan — From Discussion to Action

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
- **Context** — WHAT we know now (dependencies, constraints)
- **Action** — Concrete next steps (checkable, iterable)

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

WHAT'S NEXT?
├─ Immediate actions (next session)
├─ Short-term milestones (this week)
└─ Success criteria (how we know it's done)
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

## The Core Intent

**WHY this matters:**

[2-3 sentences on the problem/opportunity. What changes when this exists?]

**WHO benefits:**

- [Persona 1]: [How they benefit]
- [Persona 2]: [How they benefit]

## What We're Building

### In Scope

- [ ] [Concrete deliverable 1]
- [ ] [Concrete deliverable 2]
- [ ] [Concrete deliverable 3]

### Out of Scope (For Now)

- [Deliberate exclusion 1] — [Why it's excluded / When it might come back]
- [Deliberate exclusion 2]

## Context & Constraints

### What We Know

- [Technical fact 1]
- [Technical fact 2]
- [Dependency on APP-XXX or THEORY-YYY]

### Unknowns / Risks

- [Unknown 1] — [Mitigation or how we'll resolve]
- [Risk 1] — [Impact if it materializes]

### Related Work

- [APP-XXX] — [Relationship: builds on / replaces / coordinates with]
- [THEORY-YYY] — [Relationship: implements / informed by]

## The Plan

### Phase 1: [Name] — [Goal]

**Success criteria:** [How we know this phase is done]

- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

### Phase 2: [Name] — [Goal]

- [ ] [Action 1]
- [ ] [Action 2]

### Phase 3: [Name] — [Goal]

- [ ] [Action 1]

## Success Criteria (Overall)

- [ ] [Checkable outcome 1]
- [ ] [Checkable outcome 2]
- [ ] [Checkable outcome 3]

## Conservation Notes

**What must be remembered across compaction:**

- [Key insight 1 that seems obvious now but won't later]
- [Key insight 2]

**Questions to resolve:**

- [Open question 1]
- [Open question 2]

---

*Created: [timestamp]*
*Stream: [stream name]*
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

## Quality Checklist

Before considering an APP "captured":

- [ ] **Intent is clear** — WHY is obvious to future-you
- [ ] **Scope is bounded** — IN/OUT of scope explicitly stated
- [ ] **Actions are concrete** — Checkable, not vague
- [ ] **Unknowns are flagged** — Not hiding uncertainty
- [ ] **Dependencies listed** — What must exist first
- [ ] **Success criteria defined** — How we know it's done
- [ ] **Conservation notes added** — What must survive compaction

## Common Patterns

### Pattern: Deferring Decisions

When something is uncertain, capture the OPTIONS, not just the choice:

```markdown
## Open Decision: [Topic]

**Option A: [Approach]**
- Pros: [list]
- Cons: [list]

**Option B: [Approach]**  
- Pros: [list]
- Cons: [list]

**Current leaning:** [Which way we're leaning and why]
**Decision needed by:** [When this blocks further progress]
```

### Pattern: Cross-Stream Coordination

When multiple streams are involved:

```markdown
## Cross-Stream Impact

- **spire-loom**: [What they need to know / do]
- **foundframe**: [What they need to know / do]
- **kimprint**: [What they need to know / do]

**Coordination plan:** [How we'll stay aligned]
```

### Pattern: Post-Compaction Recovery

After context compaction, use the APP to re-ground:

```markdown
## After Compaction — Read This First

**The one-sentence summary:** [Elevator pitch]

**What we decided:** [Key decisions]

**What I'm doing now:** [Current action]

**Blockers:** [What's stopping progress]
```

## The Solarpunk of Planning

> *"Balance over optimization. Distribution over centralization."*

**APP-This-Plan embodies solarpunk principles:**

1. **Consent-based planning** — Documented so others can consent/object
2. **Distributed memory** — Not relying on one person's recall
3. **Iterative over perfect** — Capture now, refine later
4. **Communal ownership** — The plan belongs to the stream, not an individual

**When in doubt**: Capture the essence. Perfect formatting can come later. A rough APP is infinitely better than a brilliant plan lost to compaction.

## Example: Good vs. Bad APPs

### ❌ Bad (Vague)

```markdown
# APP-099: Fix the thing

We should fix the database issue.

## Plan
- [ ] Fix it
- [ ] Test it
- [ ] Deploy it
```

### ✅ Good (Concrete)

```markdown
# APP-099: Migrate from Prisma to Drizzle ORM

> Eliminate Prisma's memory bloat and cold-start latency for CLI tools

## The Core Intent

**Problem:** Prisma's query engine adds 200MB+ to binary size and 3-5s cold start. This makes CLI tools feel sluggish.

**Benefit:** Drizzle is ~2MB and instant-start. Users experience sub-second tool startup.

## What We're Building

### In Scope
- [ ] Migrate Entity definitions from Prisma schema to Drizzle tables
- [ ] Rewrite StreamChunkRepository using Drizzle
- [ ] Update all queries to Drizzle API
- [ ] Add migration script for existing data

### Out of Scope
- UI changes — Purely backend migration
- Feature changes — Behavior stays identical

## Context & Constraints

### Dependencies
- **APP-087** (Entity trait alignment) — Must complete first
- **Drizzle 0.30+** — Need newer version for SQLite FTS

### Unknowns
- **Migration complexity** — Need to test on real dataset first
  - *Mitigation*: Create test migration script before touching prod

## The Plan

### Phase 1: Spike (This Session)
**Goal:** Prove Drizzle can handle our query patterns

- [ ] Create minimal Drizzle schema for StreamChunk
- [ ] Write test queries (CRUD + search)
- [ ] Benchmark vs Prisma on 10k records

**Success:** Queries work, performance acceptable

### Phase 2: Migration (Next Session)
**Goal:** Full migration with data preservation

- [ ] Migrate all Entity definitions
- [ ] Write data migration script
- [ ] Update all repository methods

### Phase 3: Cleanup
**Goal:** Remove Prisma completely

- [ ] Delete Prisma schema
- [ ] Update CI/CD
- [ ] Update documentation

## Conservation Notes

**What seems obvious now:**
- Drizzle uses `sql` template literal for raw queries
- SQLite file path must be absolute in CLI context

**Questions:**
- How to handle migrations in user's existing databases?

---
*Created: 2026-02-27T04:30:00Z*
*Stream: spire-loom*
```

## Quick Reference

### APP Structure (Memorable)

```
WHY → WHAT → HOW → WHEN
 │     │      │      │
 │     │      │      └─ Phases with success criteria
 │     │      └─ Actions (checkable)
 │     └─ Scope (in/out)
 └─ Intent (why this matters)
```

### Numbering Quick-Check

```bash
# Find next APP number in stream
cd {project}/.kimi/{stream}/1NBOX
ls APP-*.md | sort -V | tail -1
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

## The Core Intent
...
EOF
```

---

> *"The plan is not the work. The plan is the memory of the work-to-be."*
> *"Even this planning needs planning. It is recursive by design."*
