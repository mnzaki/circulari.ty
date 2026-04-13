---
from: Discussion with mnzaki about adding procedural variation to orgui organs via seed-based properties
        The insight: semantic properties (content-meaningful) should be patchable by consumers,
        while decorative properties (pure visual) derive from a seed for unique-but-consistent instances
timestamp: 2026-03-15T23:45:00+01:00
stream: unfold
---

# APP-019: Orgui Procedural Seed Design — Epigenetic Variation for Organs

> *Same genome, different expression. Each organ instance is unique like a leaf, yet recognizable like a species.*

## The Core Intent

**WHY this matters:**

Current orgui organs have fixed visual expressions — every Germinal looks the same. But biological organisms express differently based on environment. A lichen on oak differs from that on granite. This "epigenetic" variation creates **identity through form** — users recognize their collections by how they look, not just labels.

The seed system allows:
1. **Visual identity** — Same organ, unique instance based on context (collection ID, time, content hash)
2. **Consumer control** — Semantic properties (meaningful to function) can be explicitly patched
3. **Serendipity** — Decorative properties (pure visual) surprise and delight via seed computation
4. **Consistency** — Same seed = same expression (reproducible, cacheable)

**WHO benefits:**

- **Users of orgui**: Their "Work Notes" collection always looks the same (visual memory), while "Personal Journal" looks different
- **Library consumers**: Can force semantic behavior ("I want a nest embrace") while letting seed handle decoration
- **The solarpunk ethos**: Abundance through variation — each instance is a unique individual

## What We're Building

### In Scope

- [ ] `OrganSeed` utility class — deterministic random from string/number source
- [ ] `PropertyDeriver` — gets explicit value OR computes from seed based on property definitions
- [ ] Property definitions for each organ (semantic vs decorative categorization)
- [ ] Seed integration in `OrganContext` — available to all child proteins
- [ ] `derive()` function in components — `derive('lobeCount', definition)`
- [ ] Lichenous as first seeded organ — proof of concept
- [ ] Consumer API: `<Lichenous seed={collectionId} properties={{ containment: 'nest' }} />`

### Out of Scope (For Now)

- **Content-derived seed hashing** — Compute seed from actual items (can be added later as utility)
- **Temporal seeds** — Time-based variation (daily/seasonal cycles)
- **Animation seeds** — Procedural animation patterns
- **Cross-organ seed relationships** — "Family resemblance" between related seeds
- **Seed persistence** — Save/load seed expressions (user preferences)

## CSS Variable Generation — The Bridge

Derived properties must flow into CSS custom properties for genes to consume. Each organ exposes seed-derived values as CSS variables scoped to its container.

### Example: gene-edge-lobed with seed-derived border-radius

```typescript
// LichenousProperties.ts - compute seed-derived geometry
export const LichenousProperties = {
  lobeCount: { 
    semantic: 'Visual complexity', 
    computeFromSeed: (seed) => seed.intRange(3, 8)  // 3-8 lobes
  },
  lobeDepth: {
    semantic: 'How deep the lobes cut',
    computeFromSeed: (seed) => seed.range(0.3, 0.7) // 30-70% depth
  },
  edgeTurbulence: {
    semantic: 'Irregularity of lobe edges', 
    computeFromSeed: (seed) => seed.range(0.2, 0.8)
  }
};
```

```svelte
<!-- Lichenous.svelte - apply to CSS variables -->
<script>
  const derived = $derived(deriver.deriveMany(LichenousProperties));
  
  // CSS variable string from seed-derived values
  const cssVars = $derived({
    '--lichen-lobe-count': derived.lobeCount,
    '--lichen-lobe-depth': `${derived.lobeDepth * 100}%`,
    '--lichen-edge-turbulence': derived.edgeTurbulence,
    '--lichen-warmth': `${derived.warmth}deg`,
    '--lichen-glow-pattern': derived.glowPattern
  });
</script>

<div class="lichenous" style={cssVars}>
  <slot />
</div>

<style>
  .lichenous {
    /* gene-edge-lobed consumes these variables */
    --gene-edge-lobed-count: var(--lichen-lobe-count, 5);
    --gene-edge-lobed-depth: var(--lichen-lobe-depth, 50%);
    --gene-edge-turbulence: var(--lichen-edge-turbulence, 0.5);
  }
</style>
```

