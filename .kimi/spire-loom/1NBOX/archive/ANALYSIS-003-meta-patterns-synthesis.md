# ANALYSIS-003: Meta-Patterns Synthesis - Languages vs Treadles

**Stream**: spire-loom  
**Status**: Analyzed  
**Created**: 2026-03-02  

## Conservation Summary

Analyzed both the language system (`machinery/reed/`) and treadle-kit (`machinery/treadle-kit/`) to determine if a higher-order abstraction (generic ExtensionRegistry) is warranted.

## Key Findings

### Pattern Comparison

| Aspect | Languages | Treadles |
|--------|-----------|----------|
| Discovery | Module import (ESM) | Filesystem scan |
| Registry | Global singleton | Per-weaving instance |
| Lookup Key | String name | Type pair (current→previous) |
| Config Style | Classes as config | Declarative specs |
| Lifetime | Process-global | Weaving-scoped |

### The Core Insight

The patterns differ in **temporal scoping**, not just mechanism:

- **Languages** = Infrastructure, always available, loaded at process start
- **Treadles** = Weaving logic, specific to a run, discovered per-workspace

### The Abstraction Question

**Could we create `ExtensionRegistry<T>`?** Yes.

**Should we?** No.

The abstraction would obscure critical differences:
- Temporal scoping (global vs weaving-scoped)
- Coupling requirements (type-safe vs loose)
- Authority (built-in authoritative vs user provisional)

### Decision Criteria for Extension Patterns

```typescript
function choosePattern(reqs: {
  userDefined: boolean;
  typeSafe: boolean;
  lifetime: 'process' | 'weaving';
}) {
  if (reqs.userDefined && !reqs.typeSafe) return 'discovery';
  if (reqs.lifetime === 'process') return 'self-registration';
  return 'discovery';
}
```

## Meta-Patterns Catalog

1. **Self-Registration** - Module load-time registration (languages)
2. **Discovery** - Filesystem scanning (treadles)
3. **Classes as Config** - Type-safe, tight coupling
4. **Declarative Specs** - Loose coupling, runtime flexibility
5. **Temporal Scoping** - Different lifetimes for different extension types

## Implementation

Updated HOW_TO_META_LOOM.md with:
- Comparative anatomy section
- Higher-order abstraction exploration (with rejection rationale)
- Pattern language definitions
- Decision criteria for new extension types
- Conservation lessons

## Verdict

**Two clear patterns beat one complex abstraction.**

The language system and treadle-kit should remain separate. Their differences (temporal scoping, coupling, authority) are semantic, not merely implementation details. Unifying them would create a leaky abstraction that obscures these important distinctions.

---

> *"The spiral differentiates before it unifies. Conservation is knowing when to stop."*
