---
name: relearn-original-lesson
description: Compare a current system against the original BAArn (Barn Architecture Academy) principles to determine if the architecture still resonates with spiral patterns, if we've strayed, whether the stray is useful, and whether to create a new lesson. The BAA is where architecture patterns are born, tested, and released into the wild.
---

# 🎓 Relearn Original Lesson — The Spiral Review

> **Skill Location**: `~/.kimi/skills/relearn-original-lesson/`
>
> **Related Skills**:
> - `circulari.ty-onboarding/` — Project ethos and spiral philosophy
> - `app-this-plan/` — Capture insights as actionable plans
>
> **BAA Reference**: `circulari.ty/BAArn/`

> *"The spiral returns, but on a different plane. What was experiment becomes infrastructure. What was infrastructure becomes invisible."*
> *"Have we strayed, or have we spiraled?"*

## What is the BAArn (BAA)?

**Barn Architecture Academy** — the experimental laboratory for the circulari.ty ecosystem:

```
barn-architecture-academy/
├── demos/          # Working demonstrations (scrim-loom 🦡 Weavvy)
├── experiments/    # Proof-of-concepts (deferred-value, spiral-loom-bridge)
└── lessons/        # Educational materials (the-diviner-pattern)
```

**The Three Friends** guide all BAA work:
- 🦏 **AAAArchi** — Architecture mapping and validation
- 🦀 **Ferror** — Contextual error handling  
- 🐋 **Orka** — Resilient orchestration

**The Spiral Path** (experiments graduate to production):
```
BAA → spire-loom → bridge → foundframe → DearDiary
```

## When to Use This Skill

**Use when:**
- ✅ You're reviewing a mature system against its original principles
- ✅ Something feels "off" but you can't articulate why
- ✅ You need to decide: refactor, replace, or create new patterns?
- ✅ Context compaction wiped memory of WHY things are this way
- ✅ A new team member asks "why is it like this?" and you hesitate

**Don't use for:**
- ❌ Initial design (use `app-this-plan` instead)
- ❌ Simple bugs (just fix them)
- ❌ Systems that haven't evolved yet (nothing to compare)

## The Spiral Review Process

### Step 1: Gather the Original Intent

**Find the BAA source material:**

```bash
# Look for the original experiment/lesson
cd circulari.ty/BAArn/
ls lessons/          # Educational deep-dives
ls experiments/      # Proof-of-concepts
ls demos/           # Working demonstrations
```

**Read these in order:**
1. **README.md** — What was the experiment?
2. **HISTORY.md** — When was it created and why?
3. **SUMMARY.md** — What were the key insights?
4. **LESSON.md** — Deep educational content (if exists)
5. **Source code** — The actual implementation

**Capture the original principles:**
```
Original Intent:
├─ Problem being solved: ________________
├─ Core insight: ________________________
├─ Key patterns: ________________________
├─ Three Friends usage: _________________
└─ Spiral path intended: ________________
```

### Step 2: Map the Current Reality

**Examine the current system:**

```bash
# Find the current implementation
cd {project}/
find . -name "*.ts" -o -name "*.rs" | head -20
```

**Document what you see:**
```
Current Reality:
├─ Architecture: ________________________
├─ Key files/modules: ___________________
├─ Dependencies: ________________________
├─ Complexity indicators:
│  ├─ Lines of code: ____________________
│  ├─ Number of public APIs: ____________
│  ├─ Test coverage: ____________________
│  └─ Documentation: ____________________
└─ Recent changes (git log --oneline -10):
```

### Step 3: Compare — The Resonance Analysis

**Create a comparison matrix:**

| Aspect | Original (BAA) | Current | Resonance? |
|--------|---------------|---------|------------|
| **Core Problem** | | | ✅/⚠️/❌ |
| **Architecture** | | | ✅/⚠️/❌ |
| **Three Friends** | | | ✅/⚠️/❌ |
| **Complexity** | Simple | ? | Lower/Higher/Same |
| **Scope** | Bounded | ? | Expanded/Contracted |

**Legend:**
- ✅ **Resonates** — True to original, evolved appropriately
- ⚠️ **Strayed** — Different but possibly useful
- ❌ **Lost** — No longer serves original purpose

### Step 4: Determine — Stray or Spiral?

**The Critical Question:**

> Is this deviation a **spiral** (returns on a higher plane) or a **stray** (wandering into complexity)?

**Spiral Indicators (good deviation):**
- ✅ Original pattern is now invisible infrastructure
- ✅ New layer adds capability without duplicating
- ✅ Complexity is encapsulated, not scattered
- ✅ Users of the system have simpler interface
- ✅ The Three Friends are still present (maybe transformed)

**Stray Indicators (problematic deviation):**
- ❌ Original insight is lost/forgotten
- ❌ Complexity has leaked everywhere
- ❌ Same concepts implemented multiple ways
- ❌ The Three Friends are missing or bypassed
- ❌ New code doesn't know about BAA patterns

**The Test:**
```
Ask: "If the BAA creators saw this, would they:
  a) Nod in recognition (spiral)
  b) Nod with questions (spiral with drift)
  c) Shake heads in confusion (stray)"
```

