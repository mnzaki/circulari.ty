# Spire-Loom Glossary (Reference)

> *"The words we use shape the architecture we build."*

## Core Concepts

### Loom
**Technical**: The package `@o19/spire-loom` that exposes weaving patterns. The tool that holds patterns (spiral, circular, vertical, etc.).
**Metaphor**: The weaver's tool; tension and structure; the frame that enables creation.
**Usage**: `import loom from '@o19/spire-loom'` gives access to patterns via `loom.spiral()`, `loom.circular()`, etc.

### Spiral
**Technical**: A pattern exposed by the loom—unfolding from a compact definition into full implementation across layers.
**Metaphor**: The nautilus shell, DNA's helix, galaxies, fern fronds—patterns of growth that preserve structure while expanding.
**Usage**: `loom.spiral()` creates a SpiralRing. `loom.spiral(android, desktop)` creates a SpiralMux that aggregates multiple rings.

### SpiralMux
**Technical**: A special SpiralOut that wraps multiple inner rings, enabling platform aggregation.
**Metaphor**: A crossroads where multiple paths converge; a router that directs based on destination; a heart with multiple chambers.
**Usage**: `spiral(android, desktop).tauri.plugin()` creates Tauri that routes to Android on mobile and Desktop on desktop.

### Surface
**Technical**: The executable definition layer—the place where architecture (WARP.ts) and domain contracts (bookmark.ts) are defined. All surface files run to construct the spiral graph and register metadata.
**Metaphor**: The surface of water, where above and below meet; the face of a crystal; the interface between self and world.
**Note**: Unlike traditional "metadata" that is only parsed, surface files are **executed**—decorators like `@reach` and `@crud` run and attach metadata.

### Spire
**Technical**: A concrete, generated artifact in the spiral—one step in the unfolding.
**Metaphor**: The tapering tower of a cathedral; organic growth reaching upward while rooted below.

### Bloom
**Technical**: The moment of code generation—when a compact definition unfolds into its full implementation.
**Metaphor**: A flower opening; potential becoming actual.

### DDD (Domain-Driven Design Layer)
**Technical**: A kind of spiraling that generates domain types and Port interfaces from Management Imprints.
**Metaphor**: The cell membrane—selectively permeable, defining what enters and exits.

### Adaptor
**Technical**: A concrete implementation of DDD Port interfaces—bridging the abstract domain contract to a specific technology.
**Metaphor**: The hand that grasps—the same intention, different implementations.

## Structural Terms

### Ring
**Technical**: A layer in the architecture—each Ring corresponds to exactly one package.
**Metaphor**: The rings of a tree (revealing age and growth); concentric ripples; orbital paths.
**Constraint**: Each Ring lives in exactly one package.

### Core
**Technical**: The innermost Ring—the domain logic that all other Rings call into.
**Metaphor**: The heart; the seed; the center that holds.

### Management
**Technical**: A vertical domain concern—an entity and its operations that span all Rings.
**Metaphor**: To manage is to care for; stewardship; governance without control.

### Management Imprint
**Technical**: The surface definition of a Management—the shape it impresses upon each Ring.
**Metaphor**: A fossil leaves an imprint in each layer of rock; a seal presses its form into wax.
**Syntax**: 
```
@reach Global
abstract BookmarkMgmt {
  VALID_URL_REGEX = /^https?:\/\/.+/
  addBookmark(url: string, title?: string): string
}
```

## Process Terms

### Spiral Out
**Technical**: The function that initiates generation from a Ring.
**Metaphor**: Growth that preserves—each turn of the spiral echoes the last.

### Reach
**Technical**: The scope of a Management—how far up the spiral it extends.
- **Private**: Core only (internal state)
- **Local**: Platform and below
- **Global**: Interface and Front (network/world)

### Unfold
**Technical**: The transformation from definition to implementation.
**Metaphor**: Paper folding (origami)—a compact form containing multitudes.

## Architectural Patterns

### The Bottleneck
**Technical**: The pattern where multiple Managements converge into a single service interface, then diverge again.
**Metaphor**: An hourglass; a river delta in reverse; a symphony's conductor.

### Conservation of Contract
**Technical**: The principle that a single definition (surface) generates all bindings.
**Metaphor**: Energy conservation; the hermetic principle of correspondence.
**Usage**: *"Define once, bloom everywhere."*

## Naming Principles

1. **Prefer concrete over abstract**: `foundframe-android` not "Binding"
2. **Prefer organic over mechanical**: "bloom" not "instantiate"
3. **Prefer active over passive**: "spiral out" not "is generated"
4. **Preserve metaphorical resonance**: Each term should evoke the solarpunk aesthetic
