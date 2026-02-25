# Architectural Insights from spire-loom Bug Fixes

> Date: 2026-02-25
> Context: Debugging why android service generation wasn't working despite correct matrix matches

## The Core Discovery: SpiralOut vs Spiraler Distinction

During debugging, I discovered a fundamental mismatch in how the system was designed versus how it was being used:

### The Problem

When `current.ring` is passed to treadles, it's the **SpiralOut**, not the **Spiraler**. The spiraler is stored as a property on the SpiralOut (via `Object.assign` in the constructor).

```typescript
// In SpiralOut constructor:
Object.assign(this, spiralers);  // spiralers are attached as properties

// But `current.ring` IS the SpiralOut, not the spiraler!
// To access the spiraler:
const spiraler = (current.ring as any).spiraler;  // OR
const androidSpiraler = (current.ring as any).android;
```

### The Fix: treadleTag

We introduced `treadleTag` as the second argument to SpiralOut. This allows precise treadle matching:

```typescript
// Before (ambiguous):
matches: [{ current: 'RustAndroidSpiraler', previous: 'RustCore' }]

// After (precise):
matches: [{ current: 'RustAndroidSpiraler.foregroundService', previous: 'RustCore' }]
```

This means **different methods on the same spiraler can trigger different treadles**.

## GeneratorContext: Package-Awareness

The second major insight: treadles should NOT compute package paths. This belongs in the weaver.

### Before (treadle computing paths):
```typescript
data: (_context, current, previous) => {
  const paths = buildAndroidPackageData(metadata.packageName, gradleNamespace);
  return {
    packageDir: paths.packageDir,  // ❌ Treadle shouldn't know this
    // ...
  };
}
```

### After (context provides paths):
```typescript
// GeneratorContext now includes:
interface GeneratorContext {
  packagePath: string;  // e.g., 'crates/foundframe-android'
  packageDir: string;   // Full path to package
}

// Treadle just uses relative paths:
outputs: [{
  path: 'spire/src/lib.rs',  // ✅ Relative to package
}]
```

This ensures **one treadle = one package**, enforced by the architecture.

## The Validation Trap

The original `validate` function was checking:
```typescript
if (!(current.ring instanceof RustAndroidSpiraler)) return false;
```

But `current.ring` is a `SpiralOut`, not a `RustAndroidSpiraler`. The fix:
```typescript
const spiraler = (current.ring as any).spiraler;
if (!(spiraler instanceof RustAndroidSpiraler)) return false;
```

## Metadata Flow

We also fixed metadata derivation:

1. **RustCore/TsCore** set `{ language: 'rust'|'typescript' }` in constructor
2. **Heddles.ensureMetadata()** computes `packageName` and `packagePath` from export names
3. **loadWarp()** preserves explicit `.name` overrides from WARP.ts
4. **Weaver** uses metadata to set `context.packagePath` and `context.packageDir`

Priority for package name:
1. `layer.name` (if explicitly set in WARP.ts)
2. Export name from WARP.ts

## Key Architectural Principles

1. **Treadles are package-agnostic** - They write to relative paths
2. **Context provides package info** - Weaver prepends package directory
3. **treadleTag enables precise matching** - Different methods → different treadles
4. **Validation must check the right object** - SpiralOut contains the spiraler

## Future Considerations

The `spiralOut()` function is now a method on `Spiraler`:
```typescript
// In Spiraler base class:
spiralOut<O>(treadleTag: string, spiralers: O): SpiralOutType<O>

// Usage in spiraler methods:
return this.spiralOut('foregroundService', {});
```

This makes the API cleaner and enforces the treadleTag pattern.

---

*These insights emerged from hours of debugging why matrix matches were succeeding but no files were being generated. The root cause was always a mismatch between expected and actual object types in the spiral graph.*

*"The loom weaves, but only when the warp is dressed correctly."*