```css
/* gene-edge-lobed.css - uses the CSS variables */
.gene-edge-lobed {
  /* Dynamic border-radius based on seed-derived lobe count/depth */
  border-radius: 
    calc(var(--gene-edge-lobed-depth) * var(--turbulence-factor, 1))
    calc((100% - var(--gene-edge-lobed-depth)) * var(--turbulence-factor, 1));
  
  /* Turbulence adds irregularity per-instance */
  --turbulence-factor: calc(1 + (var(--gene-edge-turbulence) - 0.5) * 0.4);
}
```

### Key Principle

**Organ computes → CSS variables carry → Genes consume**

The organ is responsible for:
1. Creating `OrganSeed` from `seed` prop
2. Deriving all properties (semantic + decorative)
3. Exposing them as CSS custom properties with `--{organ}-{property}` naming
4. Genes reference these variables in their styles

This maintains the "seed identity" rule: same seed → same CSS variable values → same visual expression.

## Context & Constraints

### What We Know

- orgui already has `OrganContext` for shared state — seed fits naturally here
- Svelte 5 runes make reactive derivation clean: `$derived(deriver.derive(...))`
- The metaphor aligns: genome (genes) + environment (seed) = phenotype (visual)
- Consumer can pass seed as string (collection ID) or number (explicit)
- **Location**: `circulari.ty/o19/packages/orgui/`

### Unknowns / Risks

- **Performance**: Deriving many properties on every render? Mitigation: memoization in `PropertyDeriver`
- **SSR compatibility**: Seed must be consistent server/client. Mitigation: source string hashing is deterministic
- **Accessibility**: Decorative variation shouldn't hide function. Mitigation: semantic properties are consumer-controlled

### Related Work

- **orgui gene system** — Property definitions extend existing gene architecture
- **Lichenous organ** — First testbed for seed system
- **THEORY-003: Stream Layers** — Seed is the "substrate" layer of variation

## The Plan

### Phase 1: Seed Foundation — Core Utilities

**Success criteria:** Can create `OrganSeed` and derive deterministic values

- [ ] Create `tissue/seed.ts` with `OrganSeed` class
  - [ ] String hash to 0-1
  - [ ] `random()`, `range()`, `intRange()`, `choice()`, `bool()`
  - [ ] LCG for reproducibility
- [ ] Create `tissue/derive.ts` with `PropertyDeriver`
  - [ ] `derive(name, definition)` — explicit OR seed
  - [ ] `deriveMany(definitions)` — batch
  - [ ] Memoization for performance
- [ ] Add seed to `OrganContext`
  - [ ] `seed: OrganSeed` property
  - [ ] `derive()` helper method

### Phase 2: Lichenous Expression — First Organ

**Success criteria:** Lichenous visually varies by seed, accepts property overrides

- [ ] Define `LichenousProperties.ts`
  - [ ] Semantic: `containment`, `densityResponse`, `timeSense`
  - [ ] Decorative: `lobeCount`, `edgeTurbulence`, `warmth`, `porosity`, `metabolism`, `glowPattern`
  - [ ] Compute functions for each
- [ ] Update `Lichenous.svelte`
  - [ ] Accept `seed` prop
  - [ ] Accept `properties` prop (overrides)
  - [ ] Use `derive()` for all variable properties
  - [ ] **Apply to CSS variables** (critical: `--lichen-*` vars for genes)
- [ ] Update garden demo
  - [ ] Show same seed = same expression
  - [ ] Show different seeds = different expressions
  - [ ] Show property overrides work

