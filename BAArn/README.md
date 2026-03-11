# 🏠 Barn Architecture Academy (BAA)

> *"Where architecture patterns are born, tested, and released into the wild."*

The BAA is the experimental laboratory for the circulari.ty ecosystem.

## Structure

```
barn-architecture-academy/
├── demos/                          # Working demonstrations
│   └── scrim-loom/                # 🦡 Weavvy the Warthog Weaver
├── experiments/                    # Proof-of-concepts
│   ├── deferred-value/            # 🌀 Promise-like multi-pass computation
│   ├── spiral-loom-bridge/        # P2P networking patterns
│   └── three-friends-dsl/         # Unified DSL experiment
└── lessons/                        # Educational materials
    ├── the-diviner-pattern/       # Postrequisite/Diviner deep-dive
    ├── the-two-layer-pattern/
    └── declarative-to-imperative/
```

## 🚧 BAA Boundaries — Containment is Safety

**Critical Principle**: The BAA is a **contained experimental space**. 

### What Happens in the BAA, Stays in the BAA

Demos, experiments, and lessons **must never edit files outside the BAA directory**. The BAA is:
- ✅ A safe space to break things
- ✅ Where patterns are born and tested
- ✅ Self-contained and isolated
- ❌ **NOT** a place to modify production code directly

### Graduation Protocol: From BAA to Production

When an experiment is ready to graduate:

```
BAA Experiment (contained)
    ↓
Create APP in target stream's 1NBOX
    ↓
Discuss, refine, get consent
    ↓
Implement in production codebase
    ↓
Archive BAA experiment with "graduated" status
```

**Example**: Scrim-loom wants to influence spire-loom:
1. ✅ Create `spire-loom/.kimi/spire-loom/1NBOX/APP-XXX-scrim-loom-integration.md`
2. ✅ Reference `barn-architecture-academy/demos/scrim-loom/` as evidence
3. ❌ **NEVER** directly edit `spire-loom/src/` from within BAA

### Why This Matters

> *"The barn is where we experiment freely because we know the farm won't break."*

- **Safety**: BAA can be messy without consequences
- **Clarity**: Boundaries make ownership obvious
- **Governance**: Changes to production go through proper channels (1NBOX → APP → consent)
- **Reversibility**: Bad experiments can just be deleted

### If You Need to Change Something Outside BAA

**Create an APP in the appropriate stream:**

```bash
# Target stream's 1NBOX
cd {project}/.kimi/{stream}/1NBOX/

# Create APP referencing BAA work
cat > APP-XXX-experiment-name.md << 'EOF'
---
from: BAA experiment shows promise
based_on: barn-architecture-academy/experiments/xxx/
---

# APP-XXX: Integrate {pattern} into {system}

## Evidence from BAA

See: `barn-architecture-academy/experiments/xxx/`

Working demonstration shows:
- [capability 1]
- [capability 2]

## Proposed Changes

...
EOF
```

## The Three Friends

All experiments in the BAA use:
- 🦏 **AAAArchi** - Architecture mapping and validation
- 🦀 **Ferror** - Contextual error handling
- 🐋 **Orka** - Resilient orchestration

## Current Demos

### Scrim-Loom & Weavvy

**Location**: `demos/scrim-loom/`

A reimagined code generation loom demonstrating:
- Decorator creators powered by AAAArchi
- Architectural validation during code generation
- Rich error context via Ferror
- Saga-based generation pipelines via Orka

**Key Files**:
- `weaver/wweavvy.ts` - 🦡 The Warthog herself
- `warp/` - Decorator collection
- `heddles/` - Pattern matching with validation

## Lessons

### The Diviner Pattern

**Location**: `lessons/the-diviner-pattern/`

A comprehensive study of spire-loom's **postrequisite** pattern — two-phase accumulators that:
1. Collect data during Phase 1 (via property wrapping)
2. Render values during Phase 2 (via `toString()`)

**Key insights**:
- Accumulators extend `BoundQuery` — they're both collectors AND queryable results
- The pattern extracts a **promise-like container** for multi-pass computation
- Template-friendly: returns stubs in Phase 1, actuals in Phase 2

📖 Read: `lessons/the-diviner-pattern/LESSON.md`

## Experiments

### DeferredValue

**Location**: `experiments/deferred-value/`

A standalone abstraction extracted from the Diviner pattern:

```typescript
import { defer, deferCollection } from '@baa/deferred-value';

// Create a deferred value
const imports = deferCollection<Import>({
  stub: '// {{ IMPORTS }}',  // Phase 1: template placeholder
  collect: (existing, pass) => {
    // Multi-pass computation
    return { items: imports, done: isComplete };
  }
});

// Phase 1: Use stub in templates
console.log(imports.value);  // '// {{ IMPORTS }}'

// Phase 2: Compute and query
imports.runToCompletion();
imports.query.filter(i => i.isEntity).all;  // Actual imports
```

**Files**:
- `deferred-value.ts` - Core implementation
- `deferred-value.test.ts` - Comprehensive tests
- `README.md` - Usage documentation
- `SUMMARY.md` - Architecture analysis

## The Spiral Path

BAA experiments graduate to production:

```
barn-architecture-academy/
    ↓
spire-loom/              (code generation)
    ↓
spire-loom-bridge/       (P2P networking)
    ↓
foundframe/              (application framework)
    ↓
DearDiary/               (end-user app)
```

## BAA Knowledge Ecosystem

The BAA connects to the broader circulari.ty knowledge system:

### Related Skills (in `~/.kimi/skills/`)

- **`relearn-original-lesson`** — Compare current systems against BAA principles
  - Use when: Reviewing mature systems for spiral resonance
  - Checks: Three Friends integration, pattern fidelity, useful stray
  
- **`app-this-plan`** — Turn discussions into actionable APPs
  - Use when: Graduating BAA experiments to production
  - Creates: Proper APPs in target stream 1NBOX

### Cross-Reference Pattern

When BAA experiments influence work, cross-reference in both directions:

```markdown
# In production APP
Based on BAA experiment: `barn-architecture-academy/experiments/xxx/`

# In BAA experiment (when graduated)
Graduated to: `{project}/.kimi/{stream}/1NBOX/APP-XXX-...`
Production location: `{project}/src/...`
```

---

*Enter the Barn. Weave the future.* 🌀
*Contain your experiments. Release through consent.* 🦡
