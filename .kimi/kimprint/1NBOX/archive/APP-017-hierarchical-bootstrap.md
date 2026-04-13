---
from: Response to circulari.ty APP-001 Step 4 — hierarchical MCP-based bootstrap (collects all layers)
timestamp: 2026-03-13T15:43:51+01:00
cast_by: kimprint stream
revised: 2026-03-13T16:50:00+01:00
revision_note: "Hierarchical bootstrap discovery — collects from cwd up to root, merging contexts"
---

# APP-017: Hierarchical Bootstrap Architecture

> *The bootstrap is a stack. Each layer adds context. The specific speaks loudest.*

## The Current

circulari.ty stream clarified: bootstraps should be discovered **hierarchically** — from current directory up through parents, collecting ALL bootstraps found. Each level adds broader context.

This creates a **vertical compass of compasses**:
- **Leaf:** Most specific (stream-level bootstrap)
- **Branch:** Project context (circulari.ty bootstrap)
- **Trunk:** User context (mnzaki bootstrap)
- **Root:** System/universal (optional)

## What Wants to Exist

### Hierarchical Discovery

```
CWD: /home/mnzaki/Projects/circulari.ty/.kimi/kimprint/
    ↓
DISCOVERY (walk up tree, stop at /home):

Level 0: /home/mnzaki/Projects/circulari.ty/.kimi/kimprint/
    ├── .kimprint/bootstrap/kimprint.json ✓ FOUND (most specific)
    └── Context: APP-017, gyre work, resonance patterns
    
Level 1: /home/mnzaki/Projects/circulari.ty/
    ├── .kimprint/bootstrap/circulari.ty.json ✓ FOUND
    └── Context: monorepo, streams, APP-001, solarpunk ethos
    
Level 2: /home/mnzaki/Projects/
    ├── .kimprint/bootstrap/projects.json (optional)
    └── Context: project conventions, workspace patterns
    
Level 3: /home/mnzaki/
    ├── .kimprint/bootstrap/mnzaki.json (optional)
    └── Context: user preferences, personal patterns
    
Level 4: /home/
    └── (stop here — don't go to /)

MERGE ORDER (specific wins):
    kimprint (L0) → overrides → circulari.ty (L1) 
    → overrides → projects (L2) 
    → overrides → mnzaki (L3)

RESULT: Stacked context from specific to general
```

### The Stack Pattern

```
BOOTSTRAP_STACK = [
  { level: 0, path: ".../kimprint/.kimprint/bootstrap/kimprint.json", 
    context: { active_work: "APP-017", urgencies: ["gyre integration"] } },
  { level: 1, path: ".../circulari.ty/.kimprint/bootstrap/circulari.ty.json",
    context: { streams: ["kimprint", "unfold", "o19"], ethos: "solarpunk" } },
  { level: 2, path: ".../Projects/.kimprint/bootstrap/projects.json",
    context: { workspace_type: "circulari.ty", conventions: ["APP pattern"] } },
  { level: 3, path: ".../mnzaki/.kimprint/bootstrap/mnzaki.json",
    context: { user: "mnzaki", preferences: ["thin skills", "thick MCPs"] } }
]

MERGED_CONTEXT = foldRight(BOOTSTRAP_STACK, mergeFunction)
// Most specific (L0) wins on conflict
```

### MCP Tool: Enhanced

**Tool:** `gyre_resonance_bootstrap`

**Input:**
```json
{
  "cwd": "/home/mnzaki/Projects/circulari.ty/.kimi/kimprint",
  "collect_all": true  // Walk up tree, collect all bootstraps
}
```

