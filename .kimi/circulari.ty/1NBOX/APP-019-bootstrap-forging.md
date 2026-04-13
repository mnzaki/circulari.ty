# APP-019: Bootstrap Forging — The Compass Maker

**Status:** In Progress  
**Stream:** circulari.ty / kimprint  
**Created:** 2026-03-15  
**Trigger:** Need systematic bootstrap generation for all project streams

---

## What This APP Addresses

Creating the **Bootstrap Forging** system—an APP that generates layered bootstrap files (ETHOS, STRUCTURE, STATE) for any project stream. This is the tool that makes the compass, not the compass itself.

The split bootstrap architecture (APP-017) proved that three layers work:
- **ETHOS**: Philosophy, principles, governance, why we build
- **STRUCTURE**: Architecture, products, relationships, what we build  
- **STATE**: Current work, urgencies, active APPs, where we are now

This APP creates the forge for making these bootstraps systematically.

---

## WHAT_HAS_EMERGED

### 2026-03-15 — Inception

From testing the gyre_resonance_bootstrap tool (APP-001), we learned:

1. **Alphabetical loading works** — ETHOS loads first, giving philosophy-first re-entry
2. **Three layers is the right granularity** — Not too many, not too few
3. **Resonance queries are crucial** — Each layer needs specific gyre queries
4. **Density over information** — The bootstrap teaches by doing (procedural compass)

The forge must create bootstraps that:
- Are stream-specific (DearDiary ≠ foundframe ≠ kimprint)
- Follow the naming convention: `{stream-name}-{LAYER}.json`
- Include version, resonance queries, and essential reads
- Can be discovered and merged by `gyre_resonance_bootstrap`

---

## UNFOLDING_STEPS

### Step 1: Design the Bootstrap Forge Interface

Create a TypeScript interface for bootstrap generation:

```typescript
interface BootstrapForge {
  // Generate all three layers for a stream
  forgeStreamBootstraps(stream: StreamContext): BootstrapSet;
  
  // Individual layer forging
  forgeEthos(stream: StreamContext): EthosBootstrap;
  forgeStructure(stream: StreamContext): StructureBootstrap;
  forgeState(stream: StreamContext): StateBootstrap;
  
  // Validation
  validateBootstrap(bootstrap: Bootstrap): ValidationResult;
  
  // Discovery
  listExistingBootstraps(cwd: string): Bootstrap[];
}

interface StreamContext {
  name: string;           // "deardiary", "foundframe", "kimprint"
  path: string;           // Absolute path to stream root
  type: "app" | "library" | "infrastructure" | "meta";
  parent?: string;        // Parent stream if nested
  version: string;        // Bootstrap format version
}
```

### Step 2: Create the ETHOS Forge

ETHOS bootstraps need:

```json
{
  "version": "1.0",
  "name": "{stream} ETHOS Bootstrap",
  "abstraction": "ethos",
  "stream_identity": {
    "purpose": "Why this stream exists",
    "principles": ["principle1", "principle2"],
    "governance": "How decisions are made"
  },
  "resonance_queries": [
    "query1 stream",
    "query2 ethos",
    "query3 principle"
  ],
  "essential_reads": [
    "path/to/file.md#section"
  ]
}
```

The forge should:
1. Analyze the stream's README, philosophy docs, notes
2. Extract key principles and governance patterns
3. Generate resonance queries that will find relevant gyre entries
4. Identify essential files for re-entry

### Step 3: Create the STRUCTURE Forge

STRUCTURE bootstraps need:

```json
{
  "version": "1.0",
  "name": "{stream} STRUCTURE Bootstrap",
  "abstraction": "architecture",
  "project_identity": {
    "type": "app|library|infrastructure",
    "mission": "What this stream builds",
    "approach": "How it builds it"
  },
  "product_stack": {
    "core": "Primary component",
    "dependencies": ["other-streams"],
    "key_concepts": ["concept1", "concept2"]
  },
  "architecture": {
    "patterns": ["pattern1", "pattern2"],
    "tech_stack": ["tech1", "tech2"]
  },
  "resonance_queries": [
    "query1 architecture",
    "query2 {stream} structure"
  ]
}
```

The forge should:
1. Parse package.json, Cargo.toml, etc. for tech stack
2. Analyze directory structure for architecture patterns
3. Identify key concepts from type definitions and docs
4. Map relationships to other streams