### Phase 3: Germinal & Rhizomatic — Extend to All Organs

**Success criteria:** All three organs use seed system consistently

- [ ] Germinal properties
  - [ ] Semantic: `germinationSpeed`, `shellHardness`
  - [ ] Decorative: `crackPattern`, `emergenceDirection`, `glowIntensity`
- [ ] Rhizomatic properties
  - [ ] Semantic: `networkTopology`, `absorptionRate`
  - [ ] Decorative: `veinDensity`, `pulseRhythm`, `hyphalColor`
- [ ] Update garden with "organ family" demo
  - [ ] Related seeds look related (visual family resemblance)

## Success Criteria (Overall)

- [ ] Can create two Lichenous with same seed = identical visual expression
- [ ] Can create two Lichenous with different seeds = different but same-species look
- [ ] Can override semantic property = consumer intent respected
- [ ] Can leave decorative as 'seed' = serendipitous variation
- [ ] **CSS variables are generated** — genes consume `--lichen-*` / `--germinal-*` / `--rhizomatic-*`
- [ ] Performance: Derivation doesn't cause visible lag (memoized)
- [ ] Garden demo shows all three organs with seed variation
- [ ] `gene-edge-lobed` shows varied border-radius per seed

## The Property Taxonomy (Key Insight)

```typescript
// Semantic = meaningful to function, consumer should control
containment: 'cradle' | 'nest' | 'canopy' | 'carpet'
// → How the container holds contents
// → Consumer likely has opinion: "my precious memories need a nest"

// Decorative = pure visual delight, seed can surprise
glowPattern: 'pulse' | 'breathe' | 'shimmer' | 'steady'
// → How light emission animates
// → Any is fine, seed chooses for uniqueness
```

**The Rule:** If changing the property would change how the user *interacts* with the organ, it's semantic. If it only changes how it *looks*, it's decorative.

## API Design (Target)

```svelte
<!-- Consumer usage -->
<Lichenous 
  seed="user-42-work-notes"  <!-- Determines decorative properties (CSS vars) -->
  properties={{
    containment: 'nest',     <!-- Explicit: semantic -->
    timeSense: 'linear',     <!-- Explicit: semantic -->
    // lobeCount omitted = seed-derived: decorative → becomes --lichen-lobe-count
    // warmth omitted = seed-derived: decorative → becomes --lichen-warmth
  }}
/>

<!-- Result: each instance has unique but consistent CSS variable values -->
<!-- gene-edge-lobed sees different --gene-edge-lobed-count per seed -->
```

## Conservation Notes

**What must be remembered:**

- Seed is NOT random — it's deterministic from source (reproducible)
- Property definitions separate semantic (consumer-controlled) from decorative (seed-controlled)
- The metaphor: genome (genes) + environment (seed) = phenotype (expression)
- "Seed" can be collection ID, timestamp, content hash — any string that gives identity
- **CSS variable bridge is critical** — organs expose `--{organ}-{property}`, genes consume `--gene-{name}-{subprop}`

**Questions to resolve:**

- Should we provide `deriveSeedFromContent(items)` helper? (Probably yes, in Phase 2)
- How to document which properties are semantic vs decorative? (JSDoc tags?)
- Should seed affect animation timing or just static visual? (Start with static, add temporal later)

## Open Design: Content-Derived Seeding

Future enhancement (not in scope but designing for it):

```typescript
// Derive seed from content characteristics
function deriveSeedFromContent(items) {
  const count = items.length;
  const ageRange = max(ages) - min(ages);
  const typeMix = items.map(i => i.type).join('');
  return `lichen:${count}:${ageRange}:${hash(typeMix)}`;
}

// Content density affects densityResponse (semantic)
// Content mix affects seed-derived decoration (decorative)
```

---

*Created: 2026-03-15T23:45:00+01:00*  
*Stream: unfold*  
*Target: o19/packages/orgui/*  
*Spiraling toward: visual identity through epigenetic variation*
