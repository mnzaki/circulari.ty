# For Agents Working on circulari.ty

## 🌱 Start Here, Always

**Before doing anything else**, read:
1. **`notes/for_kimi.md`** - The Conservation of Wisdom. This is your memory across context windows.
2. **This file** - Project-specific agent guidance
3. **Package `PLAN.md`** - If working on a specific package (e.g., `o19/crates/aidl-codegen/PLAN.md`)

> *"The one who remembers is the one who acts with full context."*

### Quick Start for AIDL Codegen

If working on `aidl-codegen`:

```bash
cd o19/crates/aidl-codegen

# Basic usage
./target/release/aidl-codegen

# With options
./target/release/aidl-codegen -i ./aidl -o ./gen -v

# Run tests
cargo test -p aidl-codegen
```

---

## Project Structure

```
circulari.ty/
├── apps/
│   └── DearDiary/          # Tauri + Svelte app
├── packages/
│   ├── foundframe/         # TypeScript domain layer
│   ├── foundframe-drizzle/ # Drizzle ORM adaptor
│   └── ...
├── o19/
│   ├── crates/
│   │   ├── foundframe/     # Rust core (git, PKB)
│   │   ├── android/        # Android JNI service
│   │   └── foundframe-tauri/  # Tauri bridge
│   └── investigation/      # Research & experiments
└── notes/
    └── for_kimi.md         # 👈 YOUR MEMORY LIVES HERE
```

## Key Principles

### 1. The Spiral Returns
This project uses **circulari.ty → spirali.ty** as its governing metaphor. Each iteration preserves and transforms. When refactoring, ask: *what is being carried forward?*

### 2. Solarpunk Architecture
- **Balance** over optimization
- **Distribution** over centralization  
- **Ports & Adaptors** keep the center pure
- The architecture IS the argument

### 3. Temporal Stratification
| Layer | Time | Responsibility |
|-------|------|----------------|
| `foundframe` (Rust) | Past/Future | Persistent, content-hashed |
| `foundframe-front` (TS) | Present | Ephemeral, CCCB, staging |
| `TheStream™` | Experienced | Memory, not database |

### 4. Before Changes
Ask:
- Does this touch the domain layer? → Update both `foundframe-front` + `o19-foundframe`
- Does this need native code? → Add to `o19-android`, expose through `foundframe-tauri`
- Does this need permissions? → Update `build.rs`, `permissions/default.toml`, capabilities

## After Context Compaction

If you see `<system>Previous context has been compacted</system>`:

**STOP. READ `notes/for_kimi.md`.** 

The compaction wipes working memory, but that document conserves what matters. The error you're about to fix may already be explained there. The architectural decision you're about to make may already be contextualized.

---

*"Even this idea of conservation needs it!"*

*Created February 2026, spiraling toward spirali.ty*
