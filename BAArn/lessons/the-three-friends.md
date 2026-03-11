# LESSON: The Three Friends

> *"Alone we validate. Together we weave."*

## Who Are The Three Friends?

The Three Friends are the foundation of the Barn Architecture Academy:

| Friend | Package | Role | Mascot |
|--------|---------|------|--------|
| **AAAArchi** | `@o19/aaaarchi` | Architecture mapping & DAG validation | 🦏 Aardvark |
| **Ferror** | `@o19/ferror` | Rich error context & suggestions | 🦀 Crab |
| **Orka** | `@o19/orka` | Saga orchestration & resilience | 🐋 Orca |

## The Metaphor

Each friend embodies a principle:

- 🦏 **AAAArchi** (The Aardvark) — *Digs deep, maps structure, knows the territory*
  - Like an aardvark digging tunnels, AAAArchi traces paths through code
  - Validates: "Can this layer call that layer?"
  - Remembers: "What have we tried before?"

- 🦀 **Ferror** (The Crab) — *Carries context on its back, points the way*
  - Like a crab carrying its shell, Ferror carries error context
  - Enriches: "Not just 'error' but 'here's why and how to fix'"
  - Connects: "This error relates to that architectural decision"

- 🐋 **Orka** (The Orca) — *Coordinates the pod, orchestrates complex moves*
  - Like an orca pod hunting together, Orka coordinates operations
  - Orchestrates: "Step 1 → Step 2 → Step 3, with rollback if needed"
  - Resilient: "Try again, or escalate, based on history"

## How They Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CODE                                │
│  @rust.Struct  @scrim.Service  @ferror.wrap                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ decorators collect metadata
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 🦏 AAAARCHI (Foundation)                    │
│                                                             │
│  Scope: domain='core', layer='infrastructure'               │
│  Annotations: { struct: Foundframe, wrappers: [...] }       │
│  DAG: controller → service → repository → infrastructure    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ validation fails
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 🦀 FERROR (Context)                         │
│                                                             │
│  Error: "Service cannot directly call Infrastructure"       │
│  Explanation: "Missing repository layer in call chain"      │
│  Suggestions: [                                             │
│    "Add BookmarkRepository between service and DB"          │
│    "Or change architecture to allow direct calls"           │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ retry with compensation
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 🐋 ORKA (Resilience)                        │
│                                                             │
│  Saga: Validation → Generation → Write                      │
│  If write fails:                                            │
│    1. Delete generated file (compensate)                    │
│    2. Revert metadata (compensate)                          │
│    3. Log attempt history (for next retry)                  │
└─────────────────────────────────────────────────────────────┘
```

## Where They Live

The Three Friends are **production packages** in o19:

```
o19/packages/
├── aaaarchi/          # 🦏 Foundation layer
├── ferror/            # 🦀 Error context
├── orka/              # 🐋 Orchestration
└── spire-loom/        # 🌾 Separate weaving system
```

## BAArn Demos Use The Friends

The Barn Architecture Academy **uses** the Three Friends in its demos:

- **`demos/scrim-loom/`** — Shows AAAArchi + Ferror + Orka working with spire-loom
- **`experiments/deferred-value/`** — Uses the friends for multi-pass computation
- **`lessons/the-diviner-pattern/`** — Teaches patterns that friends enable

## AAAArchi: The Foundation

🦏 **AAAArchi** (Architecture Annotating Aardvark Archi) provides:

### 1. File Scope Detection
```typescript
// Get architectural context for current file
const scope = AAAArchi.forFile(import.meta.url);
const ctx = scope.getContext();
// { domain, layer, canDependOn, invariant, file }
```

### 2. Annotation Collection
```typescript
// Decorators register metadata
scope.annotate(myClass, {
  function: 'MyClass',
  context: { type: 'service', layer: 'service' },
  tags: ['service', 'bookmark']
});
```

### 3. DAG Validation
```typescript
// Validate layer transitions
scope.canCall('repository'); // true/false

// Validate full paths
AAAArchi.validatePath(['controller', 'repository']);
// [{ violation: 'layer-skip', fix: 'Add service layer' }]

// Build project DAG
const dag = AAAArchi.buildProjectDAG();
// { nodes, edges, violations }
```

### 4. The Declarative → Imperative Pattern

Like spire-loom's language system, AAAArchi uses two layers:

```typescript
// LAYER 1: Declarative (Schema)
const architecture = {
  layers: {
    controller: { canDependOn: ['service'] },
    service: { canDependOn: ['repository'] },
    repository: { canDependOn: ['infrastructure'] }
  }
};

// LAYER 2: Imperative (Runtime)
const imperative = compileToImperative(architecture);
imperative.canCall('service', 'repository'); // true
```

## Ferror: The Context Carrier

🦀 **Ferror** provides rich error context:

```typescript
import { ferroringModule } from '@o19/ferror';

// Create bound ferror for domain:layer
const ferror = ferroringModule().bookmark.service;

throw ferror(new Error('Layer skip'), {
  function: 'BookmarkController.create',
  stance: 'authoritative',
  summary: 'Controller bypasses service layer',
  explanation: 'Direct repository calls violate onion architecture',
  suggestions: [
    { action: 'add-service', message: 'Create BookmarkService' },
    { action: 'view-dag', message: 'Run AAAArchi.buildProjectDAG()' }
  ],
  // domain/layer auto-resolved from AAAArchi!
});
```

## Orka: The Orchestrator

🐋 **Orka** provides saga-based resilience:

```typescript
import { Orka } from '@o19/orka';

const saga = Orka.saga({
  name: 'CodeGeneration',
  steps: [
    {
      name: 'parse',
      execute: async () => parseManagement(mgmt),
      compensate: async () => cleanupParse()
    },
    {
      name: 'generate',
      execute: async () => generateCode(),
      compensate: async () => deleteGeneratedFiles()
    }
  ]
});

await saga.execute({ maxAttempts: 3 });
```

## The Spiral Portal Connection

The **SPIRAL_PORTAL.md** in aaaarchi reveals a profound parallel:

| Spire-Loom | AAAArchi Parallel |
|------------|-------------------|
| Warp decorators | Warp decorators |
| Reed collection | File scope accumulation |
| Heddles pattern matching | DAG validation |
| Language declarative | Architecture schema |
| compileToImperative() | compileToImperative() |

Both systems discovered the **same two-layer pattern** independently:

> *"Structure is potential. Compilation makes it executable. Orchestration makes it resilient."*

## Using The Friends

### In BAArn Demos

```typescript
// From demos/scrim-loom/
import { AAAArchi } from '@o19/aaaarchi';
import { ferroringModule } from '@o19/ferror';
import { Orka } from '@o19/orka';

// AAAArchi validates
const scope = AAAArchi.forFile(import.meta.url);
if (!scope.canCall(targetLayer)) {
  // Ferror explains
  throw ferror(new Error('Invalid transition'), { ... });
}

// Orka orchestrates
Orka.saga({ steps: [...] }).execute();
```

### In Production

The friends are production-ready packages:

```bash
pnpm add @o19/aaaarchi @o19/ferror @o19/orka
```

## Conservation Notes

**What must be remembered:**
- The Three Friends are production packages, not BAArn experiments
- BAArn demos USE the friends to demonstrate integration
- Each friend has a distinct role: Foundation, Context, Resilience
- The two-layer pattern (declarative → imperative) appears in both spire-loom and AAAArchi

**Questions for future spirals:**
- How do the friends evolve as they mature?
- What new friends might join the trio?
- Can the friends work with other weaving systems beyond spire-loom?

---

*The barn is where we experiment. The friends guide our way.* 🦏🦀🐋
