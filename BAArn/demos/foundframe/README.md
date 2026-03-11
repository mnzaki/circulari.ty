# 🦡 Foundframe Demo — Scrim-Loom Compatibility

This demo shows scrim-loom working as a **drop-in replacement** for spire-loom.

## The Setup

The WARP.ts file imports from `@o19/spire-loom`:

```typescript
// loom/WARP.ts
import loom, { rust } from '@o19/spire-loom';
```

But via a symlink in `node_modules/`, this actually loads `@o19/scrim-loom`:

```bash
node_modules/@o19/spire-loom → ../../../scrim-loom/dist
```

**Result:** Zero code changes, full Three Friends validation!

## Running the Demo

```bash
# From this directory
node --import=tsx test-import.ts
```

## What You'll See

```
🦡 Scrim: Spiral created from unknown layer (domain: app)
✅ WARP.ts loaded successfully!
✅ foundframe spiral exists
✅ TheStream class exists
✅ Foundframe can be instantiated
✅ fieldWrappers: ['Option', 'Mutex']
🦡 Scrim-Loom compatibility test complete!
```

The `🦡 Scrim:` log shows AAAArchi is active and validating!

## How It Works

1. **Symlink Magic**: `node_modules/@o19/spire-loom` points to scrim-loom's dist
2. **API Compatibility**: Scrim-loom re-exports all spire-loom APIs
3. **Transparent Validation**: Wrapped functions add AAAArchi checks
4. **Same Behavior**: Classes, decorators, spirals all work identically

## The WARP.ts File

This is an **exact copy** of `o19/crates/foundframe/loom/WARP.ts`:

```typescript
import loom, { rust } from '@o19/spire-loom';

export class TheStream extends rust.Struct {}
export class DeviceManager extends rust.Struct {}

export class Foundframe extends rust.Struct {
  @rust.Mutex
  @rust.Option
  thestream = new TheStream();

  @rust.Mutex
  @rust.Option
  device_manager = new DeviceManager();
}

export const foundframe = loom.spiral(Foundframe).tieup({
  treadles: [ { treadle: dbBindingTreadle, config: {} } ]
});
```

**Not a single character changed!** Yet it's running through scrim-loom with validation.

## Three Friends in Action

- 🦏 **AAAArchi**: Detects file scope, validates spiral creation
- 🦀 **Ferror**: Will provide rich errors if violations occur
- 🐋 **Orka**: Will handle saga compensation on weaving failures

---

*Drop-in replacement achieved. The warthog validates while the spire weaves.* 🦡🌾