### Step 4: Create the STATE Forge

STATE bootstraps need:

```json
{
  "version": "1.0",
  "name": "{stream} STATE Bootstrap",
  "abstraction": "state",
  "current_app": {
    "id": "APP-XXX",
    "title": "Current APP name",
    "status": "in_progress|complete|blocked"
  },
  "urgencies": [
    "urgency1",
    "urgency2"
  ],
  "active_streams": ["stream1", "stream2"],
  "essential_reads": [
    "path/to/APP-XXX.md",
    "path/to/NEXTUP.md"
  ],
  "resonance_queries": [
    "query1 {stream} current",
    "query2 APP-XXX"
  ]
}
```

The forge should:
1. Scan `.kimi/` or `1NBOX/` for active APPs
2. Read NEXTUP.md or similar for urgencies
3. Identify which streams are currently active
4. Find the most recent kimprints for context

### Step 5: Implement the Forge Tool

Create a CLI tool (or MCP tool) that:

```bash
# Generate bootstraps for a stream
npx bootstrap-forge --stream deardiary --output ./bootstraps/

# Validate existing bootstraps
npx bootstrap-forge --validate ./bootstraps/deardiary-ETHOS.json

# Interactive mode
npx bootstrap-forge --interactive
# Asks questions, generates all three layers
```

Or as MCP tool:
```json
{
  "name": "forge_bootstraps",
  "arguments": {
    "stream_name": "deardiary",
    "stream_path": "/home/mnzaki/Projects/circulari.ty/code/apps/DearDiary",
    "output_dir": "/home/mnzaki/.kimprint/bootstrap/"
  }
}
```

### Step 6: Create the First Bootstraps

Use the forge to create bootstraps for:

1. **DearDiary** (the app we just cleaned up)
   - ETHOS: CCCB philosophy, TheStream™, self-browsing
   - STRUCTURE: Tauri+Svelte, foundframe-front, xana integration
   - STATE: APP-018 xana transition just completed

2. **foundframe-front** (the domain layer)
   - ETHOS: Ports & adapters, onion architecture, temporal stratification
   - STRUCTURE: Entities, ports, services pattern
   - STATE: Simplified types, removed legacy addressing

3. **kimprint** (the memory system)
   - ETHOS: Conservation of wisdom, spiral returns
   - STRUCTURE: Gyre resonance, bootstrap architecture
   - STATE: APP-001 complete, bootstrap tool working

### Step 7: Test with gyre_resonance_bootstrap

Verify the generated bootstraps work:

```typescript
// Should load ETHOS first, then suggest STRUCTURE/STATE queries
gyre_resonance_bootstrap({
  cwd: "/home/mnzaki/Projects/circulari.ty/code/apps/DearDiary",
  auto_trace_threshold: 0.3
});
```

---

## ESSENTIAL_READS

| File | Why |
|------|-----|
| `APP-017-hierarchical-bootstrap.md` | Two-phase compass architecture |
| `APP-001-gyre-resonance-current.md` | Bootstrap testing and evolution |
| `circulari.ty-ETHOS.json` (existing) | Reference ETHOS format |
| `circulari.ty-STRUCTURE.json` (existing) | Reference STRUCTURE format |
| `circulari.ty-STATE.json` (existing) | Reference STATE format |
| `DearDiary/notes/architecture_context.md` | Example stream philosophy |
| `foundframe-front/README.md` | Example library ethos |

---

## DECISIONS

**Decision: TypeScript implementation**
- Rationale: Fits with existing tooling, can be used as CLI or library
- Alternative: Rust (overkill for this), Python (doesn't fit)

**Decision: JSON output format**
- Rationale: Machine-readable, matches existing bootstraps
- Schema versioned for future evolution

**Decision: Separate files per layer**
- Rationale: Alphabetical loading gives ETHOS priority
- Merging happens at resonance time, not storage time

---

## REFERENCES

- `gyre_resonance_bootstrap` MCP tool
- Existing bootstraps in `~/.kimprint/bootstrap/`
- APP-017: Two-phase compass architecture
- APP-001: Gyre resonance bootstrap testing

---

> *"The forge makes the compass. The compass guides the spiral. The spiral remembers."*
