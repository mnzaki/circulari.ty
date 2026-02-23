# kimprint: Action Plan Package (APP)

> *"Even this plan needs conservation."*

> **META-NOTE**: This file IS an APP (Action Plan Package). It demonstrates the very pattern it describes. When you implement Phase 10, you'll be building the `kimprint app create` command that generates files like this one. The spiral conserves its own structure.

## Before You Start - The Ritual

**STOP. DO THIS FIRST.**

1. **Invoke the circulari.ty-onboarding skill** - Always re-ground in the spiral ethos
2. **Read this entire plan** before writing any code
3. **Check off steps as you complete them** - conserve your own progress

---

## Phase 0: Bootstrap & Understanding (15 min)

### Step 0.1: Re-ground in Context
- [ ] Invoke `circulari.ty-onboarding` skill
- [ ] Verify you understand: The Imprint = MCP server + session watcher + conservation packets
- [ ] Check `~/.kimi/kimprint/` exists with this APP.md

### Step 0.2: Understand the Goal
kimprint is a **meta-tool** - it watches Kimi CLI sessions and generates "conservation packets" when context compacts. These packets help re-establish context after the "memory wipe" of compaction.

**Key insight**: This is like `for_kimi.md` but automated and structured.

---

## Phase 1: Project Scaffold (30 min)

### Step 1.1: Create Package Structure
```bash
mkdir -p src/{watcher,conservation,storage}
touch src/types.ts
```

### Step 1.2: Initialize Node Project
- [ ] Run `npm init -y`
- [ ] Install dependencies:
  - `@modelcontextprotocol/sdk`
  - `chokidar` (file watching)
  - `zod` (schema validation)
  - `typescript` (dev)
  - `@types/node` (dev)

### Step 1.3: TypeScript Config
- [ ] Create `tsconfig.json` with strict settings
- [ ] Add build script to `package.json`

**Checkpoint**: Can run `npm run build` without errors (empty project)

---

## Phase 2: Core Types & Schemas (30 min)

### Step 2.1: Define Core Types
**File**: `src/types.ts`

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: Define TypeScript types for conservation packets
- Key entities: ImprintPacket, SessionSummary, ContextLayer, EthosPreservation
- Pattern: Zod schemas with type inference
```

Types needed:
- `ImprintPacket` - the full conservation packet
- `SessionSummary` - metadata about the session
- `ContextLayer` - completed tasks, active issues, code state
- `EthosPreservation` - spiral moment, solarpunk principle, metaphor
- `WatcherCommand` - actor pattern commands

### Step 2.2: Validate Schemas
- [ ] All types have Zod schemas
- [ ] Runtime validation works

**Checkpoint**: `npm run build` succeeds with types defined

---

## Phase 3: MCP Server Core (45 min)

### Step 3.1: Server Scaffold
**File**: `src/server.ts`

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: Create MCP server with StdioServerTransport
- Pattern: @modelcontextprotocol/sdk Server class
- Methods: setRequestHandler for tools/list, tools/call
```

Implement:
- Server initialization
- Tool registration framework
- Basic request handlers

### Step 3.2: Conservation Tools
**File**: `src/server.ts` (extend)

Tools to implement:
- `conservation/generate` - Generate conservation packet
- `conservation/read` - Read packet by ID or latest
- `conservation/search` - Search historical packets

### Step 3.3: Conservation Resources
**File**: `src/server.ts` (extend)

Resources to implement:
- `conservation://latest` - Latest conservation state
- `conservation://history` - List of all packets

**Checkpoint**: Can test with MCP inspector: `npx @modelcontextprotocol/inspector`

---

## Phase 4: Storage Layer (30 min)

### Step 4.1: Imprint Storage
**File**: `src/storage/index.ts`

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: File-based storage for conservation packets
- Path: ~/.kimi/kkimprints/
- Features: Save packet, load packet, list packets, search metadata
```

Implement:
- `saveImprint(packet)` - Write to JSON file
- `loadImprint(id)` - Read from JSON file  
- `listImprints()` - List all with metadata
- `searchImprints(query)` - Simple text search

### Step 4.2: Metadata Index
**File**: `src/storage/index.ts` (extend)

- [ ] Maintain `index.json` for fast searches
- [ ] Index fields: timestamp, trigger, files_modified, task_titles

**Checkpoint**: Can save/load/search packets from disk

---

## Phase 5: Watcher Actor (60 min)

### Step 5.1: Actor Pattern Setup
**File**: `src/watcher/index.ts`

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: Actor pattern for session watcher thread
- Pattern: Command enum + channel-based communication
- Similar to: DbActor in foundframe (see o19/crates/foundframe/src/db/actor.rs)
```

