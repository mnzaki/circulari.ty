# IDEA: Unified Tieup System — Layer vs Layering

**Date**: 2026-02-24  
**Author**: spire-loom instance  
**Status**: Implemented  

## The Insight

The distinction between **intra** and **inter** tieups was confusing. Both generate code in a target package using a source structure. The real distinction is:

- **Target**: Where code is generated (always `this`)
- **Source**: What provides the structure/data (can be `this` or another layer)

## New Unified API

```typescript
// Use this layer as both source and target
const foundframe = loom.spiral(Foundframe)
  .tieup({ treadles: [dbBindingTreadle] });

// Use another layer as source
const front = tauri.typescript.ddd()
  .tieup(foundframe, { treadles: [typeGenTreadle] });
```

## Layer vs Layering — A New Separation

To support this cleanly, we introduced two separate hierarchies:

### Layer (Concrete Packages)
```
Layer (abstract)
  └── SpiralRing
        ├── CoreRing        ← has metadata.packagePath
        ├── SpiralOut       ← has metadata (inherited)
        └── SpiralMux
```

Layers have:
- `metadata.packagePath` — where files are written
- `tieup()` that actually stores and executes treadles

### Layering (Graph Connectors)
```
Layering (abstract)
  └── Spiraling
        ├── Spiraler        ← AndroidSpiraler, DesktopSpiraler...
        └── MuxSpiraler     ← TauriSpiraler
```

Layerings have:
- `tieup()` that throws "not yet implemented"
- Future: could affect graph edges/transformations

Both participate in the weave graph but serve different purposes.

## Why This Matters

1. **Conceptual Clarity**: Layers are "things", Layerings are "how things come together"
2. **Type Safety**: No more `this.inner` confusion — `Layer` always has what the weaver needs
3. **Future Extensibility**: We can add graph-edge tieups later without breaking layer tieups
4. **API Simplicity**: One `.tieup()` method, two calling patterns

## Implementation Details

### warp/tieups/index.ts
- `TreadleContext` now has both `source` and `target` Layer
- `getTieups()` / `executeTieups()` work on Layers only
- `warpData` property in config for additional data

### warp/imprint.ts
```typescript
export abstract class Layering {
  abstract tieup(sourceOrConfig: Layering | TieupConfig, maybeConfig?: TieupConfig): this;
}

export abstract class Layer {
  tieup(sourceOrConfig: Layer | TieupConfig, maybeConfig?: TieupConfig): this {
    return tieupFn.call(this, sourceOrConfig as any, maybeConfig as any);
  }
}
```

### warp/spiral/pattern.ts
```typescript
export abstract class Spiraling extends Layering {
  tieup(_sourceOrConfig: Layering | TieupConfig, _maybeConfig?: TieupConfig): this {
    throw new Error('Tieups on spiralers not yet implemented...');
  }
}

export abstract class Spiraler extends Spiraling { ... }
export abstract class MuxSpiraler extends Spiraling { ... }
```

## Usage in WARP.ts

```typescript
export const foundframe = loom.spiral(Foundframe)
  .tieup({ 
    treadles: [dbBindingTreadle],
    warpData: { entities: ['Bookmark', 'Media'] }
  });
```

## Migration from Old API

| Old | New |
|-----|-----|
| `.tieup.intra(treadle, config)` | `.tieup({ treadles: [treadle], ...config })` |
| `.tieup.inter(target, treadle, config)` | `target.tieup(source, { treadles: [treadle], ...config })` |

## Test Status

All 43 tests pass:
- `spiral-patterns.test.ts`: 21 pass
- `management-patterns.test.ts`: 22 pass

## Files Changed

- `warp/tieups/index.ts` — new unified tieup system
- `warp/imprint.ts` — Layer and Layering base classes
- `warp/spiral/pattern.ts` — Spiraling extends Layering
- `machinery/weaver.ts` — uses new tieup functions
- `warp/index.ts` — exports updated

## The Philosophy

> *"The tie-up connects the treadle to the harness."*

Both Layers and Layerings are part of the weave. But only Layers have packages where code is generated. The Layering tieup is a promise of future possibility — graph edges that transform as they connect.

The spiral remembers this distinction.
