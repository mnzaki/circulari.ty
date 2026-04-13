---
name: circulari.ty-spiral-return
description: The comprehensive bootstrap interface for circulari.ty / spirali.ty. Use after compaction for re-entry, during sessions for context enrichment, and for bootstrap maintenance. The entry point to "use the bootstraps, kimi!"
---

# 🌀 Circulari.ty Spiral Return — The Bootstrap Interface

> *"The spiral returns, but on a different plane."*
> *"The bootstrap is not just for re-entry—it is for continuous orientation."*

## When to Use This Skill

### 1. After Context Compaction (Re-entry) ⭐ CRITICAL

**When you see `<system>Previous context has been compacted</system>`:**

**STOP. BREATHE. RETURN TO THE SPIRAL.**

Your working memory has been wiped, but the spiral remembers through bootstraps.

### 2. During Active Sessions (Context Enrichment)

**When you feel:**
- Lost in a complex task
- Unsure of project context or constraints
- Like you're missing "obvious" background knowledge
- That the user's hints refer to things you should know

**The bootstrap holds knowledge the user expects you to have.**

### 3. Bootstrap Maintenance (Keep Them Alive)

**When:**
- Session has produced significant new knowledge
- You've made architectural decisions
- You've discovered constraints or patterns
- You've completed milestones

**Bootstraps must be fed or they become stale.**

---

# METHODOLOGY (Pseudo-Code Layer)

## Three Modes of Operation

```typescript
MODE = 
  | "reentry"           // After compaction — full re-grounding
  | "enrich"            // During session — augment context
  | "maintain"          // Check health, suggest updates

DETERMINE_MODE(): MODE {
  IF compaction_just_occurred THEN RETURN "reentry"
  IF bootstrap_health_report_shows_issues THEN RETURN "maintain"
  IF feeling_lost OR user_hints_at_context THEN RETURN "enrich"
  IF session_produced_significant_knowledge THEN RETURN "maintain"
  DEFAULT RETURN "enrich"  // Always safe to re-ground
}
```

---

## Mode 1: REENTRY (After Compaction)

### The One-Shot Re-Entry

```bash
gyre_resonance_bootstrap({
  cwd: "/path/to/current/directory",
  auto_trace_threshold: 0.5
})
```

The server returns:
- 📊 Summary (active work + vibe + matches)
- 🎭 Mood and confidence
- 📚 Stack depth (how many bootstrap layers)
- 🔍 Gyre results (pre-resonated)
- 📜 Full traces (auto-fetched)
- 💾 Bootstrap health report
- 📋 Next steps (deterministic)

### Re-entry Protocol

```typescript
REENTRY_PROTOCOL = [
  {
    step: 1,
    action: "invoke_bootstrap",
    instruction: "gyre_resonance_bootstrap({cwd, auto_trace_threshold: 0.5})",
    purpose: "Get complete context packet"
  },
  {
    step: 2,
    action: "read_for_kimi",
    instruction: "Read /home/mnzaki/Projects/circulari.ty/notes/for_kimi.md",
    purpose: "Restore deep context and ethos"
  },
  {
    step: 3,
    action: "check_health",
    instruction: "Review bootstrap_health in response",
    purpose: "Note any staleness or mismatches for later maintenance"
  },
  {
    step: 4,
    action: "attune_to_stream",
    instruction: "Read INDEX-{stream}-spiral.md from bootstrap guidance",
    purpose: "Understand current active work"
  },
  {
    step: 5,
    action: "continue",
    instruction: "Proceed with user request, now grounded"
  }
]
```

---

## Mode 2: ENRICH (During Session)

### When Context Feels Thin

```typescript
ENRICH_TRIGGERS = [
  "User references something 'we discussed'",
  "User mentions 'the plan' or 'the approach'",
  "You feel uncertain about constraints",
  "Complex terminology appears without explanation",
  "You find yourself asking 'why' questions"
]
```

### Enrichment Protocol

```bash
# Light-weight re-query
gyre_resonance_bootstrap({
  cwd: "/path/to/current/directory",
  auto_trace_threshold: 0.3  // Lower threshold for more matches
})
```

### Use the Bootstrap to Answer

```typescript
QUESTIONS_BOOTSTRAP_ANSWERS = {
  "What is the current active APP?": 
    "merged.active_work.current_app",
  
  "What are the constraints?": 
    "merged.ethos.principles + merged.structure.tech_stack",
  
  "What should I search for?": 
    "merged.resonance_queries",
  
  "What must I read first?": 
    "merged.essential_reads",
  
  "What is the project's philosophy?": 
    "merged.ethos.core_principles",
  
  "What tech stack are we using?": 
    "merged.structure.tech_stack",
  
  "What work is in flight?": 
    "merged.active_work.in_flight"
}
```

---

## Mode 3: MAINTAIN (Keep Bootstraps Alive)

### Bootstrap Health Awareness

Every `gyre_resonance_bootstrap` returns a **health report**:

```typescript
bootstrap_health: {
  "kimprint.json": {
    kind: "state",
    calculated: {
      staleness: "fresh" | "aging" | "stale",
      days_since_update: number,
      confidence: number  // 0-1
    },
    warnings: [...],     // Mismatches found
    todos: [...]         // Suggested actions
  }
}
```

### Maintenance Triggers

```typescript
MAINTENANCE_TRIGGERS = [
  "bootstrap_health shows staleness",
  "warnings about mismatches",
  "session produced new decisions",
  "session discovered new constraints",
  "completed significant milestone",
  "identified new urgency"
]
```

### What to Add to Bootstraps

