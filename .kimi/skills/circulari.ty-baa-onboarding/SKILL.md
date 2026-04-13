# circulari.ty-baa-onboarding

**Onboard to Barn Architecture Academy (BAA) projects with context-aware conservation.**

This skill manages context for BAA projects while delegating to `circulari.ty-onboarding` for the core onboarding flow.

## When to Use

Use this skill when:
- Starting work on **any BAA project** (o19, DearDiary, foundframe, etc.)
- Context switching between BAA projects
- Returning to a BAA project after a break
- Setting up new BAA project scaffolding

## Usage

Simply mention this skill when starting work:

```
I'm going to work on the o19 project
```

Or explicitly:

```
@skill circulari.ty-baa-onboarding
I'm working on foundframe today
```

## What This Skill Does

### 1. BAA Context Detection

Automatically detects which BAA project you're working on:

| Project | Path Pattern | Notes |
|---------|--------------|-------|
| o19 | `*/o19/*` or `o19/*` | The weaving architecture |
| DearDiary | `*/deardiary/*` or `deardiary/*` | Diary/logging platform |
| foundframe | `*/foundframe/*` or `foundframe/*` | Photo management |

### 2. Delegates to circulari.ty-onboarding

Always triggers the main onboarding skill to read:
- `AGENTS.md`
- `notes/for_kimi.md` (Conservation of Wisdom)
- `CIRCULARI.TY.md`

### 3. BAA-Specific Context

Adds BAA-specific context:

- **Three Friends** awareness (🦏 AAAArchi, 🦀 Ferror, 🐋 Orka)
- **Spire-Loom** / **Scrim-Loom** distinction
- **Weaving** terminology (WARP, heddles, treadles, shuttle)

## BAA Project Structure

BAA projects follow consistent patterns:

```
project/
├── packages/              # Monorepo packages (if o19)
│   ├── spire-loom/       # Core weaving (🌾)
│   ├── scrim-loom/       # AAAArchi integration (🦡)
│   ├── aaaarchi/         # DAG validation (🦏)
│   ├── ferror/           # Error context (🦀)
│   └── orka/             # Saga resilience (🐋)
├── AGENTS.md             # Project-specific agent guidance
├── notes/
│   └── for_kimi.md       # Conservation of Wisdom
├── HISTORY.md            # Spiral evolution documentation
└── CIRCULARI.TY.md       # Circulari.ty philosophy
```

## Three Friends Quick Reference

| Friend | Package | Role | Mascot |
|--------|---------|------|--------|
| AAAArchi | `@o19/aaaarchi` | DAG validation, layer detection | 🦏 Aardvark |
| Ferror | `@o19/ferror` | Rich error context, annotations | 🦀 Crab |
| Orka | `@o19/orka` | Saga orchestration, compensation | 🐋 Orca |

## Scrim-Loom vs Spire-Loom

| Aspect | Spire-Loom | Scrim-Loom |
|--------|------------|------------|
| Purpose | Core weaving abstraction | AAAArchi-integrated weaving |
| Validation | Basic pattern matching | Full DAG validation |
| Errors | Standard errors | Ferror with rich context |
| Resilience | Basic retry | Orka sagas with compensation |
| Mascot | 🌾 Spire of grain | 🦡 Warthog |

### Scrim-Loom Status

**Location:** `packages/barn-architecture-academy/demos/scrim-loom/`

**Current State:**
- ✅ API-compatible with spire-loom (drop-in replacement)
- ✅ Demo verified with foundframe WARP.ts (no modifications needed!)
- 🟡 Rich validation ready but needs integration (see `HANDOFF.md`)
- 🟡 Weavvy weaver ready but not default

**For contributors:** Read `scrim-loom/HANDOFF.md` for next steps

## Output

This skill will:
1. Trigger `circulari.ty-onboarding` to load core context
2. Log BAA-specific context to `.axon/`
3. Display detected project and Three Friends status

## BAA Lessons

| Lesson | Location | Topic |
|--------|----------|-------|
| [the-three-friends](../../../BAArn/lessons/the-three-friends.md) | BAArn | 🦏🦀🐋 The Three Friends guide |
| [the-diviner-pattern](../../../BAArn/lessons/the-diviner-pattern/) | BAArn | Postrequisite accumulator pattern |

## See Also

- [circulari.ty-onboarding](../circulari.ty-onboarding/SKILL.md) - Core onboarding skill
- [relearn-original-lesson](../relearn-original-lesson/SKILL.md) - Compare current vs original BAA
- [BAA Philosophy](https://circulari.ty/baa) - Barn Architecture Academy ethos