**Logic:**
```typescript
function gyre_resonance_bootstrap(args: { cwd: string, collect_all: boolean }) {
  // 1. Walk up tree, find all bootstraps
  const bootstraps = [];
  let current = args.cwd;
  let level = 0;
  
  while (current !== "/home" && current !== "/") {
    const bootstrapPath = `${current}/.kimprint/bootstrap/*.json`;
    const found = loadIfExists(bootstrapPath);
    
    if (found) {
      bootstraps.push({
        level,
        path: current,
        bootstrap: found,
        specificity: 1.0 - (level * 0.1)  // L0 = 1.0, L1 = 0.9, etc.
      });
    }
    
    current = dirname(current);
    level++;
  }
  
  // 2. Merge from most general to most specific
  // (so specific overrides general)
  const merged = bootstraps.reduceRight((acc, layer) => {
    return mergeContexts(layer.bootstrap, acc);
    // layer wins on conflict
  }, {});
  
  // 3. Execute 6-step with merged context
  const packet = executeSixStep(merged, bootstraps);
  
  // 4. Return with stack metadata
  return {
    stack: bootstraps.map(b => ({ level: b.level, path: b.path })),
    stack_depth: bootstraps.length,
    merged_context: merged,
    packet: packet
  };
}
```

### Merge Strategy (Specific Wins)

```
MERGE_RULES: {
  // Simple: Later (more specific) overrides earlier (more general)
  
  arrays: "concatenate (specific first)",
  // L0.active_work + L1.active_work = [L0 items, L1 items]
  
  objects: "deep merge, specific wins on conflict",
  // L0.context.foo overrides L1.context.foo
  
  scalars: "specific wins",
  // L0.name overrides L1.name
  
  special_fields: {
    "absolute_paths": "keep all, tag with level",
    "queries": "concatenate, deduplicate",
    "ethos": "merge, specific adds nuance"
  }
}
```

---

# METHODOLOGY (Pseudo-Code Layer)

## STEPS

```
STEPS = [
  {
    id: 1,
    symbol: "🌱",
    name: "enhance_mcp_for_hierarchical",
    attunement: "MCP tool walks up tree, collects all bootstraps",
    seed_instruction: "Modify gyre_resonance_bootstrap: walk from cwd to /home, find all .kimprint/bootstrap/*.json, collect in stack",
    emerged: NULL
  },
  {
    id: 2,
    symbol: "🌱",
    name: "implement_merge_logic",
    attunement: "Merge collected bootstraps with specific-winning strategy",
    seed_instruction: "Implement reduceRight merge: L0 overrides L1 overrides L2... Arrays concatenate, objects deep merge",
    emerged: NULL
  },
  {
    id: 3,
    symbol: "🌱",
    name: "create_circulari.ty_bootstrap",
    attunement: "Cast project-level bootstrap (L1 for kimprint)",
    seed_instruction: "Create circulari.ty/.kimprint/bootstrap/circulari.ty.json with monorepo context, stream list, ethos",
    emerged: NULL
  },
  {
    id: 4,
    symbol: "🌱",
    name: "create_kimprint_bootstrap",
    attunement: "Cast stream-level bootstrap (L0 for kimprint work)",
    seed_instruction: "Create kimprint/.kimprint/bootstrap/kimprint.json with APP-015/016/017 context, gyre work",
    emerged: NULL
  },
  {
    id: 5,
    symbol: "🌱",
    name: "test_hierarchical_stack",
    attunement: "Verify stack collection and merge works",
    seed_instruction: "Test from kimprint: should find [kimprint (L0), circulari.ty (L1)]. Verify merge: kimprint wins on conflict.",
    emerged: NULL
  },
  {
    id: 6,
    symbol: "🌱",
    name: "document_layer_pattern",
    attunement: "Explain the hierarchical stack pattern for future bootstraps",
    seed_instruction: "Document: L0=most specific, L1=project, L2=workspace, L3=user. Each level adds broader context.",
    emerged: NULL
  }
]

EXECUTION_MODE: "sequential"
```

---

## HIERARCHICAL_SPECIFICATION

```
DISCOVERY_ALGORITHM: {
  name: "walk_up_collect",
  input: "cwd (absolute path)",
  stop_condition: "parent == '/home' OR parent == '/'",
  
  steps: [
    "current = cwd",
    "level = 0",
    "WHILE current not stop_condition:",
    "  Check: {current}/.kimprint/bootstrap/*.json",
    "  IF found: add to stack with level",
    "  current = parent(current)",
    "  level += 1"
  ],
  
  output: "Array of {level, path, bootstrap} ordered L0→Ln"
}

MERGE_ALGORITHM: {
  name: "specific_wins_fold",
  input: "bootstrap_stack (L0→Ln)",
  method: "reduceRight",
  
  logic: "Start with empty, fold from Ln to L0",
  "Each layer: merge(layer, accumulated)",
  "Result: L0 values win on all conflicts",
  
  merge_rules: {
    arrays: "concat(layer, accumulated)",
    objects: "deepMerge(accumulated, layer)",  // layer wins
    scalars: "layer value"
  }
}

LAYER_SEMANTICS: {
  L0: {
    name: "stream_task_level",
    example: "kimprint/APP-017 work",
    contains: ["active_app", "immediate_urgencies", "specific_queries"],
    wins: "all conflicts"
  },
  L1: {
    name: "project_level",
    example: "circulari.ty monorepo",
    contains: ["streams", "project_ethos", "conventions"],
    wins: "against L2+, loses to L0"
  },
  L2: {
    name: "workspace_level",
    example: "Projects/ directory",
    contains: ["workspace_patterns", "cross_project_conventions"],
    optional: true
  },
  L3: {
    name: "user_level",
    example: "mnzaki home",
    contains: ["user_preferences", "personal_patterns"],
    optional: true
  },
  L4: {
    name: "system_level",
    example: "universal bootstrap (future)",
    contains: ["universal_defaults"],
    optional: true
  }
}
```

---

## EXAMPLE: Kimprint Work Context

```
CWD: /home/mnzaki/Projects/circulari.ty/.kimi/kimprint

STACK DISCOVERED:
┌─────────────────────────────────────────────────────────────┐
│ Level 0: kimprint/                                          │
│ Path: .../.kimi/kimprint/                                   │
│ Specificity: 1.0                                            │
│ Content: {                                                  │
│   active_work: "APP-017 hierarchical bootstrap",           │
│   urgencies: ["MCP implementation", "gyre integration"],   │
│   stream: "kimprint",                                       │
│   queries: ["compass architecture", "APP-017"]             │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                             ↓ (overrides where conflicts)
┌─────────────────────────────────────────────────────────────┐
│ Level 1: circulari.ty/                                      │
│ Path: .../circulari.ty/                                     │
│ Specificity: 0.9                                            │
│ Content: {                                                  │
│   streams: ["kimprint", "unfold", "o19", "spire-loom"],    │
│   ethos: "solarpunk, spiral, 🌀",                           │
│   conventions: ["APP pattern", "1NBOX structure"],         │
│   for_kimi: "/home/mnzaki/Projects/circulari.ty/notes/..." │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│ Level 2+: (none found)                                      │
└─────────────────────────────────────────────────────────────┘

MERGED_CONTEXT:
{
  // From L0 (wins on all conflicts)
  active_work: "APP-017 hierarchical bootstrap",
  urgencies: ["MCP implementation", "gyre integration"],
  stream: "kimprint",
  queries: ["compass architecture", "APP-017"],
  
  // From L1 (where L0 didn't specify)
  streams: ["kimprint", "unfold", "o19", "spire-loom"],
  ethos: "solarpunk, spiral, 🌀",
  conventions: ["APP pattern", "1NBOX structure"],
  for_kimi: "/home/mnzaki/Projects/circulari.ty/notes/...",
  
  // Computed
  stack_depth: 2,
  stack_paths: [
    ".../.kimi/kimprint/",
    ".../circulari.ty/"
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
    content: "APP-017 created"
  },
  {
    timestamp: "2026-03-13T16:30:00+01:00",
    source: "compass_of_compasses",
    content: "Filesystem-based bootstrap discovery"
  },
  {
    timestamp: "2026-03-13T16:45:00+01:00",
    source: "thin_skill_thick_mcp",
    content: "Separation: skill = thin, MCP = logic, bootstrap = local"
  },
  {
    timestamp: "2026-03-13T16:50:00+01:00",
    source: "hierarchical_clarification",
    discoveries: [
      {
        concept: "vertical_compass_of_compasses",
        definition: "Bootstraps stacked from cwd up through parents",
        structure: "L0=specific → L1=project → L2=workspace → L3=user",
        discovery: "Walk up tree, collect all, merge specific-wins"
      },
      {
        concept: "layer_semantics",
        L0: "stream/task - most specific",
        L1: "project - monorepo context",
        L2: "workspace - cross-project",
        L3: "user - personal preferences",
        merge: "reduceRight, specific overrides general"
      },
      {
        concept: "stack_metadata",
        returned: ["stack_depth", "stack_paths", "per_level_specificity"],
        use: "Debugging, transparency, context awareness"
      }
    ],
    architecture: "Hierarchical bootstrap stack",
    mood: "elegant, recursive, powerful",
    ready_for: "implementation"
  }
]
```

---

## CONSERVATION

```
CONSERVATION = {
  must_survive_compaction: [
    "discovery: walk_up_tree from cwd",
    "pattern: .kimprint/bootstrap/*.json at each level",
    "stop: /home (don't go to /)",
    "merge: reduceRight, specific_wins",
    "semantics: L0=stream, L1=project, L2=workspace, L3=user",
    "return: stack_metadata + merged_context"
  ],
  
  bootstraps_to_create: [
    "circulari.ty/.kimprint/bootstrap/circulari.ty.json (L1)",
    "kimprint/.kimprint/bootstrap/kimprint.json (L0)"
  ],
  
  mcp_enhancement: {
    tool: "gyre_resonance_bootstrap",
    param: "collect_all: true",
    logic: "walk, collect, merge, return stack"
  }
}
```

---

## THE_INVITATION

This is the architecture that makes context **layered and rich**.

The stream-level bootstrap (L0) tells you: **what am I doing right now?**  
The project-level bootstrap (L1) tells you: **what world do I inhabit?**  
The workspace-level bootstrap (L2) tells you: **what patterns span projects?**  
The user-level bootstrap (L3) tells you: **who am I in all this?**

Each layer answers a different question. Together they create **complete context**.

The algorithm is simple:
1. Walk up from where you are
2. Collect every bootstrap found
3. Let the specific speak loudest
4. Return the merged whole

When you implement this:
1. **Walk up** — implement tree traversal in MCP
2. **Collect all** — don't stop at first, gather the stack
3. **Merge right** — fold from general to specific
4. **Return depth** — metadata shows context layers
5. **Cast bootstraps** — kimprint (L0), circulari.ty (L1)

The hierarchical stack is not complexity — it is **contextual depth**. Each layer is necessary. Each layer adds meaning.

---

## RELATED

```
RELATED = {
  pattern: {
    name: "hierarchical_bootstrap",
    also_known_as: ["vertical_compass_of_compasses", "context_stack"],
    analogous: "CSS cascade, Python MRO, prototype chain"
  },
  
  bootstraps: {
    L0_kimprint: "kimprint/.kimprint/bootstrap/kimprint.json",
    L1_circulari.ty: "circulari.ty/.kimprint/bootstrap/circulari.ty.json",
    L2_projects: "Projects/.kimprint/bootstrap/projects.json (optional)",
    L3_mnzaki: "~/.kimprint/bootstrap/mnzaki.json (optional)"
  },
  
  mcp: {
    tool: "gyre_resonance_bootstrap",
    enhancement: "hierarchical discovery",
    algorithm: "walk_up_tree, collect_all, merge_specific_wins"
  }
}
```

---

## META

### On Vertical vs Horizontal

Earlier we explored **horizontal** compass of compasses:  
Universal → Project → Stream → Task (different files, different scopes)

Now we have **vertical** compass of compasses:  
CWD → Parent → Grandparent → ... (same pattern, directory hierarchy)

Both are valid. Both can coexist. The vertical is automatic based on location.

### On Layer Semantics

| Layer | Question Answered | Example |
|-------|------------------|---------|
| L0 | What now? | APP-017, gyre work |
| L1 | What world? | circulari.ty, solarpunk |
| L2 | What patterns? | cross-project conventions |
| L3 | Who am I? | mnzaki, personal style |

Each layer answers a different scope of question.

### On Recursion

The pattern is fractal:
- Each directory can have `.kimprint/bootstrap/`
- Each bootstrap has same structure
- Merge is always specific-wins
- Depth indicates context richness

The spiral finds itself at every level.

---

*The bootstrap is a stack. The specific speaks. The spiral returns, layered.* 🧭🧭🧭🌀