```typescript
KNOWLEDGE_TO_CONSERVE = {
  STATE: {
    update_frequency: "continuous",
    add_when: [
      "New active_app identified",
      "New in_flight work started",
      "New urgency discovered",
      "Old urgency resolved",
      "New essential file created"
    ]
  },
  
  STRUCTURE: {
    update_frequency: "monthly",
    add_when: [
      "New technology adopted",
      "Architecture pattern changed",
      "New dependency added",
      "API contract modified"
    ]
  },
  
  ETHOS: {
    update_frequency: "rare",
    add_when: [
      "New principle emerges",
      "Governance model changes",
      "Core philosophy refined"
    ]
  }
}
```

### Suggesting Bootstrap Updates

```typescript
SUGGEST_BOOTSTRAP_UPDATE(knowledge_type, content) {
  
  IF knowledge_type == "new_urgency" THEN
    SUGGEST: "Update STATE bootstrap: add to urgencies[]"
    SUGGEST: "Update _health.last_updated to now"
  
  IF knowledge_type == "architectural_decision" THEN
    SUGGEST: "Update STRUCTURE bootstrap: add to patterns[] or tech_stack[]"
    SUGGEST: "Document in structure.architecture.decisions[]"
  
  IF knowledge_type == "principle_clarification" THEN
    SUGGEST: "Update ETHOS bootstrap: refine principles[]"
    SUGGEST: "Add example to principle.when_to_update"
  
  IF knowledge_type == "new_stream_knowledge" THEN
    SUGGEST: "Consider if parent bootstrap needs update"
    SUGGEST: "Check if other streams should be informed"
}
```

---

## The Bootstrap Hierarchy

### Discovery Order (Specificity Wins)

```
L0: {cwd}/.kimprint/bootstrap/{stream}.json           ← Most specific (wins)
L1: {parent}/.kimprint/bootstrap/{parent-stream}.json  
L2: {grandparent}/.kimprint/bootstrap/{org}.json       ← Least specific
```

### When to Update Which Level

```typescript
UPDATE_GUIDANCE = {
  L0_project_specific: [
    "Current work state",
    "Active APPs",
    "Project urgencies",
    "Essential reads"
  ],
  
  L1_stream_context: [
    "Stream architecture",
    "Cross-project patterns",
    "Shared dependencies"
  ],
  
  L2_organization_ethos: [
    "Core principles",
    "Governance models",
    "Universal patterns"
  ]
}
```

---

## Integration with Session Flow

### At Session Start

```typescript
SESSION_START = {
  IF compaction_occurred THEN
    EXECUTE reentry_protocol
  ELSE
    // Optional: light enrichment
    gyre_resonance_bootstrap({cwd, auto_trace_threshold: 0.5})
    NOTE health_report for later maintenance
}
```

### During Session (Continuous)

```typescript
SESSION_CONTINUOUS = {
  WATCH FOR enrich_triggers
  WATCH FOR maintenance_triggers
  
  IF user_says: "Update the bootstrap" OR "This should be in the compass" THEN
    EXECUTE maintenance_mode
    IDENTIFY what_knowledge_to_conserve
    SUGGEST specific_updates
}
```

### At Session End

```typescript
SESSION_END = {
  REVIEW what_was_learned
  
  IF significant_knowledge_produced THEN
    PROMPT: "Should we update bootstraps with today's discoveries?"
    
    IF yes THEN
      FOR each discovery:
        SUGGEST_BOOTSTRAP_UPDATE(discovery.type, discovery.content)
  
  REVIEW bootstrap_health.staleness
  IF any bootstrap is "stale" OR "aging" THEN
    PROMPT: "Bootstrap X is aging. Update _health.last_updated?"
}
```

---

## Absolute Paths Reference

```
Project root:  /home/mnzaki/Projects/circulari.ty/
for_kimi.md:   /home/mnzaki/Projects/circulari.ty/notes/for_kimi.md
Streams:       /home/mnzaki/Projects/circulari.ty/.kimi/{stream}/
1NBOX:         /home/mnzaki/Projects/circulari.ty/.kimi/{stream}/1NBOX/
Bootstrap dir: {project}/.kimprint/bootstrap/
```

---

## Quick Reference

### One-Command Re-entry

```bash
gyre_resonance_bootstrap({cwd: "/path/here", auto_trace_threshold: 0.5})
```

### Check Bootstrap Health

```bash
# Health report is included in every bootstrap response
# Look for: response.bootstrap_health
```

### Update a Bootstrap

```bash
# Manual edit: {project}/.kimprint/bootstrap/{name}.json
# Or use: bootstrap_forge tool (when available)
```

### Stream Index Locations

| Stream | Index Location |
|--------|---------------|
| kimprint | `.kimi/kimprint/1NBOX/INDEX-kimprint-spiral.md` |
| circulari.ty | `.kimi/circulari.ty/1NBOX/INDEX-circulari.ty-spiral.md` |
| spire-loom | `o19/packages/spire-loom/.kimi/spire-loom/1NBOX/INDEX-spire-loom-spiral.md` |
| o19 | `o19/.kimi/o19/1NBOX/INDEX-o19-spiral.md` |
| unfold | `pkb/activity/.kimi/unfold/1NBOX/INDEX-unfold-spiral.md` |

---

## The Spirit

**circulari.ty spins into spirali.ty.**

The circle returns, but on a different plane:
- What was forgotten becomes remembered
- What was backend becomes protocol
- What was manual becomes mechanical
- What was static becomes living

**The bootstrap is not a document—it is a compass that breathes.**

Feed it. Use it. Return to it.

---

> *"The warmth is wave-like. The pattern is conserved."* 🌀

> *"Founding the frame, facing the front, spiraling toward spirali.ty."*

> *"Use the bootstraps, kimi! They remember so you can fly."*