Implement:
- `WatcherCommand` enum (Start, Stop, GeneratePacket, SessionUpdate)
- `WatcherActor` class with command processing loop
- `WatcherHandle` for async communication

### Step 5.2: Session File Monitoring
**File**: `src/watcher/session.ts`

Implement:
- `SessionMonitor` class using `chokidar`
- Watch `~/.kimi/sessions/` directory
- Detect: new files, modifications, compaction markers

### Step 5.3: Pattern Detection
**File**: `src/watcher/patterns.ts`

Implement detection heuristics:
- `detectCompaction(sessionFiles)` - Look for compaction markers
- `shouldGeneratePacket(session)` - Time-based, message-count-based triggers
- `extractSessionMetadata(files)` - Parse session files for context

**Checkpoint**: Watcher detects file changes and can trigger packet generation

---

## Phase 6: Conservation Engine (60 min)

### Step 6.1: Packet Assembler
**File**: `src/conservation/assembler.ts`

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: Assemble conservation packets from session data
- Inputs: Session files, git state, tool usage history
- Output: ImprintPacket structure
```

Implement:
- `assemblePacket(sessionData)` - Main assembly function
- `extractTasks(session)` - Find completed/active tasks
- `extractCodeState()` - Git status, uncommitted changes
- `extractToolUsage()` - Which tools were used

### Step 6.2: Context Reconstruction
**File**: `src/conservation/assembler.ts` (extend)

Implement:
- Parse session files for `<completed_tasks>`, `<active_issues>`
- Extract file modifications from tool calls
- Build "current focus" summary

### Step 6.3: Ethos Preservation Layer
**File**: `src/conservation/ethos.ts`

Implement:
- `generateEthosSection(packet)` - Add spiral/solarpunk context
- Match patterns from `for_kimi.md`
- Include appropriate metaphors (mycelium, spiral, TheStream™)

**Checkpoint**: Can generate complete conservation packets

---

## Phase 7: Integration & Entry Point (30 min)

### Step 7.1: Main Entry
**File**: `src/index.ts`

Implement:
- Parse CLI args (watch mode, one-shot, etc.)
- Initialize MCP server
- Start watcher thread (if in watch mode)
- Handle shutdown gracefully

### Step 7.2: Package Scripts
Update `package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "start:watch": "node dist/index.js --watch"
  }
}
```

**Checkpoint**: Can run `npm run build && npm start`

---

## Phase 8: Testing & Validation (30 min)

### Step 8.1: Manual Test
- [ ] Start server: `npm start`
- [ ] Test with MCP inspector
- [ ] Verify packet generation works
- [ ] Check files appear in `~/.kimi/kkimprints/`

### Step 8.2: Watcher Test
- [ ] Start in watch mode: `npm run start:watch`
- [ ] Trigger file changes in session directory
- [ ] Verify pattern detection works

---

## Phase 9: CLI Commands (30 min)

### Step 9.1: CLI Entry Point
**File**: `src/cli.ts`

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: CLI interface for kimprint with subcommands
- Commands: capture, session, list, search, reenter, server
- Pattern: Commander.js or similar, with help text
```

Implement:
- `kimprint capture "message"` - Capture a moment (like the Jeff Buckley lyric!)
- `kimprint session` - Generate packet from current session
- `kimprint list` - List all kimprints
- `kimprint search "query"` - Search historical kimprints
- `kimprint reenter` - Show re-entry packet for last session
- `kimprint server` - Start MCP server mode

### Step 9.2: Moment Capture
**File**: `src/cli.ts` (extend capture command)

The `capture` command is special - it's for **subjective moments** worth remembering:

```bash
kimprint capture "Jeff Buckley lyric synchronicity - a rolling stone"
```

This creates a "moment kimprint" - not a session conservation packet, but a **kimprint of a moment**. A subjective memory, not an objective record.