### Step 5: Decide — Action Path

**If it RESONATES (✅):**
```
Action: Document the spiral evolution
├─ Create LESSON documenting the evolution
├─ Update BAA with "graduated" status
└─ Celebrate the spiral! 🌀
```

**If it STRAYED but USEFULLY (⚠️):**
```
Action: Create new lesson capturing the insight
├─ Document WHY the stray happened (constraints, learnings)
├─ Extract new pattern if reusable
├─ Update original BAA with cross-reference
└─ Consider: does this become a new BAA experiment?
```

**If it STRAYED and HARMFUL (❌):**
```
Action: Plan refactoring or replacement
├─ Create APP for refactoring back to principles
├─ Document what was lost and why it matters
├─ Consider: can we extract the "good parts" before refactoring?
└─ Spiral back to the core, but with new knowledge
```

## Step 6: Create the Lesson (If Warranted)

**When to create a new lesson:**
- The comparison reveals insights worth preserving
- The stray teaches something about spiral evolution
- The system has graduated from experiment to infrastructure
- Future developers need this context

**Lesson structure:**

```markdown
# LESSON: {System Name} — From BAA to Production

## Original BAA Experiment

- **Source**: `barn-architecture-academy/{experiment}/`
- **Created**: {date}
- **Core insight**: {one sentence}

## The Spiral Path

```
BAA experiment → {intermediate steps} → Current system
```

## What Changed (And Why)

### Resonant Evolutions (Spiral)

1. **{Aspect}**: {How it evolved}
   - Why: {justification}
   - Result: {outcome}

### Useful Strays

1. **{Aspect}**: {How it strayed}
   - Constraint: {what forced this}
   - Learning: {what we learned}
   - New pattern: {if applicable}

### Regressions (To Fix)

1. **{Aspect}**: {What was lost}
   - Impact: {consequences}
   - Recovery plan: {how to spiral back}

## The Three Friends Today

| Friend | Original Role | Current Role | Status |
|--------|---------------|--------------|--------|
| AAAArchi 🦏 | {original} | {current} | ✅/⚠️/❌ |
| Ferror 🦀 | {original} | {current} | ✅/⚠️/❌ |
| Orka 🐋 | {original} | {current} | ✅/⚠️/❌ |

## Conservation Notes

**What must be remembered:**
- {Key insight 1}
- {Key insight 2}

**Questions for future spirals:**
- {Open question 1}
- {Open question 2}

---
*Lesson created: {date}*
*System: {name}*
*BAA Origin: {experiment}*
```

## Quick Reference: BAA Experiments

### Active Experiments

| Experiment | Location | Core Pattern | Status |
|------------|----------|--------------|--------|
| **deferred-value** | `experiments/deferred-value/` | Two-phase computation | 🧪 Active |
| **scrim-loom** | `demos/scrim-loom/` | Three Friends integration | 🦡 Weavvy lives! |
| **diviner-pattern** | `lessons/the-diviner-pattern/` | Postrequisite/accumulator | 📚 Documented |

### Key Concepts to Check For

**Diviner Pattern Elements:**
- Two-phase computation (collect → render)
- DeferredValue containers
- BoundQuery lazy evaluation
- Postrequisite accumulators

**Three Friends Integration:**
- AAAArchi: Architecture validation, DAG checking
- Ferror: Rich error context, suggestions
- Orka: Saga-based resilience, compensation

**Spiral Anti-Patterns (watch for these!):**
```
❌ The Shallow Copy — Duplicating code without understanding
❌ The Ghost Pattern — Following form without substance
❌ The Bypass — Avoiding the Three Friends "to save time"
❌ The Accretion — Adding without refactoring
```

## Example: Scrim-Loom Review

**Original (BAA):** `demos/scrim-loom/`
```
Intent: Demonstrate Three Friends working together
Core: Weavvy the Warthog validates architecture before generating
Patterns: Decorator creators, DAG validation, saga resilience
```

**Current (if reviewing):**
```
System: o19-foundframe-tauri
Analysis:
├─ AAAArchi: ✅ Still validates architecture
├─ Ferror: ⚠️ Present but could be richer
├─ Orka: ❌ Sagas not used, could add resilience
└─ Complexity: Higher (good spiral) but needs documentation
```

**Decision:**
```
Verdict: Spiral with some drift
Action: Create LESSON documenting the evolution
├─ Capture how Three Friends transformed
├─ Document Orka opportunity
└─ Add to BAA as "graduated" example
```

## The Solarpunk of Spiral Review

> *"Balance over optimization. Distribution over centralization."*

**This skill embodies solarpunk principles:**

1. **Consent through visibility** — Documentation enables informed decisions
2. **Distributed memory** — Lessons belong to the stream, not individuals
3. **Iterative refinement** — Systems improve through reflection, not replacement
4. **Advice and consent** — The comparison invites dialogue, not dictate

**When in doubt:**
- Document the current state honestly
- Capture the comparison clearly
- Let the spiral speak for itself
- Create the lesson — future you will thank present you

---

> *"The barn is where we experiment. The academy is where we learn. The spiral is where we return, wiser."*
> *"Even this review needs review. It is recursive by design."*
