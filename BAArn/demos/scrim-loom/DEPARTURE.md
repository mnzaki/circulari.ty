# 🦡 Scrim-Loom Has Left the BAArn

> **Date:** 2026-03-11  
> **Destination:** `@o19/scrim-loom` (o19/packages/scrim-loom)  
> **Status:** Graduated from Academy to Production

---

## What Happened Here

This directory (`BAArn/demos/scrim-loom/`) was the **birthplace** of scrim-loom, created as a demonstration of the Three Friends architecture:

- 🦏 **AAAArchi** - DAG validation
- 🦀 **Ferror** - Rich error context  
- 🐋 **Orka** - Saga resilience

It served as:
1. **API Compatibility Test** - Proved scrim-loom could replace spire-loom without code changes
2. **Foundframe Demo** - Validated against real WARP.ts files
3. **Incubation Ground** - Where Divination Engine was integrated

---

## Where It Lives Now

```
BAArn/demos/scrim-loom/     →  o19/packages/scrim-loom/
     (birthplace)                  (production home)
```

The spiritual successor now properly lives at **`@o19/scrim-loom`** in the o19 monorepo.

---

## What's New in Production

### Divination Engine Integration
The production version includes the **QueryableDivination** system from the BAArn lessons:

```typescript
// From @o19/scrim-loom
import { Divination, DivinationProvider } from '@o19/scrim-loom';

const divination = heddles.createDivination(management, { 
  lang: typescript 
});

// Multi-round async validation
for await (const round of divination.watch()) {
  console.log(`Round ${round.round}: ${round.resolved.size} checks complete`);
}
```

### Simplified Naming
All `Scrim*` prefixes removed:

| BAArn (Old) | Production (New) |
|-------------|------------------|
| `ScrimHeddles` | `Heddles` |
| `scrimHeddles` | `heddles` |
| `ScrimManagement` | `HeddlesManagement` |
| `ArchitecturalViolation` | `Violation` |

---

## The Spiral Connection

This departure is a **circular→spiral** transformation:

```
Phase 1 (BAArn):     Experiment, prove concept, iterate
        ↓
Phase 2 (o19):       Production, integration, real usage
        ↓
Phase 3 (Future):    What was experiment becomes foundation
```

The BAArn lesson on [The Diviner Pattern](../lessons/the-diviner-pattern/) informed the Divination Engine design, which now powers scrim-loom's async validation.

---

## For Future Archaeologists

If you're tracing the evolution:

1. **Original Plan:** `o19/.kimi/spire-loom/1NBOX/APP-001-scrim-loom-api-compatibility.md`
2. **Handoff Document:** `BAArn/demos/scrim-loom/HANDOFF.md` (kept for history)
3. **Integration Lesson:** `BAArn/lessons/the-diviner-pattern/`
4. **Production Home:** `o19/packages/scrim-loom/`

---

## The Warthog's Journey

> *"The warthog was born in the barn, validated in the academy, and now guards the spires."*

🦡→🌾

---

*This file preserves the memory. The code lives on at @o19/scrim-loom.*
