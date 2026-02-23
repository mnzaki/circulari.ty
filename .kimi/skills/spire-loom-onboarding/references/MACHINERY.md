# The Machinery (Reference)

> *"The loom that weaves code from threads of intention."*

## The Weaving Process

The loom operates through distinct phases:

### 1. Reed — *The Comb*

Before weaving begins, the reed scans the workspace to understand what packages exist, their relationships, and where generated code should go. Like its physical counterpart that spaces and guides the warp threads, the reed organizes the structural foundation.

### 2. Heddles — *The Frames*

The heddles raise and lower warp threads to create patterns. They match spiral patterns from your WARP.ts to the appropriate code generators. Which rings need which generators? The heddles know.

**WeavingPlan (Intermediate Representation)**:
```typescript
{
  edges: SpiralEdge[];           // All edges in the spiral graph
  nodesByType: Map<string, SpiralNode[]>;  // Nodes grouped by type
  managements: ManagementMetadata[];  // Management Imprints from loom/
  tasks: GenerationTask[];       // Matched generator tasks
  _isComplete: boolean;          // Safety flag
}
```

### 3. Bobbin — *The Spool*

The bobbin holds the thread—the templates and intermediate representations that will become code. EJS templates, cached IR, transformation rules... all wound neatly, ready to be carried through the warp.

**Template Naming Convention (Double Extension)**:
```
{name}.{transform}.{lang}.ejs
```

| Pattern | Extension | Meaning | Transformation |
|---------|-----------|---------|----------------|
| `service.kt.ejs` | `.kt` | Kotlin | `transformForKotlin()` |
| `platform.rs.ejs` | `.rs` | Pure Rust | `transformForRust()` |
| `jni_bridge.jni.rs.ejs` | `.jni.rs` | Rust JNI | `transformForRustJni()` |
| `interface.aidl.ejs` | `.aidl` | AIDL | `transformForAidl()` |

### 4. Shuttle — *The Carrier*

The shuttle is where the actual work happens. It carries thread (code) back and forth through the warp, leaving behind files, configurations, and structure.

**Tools**:
| Tool | Purpose | File |
|------|---------|------|
| **File System** | Creates directories and files | `file-system-operations.ts` |
| **Package Manager** | Ensures packages exist | `workspace-package-manager.ts` |
| **Dependencies** | Adds Cargo/npm dependencies | `dependency-manager.ts` |
| **Templates** | Renders EJS to code | `template-renderer.ts` |
| **Configuration** | Writes TOML, JSON, XML configs | `configuration-writer.ts` |

**Idempotency**: All shuttle operations are safe to run again and again.

### 5. Beater — *The Packer*

After each pass of the shuttle, the beater packs the weft tight. In code terms: formatting. prettier, rustfmt, consistent style.

### 6. Treadles — *The Pedals*

The treadles are the high-level phases of generation:

| Pedal | Phase | Generates |
|-------|-------|-----------|
| 🥁 | `core-generator.ts` | Rust traits, domain types |
| 🎸 | `platform-generator.ts` | Android services, Desktop direct |
| 🎹 | `tauri-generator.ts` | Commands, permissions, platform traits |
| 🎺 | `ddd-generator.ts` | TypeScript domain types, Port interfaces |
| 🎻 | `adaptor-generator.ts` | Drizzle ORM implementations |

**The Weaver's Dance**:
```
Core → Platform → Tauri → DDD → Adaptors
```

### 7. Sley — *The Threading*

The sley resolves bindings—where does the front-end find its adaptor? Where do read operations go versus write operations?

**Method Pipeline**:
```
Management Imprint (loom/bookmark.ts)
    ↓
Raw MgmtMethod[] (from inner ring)
    ↓
Translation Layer 1: addManagementPrefix()  → "bookmark_add"
    ↓
Translation Layer 2: crudInterfaceMapping() → "create", "update"
    ↓
Filter (by tags)                            → exclude 'crud:read'
    ↓
Code Generation
```

## Temporal Constraints

### Phase 1: Heddles (Pattern Matching)
During this phase, the heddles analyze the WARP.ts structure and build the intermediate representation (`WeavingPlan`). 

**⚠️ CRITICAL CONSTRAINT:** Do not traverse `plan.nodesByType` during this phase. The plan is being constructed incrementally; accessing it during traversal will yield incomplete data.

### Phase 2: Weaver (Orchestration)
The weaver takes the completed plan and iterates over generation tasks.

### Phase 3: Treadles (Generation)
During this phase, treadles (generators) receive the complete `WeavingPlan` via `GeneratorContext`. Only now is it safe to traverse `plan.nodesByType`.

**The Rule:** The heddles determine *what* to generate; the treadles determine *how*—and may inspect the complete plan to do so.

## The Weaver

At the center of it all sits the **Weaver** (`machinery/weaver.ts`)—the operator who orchestrates the entire process:

```typescript
import * as warp from './loom/WARP.js';
import { Weaver } from '@o19/spire-loom/machinery/weaver';

const weaver = new Weaver(warp);
await weaver.weave(); // The loom awakens
```

## Where to Fix Problems

| Problem | Fix Location |
|---------|--------------|
| Type mapping wrong | `machinery/bobbin/type-mappings.ts` |
| Template structure wrong | `machinery/bobbin/templates/<platform>/*.ejs` |
| Method transformation wrong | `machinery/bobbin/code-generator.ts` |
| Platform-specific logic wrong | `machinery/treadles/<platform>-generator.ts` |
| WARP pattern matching wrong | `machinery/heddles/pattern-matcher.ts` |