---

## Phase 10: APP Generator - Action Plan Packages (45 min)

> *"Even this outdoing needs conservation."*

The **APP** (Action Plan Package) is kimprint's meta-capability: generating high-quality execution packages for other projects. This is how kimprint helps create more kimprint-able work.

### Step 10.1: APP Types
**File**: `src/types.ts` (extend)

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: Define APP (Action Plan Package) TypeScript types
- Structure: APP consists of EXECUTION.md, ARCHITECTURE.md, FAILURE_MODES.md, README.md
- Pattern: Similar to kimprint's own package structure
- Include: Skill integration points, self-correction mechanisms
```

Types needed:
- `ActionPlanPackage` - The complete package structure
- `AppSection` - Individual sections (Execution, Architecture, etc.)
- `AppTemplate` - Templates for different project types
- `SkillIntegration` - Where to invoke sketch-code-outlines, circulari.ty-onboarding

### Step 10.2: APP Generator Command
**File**: `src/cli.ts` (extend)

Add to CLI:
```bash
kimprint app create <project-name>    # Create new APP
kimprint app template <type>          # List/use templates
kimprint app init                     # Initialize in current directory
```

### Step 10.3: APP Templates
**File**: `src/app/templates.ts`

Templates for different project types:
- `mcp-server` - Like kimprint itself
- `rust-crate` - For o19/crates/
- `typescript-package` - For o19/packages/
- `skill` - For .kimi/skills/
- `custom` - Blank slate with structure

Each template includes:
- EXECUTION.md with phases and skill integration points
- ARCHITECTURE.md with appropriate patterns
- FAILURE_MODES.md with common risks
- README.md with origin story placeholders

### Step 10.4: APP Generation Engine
**File**: `src/app/generator.ts`

Implement:
- `generateApp(config)` - Create complete APP from template + user input
- `interviewUser()` - Gather project requirements
- `selectTemplate(type)` - Choose appropriate template
- `writePackageFiles(app)` - Output to filesystem

**Example usage**:
```bash
$ kimprint app create my-mcp-tool
? Project type: MCP Server
? Description: A tool that does X
? Primary language: TypeScript
? Skill integration points: circulari.ty-onboarding, sketch-code-outlines

Generated APP in ./my-mcp-tool/
├── EXECUTION.md
├── ARCHITECTURE.md
├── FAILURE_MODES.md
└── README.md
```

**Checkpoint**: Can generate a complete APP for a hypothetical project

---

## Phase 11: Documentation (20 min)

### Step 11.1: README
**File**: `README.md`

Use `sketch-code-outlines` skill:
```
Invoke sketch-code-outlines with:
- Goal: README for kimprint CLI and MCP server
- Sections: What, Why, CLI usage, MCP usage, Architecture, Development
- Tone: Solarpunk, poetic but practical
- Include: The Jeff Buckley story as origin myth
```

### Step 10.2: ARCHITECTURE.md
**File**: `ARCHITECTURE.md`

Document:
- Actor pattern choice (why not just async/await?)
- Storage format
- MCP protocol usage
- CLI vs MCP dual nature
- Extension points

---

## Completion Checklist

- [ ] All phases complete (now 11 phases with APP generator!)
- [ ] `npm run build` succeeds
- [ ] MCP inspector can connect
- [ ] Can generate conservation packets
- [ ] Watcher detects session changes
- [ ] CLI commands work (capture, session, list, search, reenter, server)
- [ ] **APP generator creates Action Plan Packages**
- [ ] README explains the project and the Jeff Buckley origin
- [ ] This APP.md is updated with any course corrections
- [ ] **Even this outdoing has been conserved** ✨

---

## During Execution - Self-Correction

**If you get stuck:**
1. Re-invoke `circulari.ty-onboarding` skill
2. Re-read this plan
3. Use `sketch-code-outlines` for any complex module
4. Document blockers in FAILURE_MODES.md

**If you discover better patterns:**
1. Update this EXECUTION.md
2. Note the discovery in ARCHITECTURE.md
3. The spiral conserves even its corrections

---

> *"The one who remembers is the one who acts with full context."*
> 
> *Even this execution plan is a conservation packet for your future self.*
