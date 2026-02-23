---
name: spire-loom-onboarding
description: Onboard to spire-loom code generator projects within circulari.ty. Use when starting work on spire-loom specifically. IMPORTANT: This skill assumes circulari.ty-onboarding has already been applied (or apply it first!). This skill extends the spiral context into the weaving machinery—reed, heddles, bobbin, shuttle, beater, treadles, sley, weaver.
---

# Spire-Loom Onboarding — The Weaving Entry

> *"The loom weaves, the weaver guides. Never weave by hand what the loom can do."*
> *"Even this skill needs the spiral to conserve what matters."*

## ⚠️ Prerequisites: Circulari.ty Context First

**BEFORE using this skill**, ensure the `circulari.ty-onboarding` skill has been applied.

Spire-loom is the code generation tool FOR circulari.ty—it extends the spiral metaphor into:
- **Warp** → Your architectural intentions (`loom/WARP.ts`)
- **Weft** → The generated code
- **Surface** → Executable TypeScript that defines the domain
- **Spiral** → Patterns that unfold from compact definitions
- **Bloom** → The moment of code generation
- **Spire** → A concrete generated artifact

The solarpunk aesthetic continues here: organic metaphors (loom, weaving, growth, blooming), natural phenomena names (nautilus shells, DNA helices, tree rings), and language that evokes: *"The spire spirals upward from the foundation."*

## Onboarding Process

### Step 1: Read the Machinery Documentation (in order)

```
1. machinery/README.md           → Overview of the weaving process
2. machinery/*/README.md         → Each machinery component (7 parts)
3. DEV.md                        → Developer guide & principles
4. CODE_GENERATOR_DESIGN.md      → Architecture deep-dive
5. IMPLEMENTATION_PLAN.md        → Current status & roadmap
6. GLOSSARY.md                   → Terminology reference
```

**Why this order:** The machinery READMEs build understanding of the metaphor before diving into implementation.

### Step 2: Understand the Weaving Pipeline

| Component | Named After | Function |
|-----------|-------------|----------|
| **Reed** | The comb that spaces warp threads | Workspace discovery |
| **Heddles** | Frames that raise/lower threads | Pattern matching → WeavingPlan |
| **Bobbin** | Spool holding weft thread | Templates & IR storage |
| **Shuttle** | Carrier that flies through warp | File operations (actual weaving) |
| **Beater** | Packs weft tight | Code formatting |
| **Treadles** | Foot pedals | Generation phases (Core, Platform, DDD...) |
| **Sley** | Threading layer | Binding resolution |
| **Weaver** | The operator | Orchestrates everything |

### Step 3: Grasp Key Principles

1. **Generator is source of truth** — Never edit generated files directly
2. **All surface files are executable** — They run to build the spiral graph
3. **One imprint, many blooms** — Same definition, different substances
4. **Sync interfaces only** — Asyncness added per-ring by generators
5. **Ring = Package** — Each ring lives in exactly one package

### Step 4: Recognize the Spiral Architecture

```
Core (Rust) → Platform (Android/Desktop) → Tauri (multiplexer) → DDD → Adaptors
```

Each **ring** wraps the inner one. **Management Imprints** (like `BookmarkMgmt`) bloom across all rings they can **reach** (Private → Local → Global).

## Reference Documentation

See `references/` directory for:
- **GLOSSARY.md** — Full terminology reference
- **MACHINERY.md** — Detailed machinery documentation

## Starting Code Exploration

After reading docs, explore:

```
warp/                    → DSL patterns (spiral, imprint, crud)
machinery/               → The loom itself
├── reed/               → Workspace discovery
├── heddles/            → Pattern matching
├── bobbin/             → Templates
├── shuttle/            → File operations
├── treadles/           → Generators
└── weaver.ts           → Orchestration
```

## Running the Loom

### Basic Usage

```bash
cd o19
pnpm spire-loom
```

### With Options

```bash
# Generate for a specific package only
pnpm spire-loom --package <name>

# Debug output
DEBUG_MATRIX=1 pnpm spire-loom
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `warp/index.ts` | Main exports, spiral() function |
| `warp/spiral/index.ts` | Core spiral creation |
| `machinery/weaver.ts` | Entry point for generation |
| `cli.ts` | CLI entry point |

## The Connection to Circulari.ty

Spire-loom generates the code that implements the architecture described in `for_kimi.md`:
- **Foundframe** → Rust core generated from Managements
- **Foundframe-front** → TypeScript DDD layer from @reach decorators
- **Android** → JNI services from AndroidSpiraler
- **Tauri** → Commands and permissions from TauriSpiraler

The **warp** is for planning (what you import in `loom/WARP.ts`).
The **machinery** is for execution (what generates the code).
Both are runtime-executable—decorators attach metadata when files run.

> *"The generator reads what is, and unfolds what could be."*

---

*Spiraling from circulari.ty into spire-loom, conserving the pattern.* 🧵🌿
