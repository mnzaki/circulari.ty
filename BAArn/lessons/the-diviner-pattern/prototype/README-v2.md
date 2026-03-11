# Divination Engine v2 🌀

**Shape-driven round discovery with mejs re-rendering.**

> "Define shape, not computation."

## The Insight

Instead of defining explicit computation:
```typescript
// v1: Explicit transform
transform([a, b], (x, y) => x + y)
```

We define shape and let the system discover rounds:
```typescript
// v2: Shape-driven
const context = {
  sum: {
    _deferred: true,
    path: 'sum',
    _binding: async () => (await a) + (await b)
  }
};
// Template: "{{ sum }}" triggers resolution
```

## Files

| File | Purpose |
|------|---------|
| `DESIGN-v2.md` | Design document explaining the shift |
| `deferred-shape.ts` | Shape analysis and round discovery |
| `divination-provider.ts` | mejs-integrated rendering engine |
| `example-v2.ts` | Working demonstrations |
| `index-v2.ts` | Module exports |

## How It Works

```
User provides:
├── Template with {{ placeholders }}
├── Context with deferred values
│   └── Each has _binding: async () => T
└── Dependencies implicit in bindings

Provider does:
├── Pass 1: Render template → output has {{ placeholders }}
├── Extract placeholders from output
├── Resolve resolvable placeholders (call _bindings)
├── Re-render (output becomes new template)
└── Repeat until no placeholders
```

## Quick Example

```typescript
import { createDivinationProvider } from './index-v2.js';

const provider = createDivinationProvider();

const context = {
  user: {
    _deferred: true,
    path: 'user',
    resolved: false,
    _binding: async () => ({ name: 'Alice' }),
    toString() {
      return this.resolved 
        ? this.value.name 
        : `{{ ${this.path} }}`;
    }
  }
};

const result = await provider.render(
  'Hello {{ user }}!',
  context
);

console.log(result.output);  // "Hello Alice!"
console.log(result.passes);  // 2
```

## Running the Demo

```bash
cd /home/mnzaki/Projects/circulari.ty/o19/packages/spire-loom
npx tsx ../../BAArn/lessons/the-diviner-pattern/prototype/example-v2.ts
```

## Key Differences from v1

| Aspect | v1 (Explicit) | v2 (Shape-Driven) |
|--------|---------------|-------------------|
| User defines | `transform([a,b], fn)` | Shape + `_binding` |
| Round discovery | Explicit in code | From placeholder analysis |
| mejs integration | Separate phase | Core mechanism |
| Progress | Stub ID tracking | Placeholder re-rendering |

## The Aesthetic

> "The diviner describes what will be seen.
> The template fills itself."
