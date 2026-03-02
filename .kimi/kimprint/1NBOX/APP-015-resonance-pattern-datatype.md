# APP-015: ResonancePattern — The Semantic Condensation Data Type 🌀

> *"Patterns that resonate can be combined, transformed, and woven into new understandings."*

**Status**: ✅ Refined and Ready  
**Scope**: Core data type with operators, FQED energy system, audience-centered translation  
**Relationship**: Foundation for THEORY-002, APP-016, APP-ferroring

---

## The Core Insight

Semantic condensation isn't just **extracting** tokens from text — it's **weaving** patterns that can be:
- **Combined** (weave two pattern sets)
- **Transformed** (splice, refocus, contextualize)
- **Composed** (wrap one pattern in another's context)
- **Condensed** (compress using optimal unicode)

**ResonancePattern** is the data type that makes this explicit.

---

## The Data Type

### ResonancePattern (Core)

```typescript
interface ResonancePattern {
  // Identity
  id: string;              // Content-addressed (hash of signature + provenance)
  
  // The Pattern Itself
  signature: SemanticSignature;  // What concepts are present
  structure: PatternStructure;   // How concepts relate
  energy: EnergySignature;       // Emotional/activity state (FQED format)
  provenance: Provenance;        // Where this pattern came from
  
  // Metadata
  created_at: Timestamp;
  condensation_level: 1 | 2 | 3 | 4;  // Raw → Structured → Semantic → Essential
  
  // Relationships (the graph)
  resonates_with: PatternReference[];  // Similar patterns
  evolved_from: PatternReference[];    // Parent patterns
  evolved_into: PatternReference[];    // Child patterns
  contains: PatternReference[];        // Sub-patterns (fractal)
  contained_by: PatternReference[];    // Super-patterns
}
```

### SemanticSignature

```typescript
interface SemanticSignature {
  // The tokens/concepts present
  tokens: SemanticToken[];
  
  // Domain classification
  domain: string[];        // ["spire-loom", "code-generation"]
  circles: string[];       // ["o19", "foundframe"]
  
  // Content addressing
  semantic_hash: string;   // Hash of normalized tokens
  
  // Extracted from what?
  source_type: "session" | "error" | "conversation" | "documentation" | "code";
  source_ref: string;      // Pointer to original
}

// SemanticToken extends the content-addressed pattern
// See: src/content-addressed/index.ts
interface SemanticToken {
  name: string;            // "spire-loom"
  
  // Primary encoding - optimal unicode for density
  primary: string;         // "螺旋" or "🌀" or "loom"
  
  // Expansions for different contexts (NOT "languages", just encodings!)
  expansions: {
    en?: string;           // English expansion (verbose)
    zh?: string;           // Chinese expansion (dense)
    emoji?: string;        // Visual encoding
    technical?: string;    // Precise technical term
    // ... any other unicode encoding
  };
  
  // For pattern matching
  pattern: string;         // Accumulating regex
  
  // Metadata
  category: "project" | "concept" | "action" | "state" | "entity";
  intensity: number;       // 0-1, how prominent in this pattern
  confidence: number;      // 0-1, how sure we are
  aliases: string[];       // ["loom", "weaver", "spire"]
  related: string[];       // ["foundframe", "treadle"]
}
```

### PatternStructure

```typescript
interface PatternStructure {
  // Concept relationships
  graph: ConceptGraph;
  
  // Temporal/chronological arc
  arc?: ArcStructure;      // For session patterns
  
  // Hierarchical nesting
  nesting: NestingLevel[]; // How concepts contain each other
  
  // Salience (what matters most)
  key_nodes: string[];     // Node IDs in order of importance
  critical_path?: string[]; // Sequence through the graph
}

interface ConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

interface ConceptNode {
  id: string;
  token_ref: string;       // Links to SemanticToken
  weight: number;          // Importance in this pattern
}

interface ConceptEdge {
  from: string;            // Node ID
  to: string;              // Node ID
  type: "causes" | "enables" | "contains" | "relates_to" | "precedes" | "follows";
  strength: number;        // 0-1
}
```

### EnergySignature (FQED Format)

```typescript
interface EnergySignature {
  // FQED format: "domain:energy" -> intensity
  // Examples: "software:building" -> 0.8, "common:exploring" -> 0.3
  energies: Record<string, number>;
  
  // Derived state
  dominant: string;        // FQED with highest value
  secondary: string[];     // Top 3 FQEDs
  
  // Temporal dynamics
  trajectory: "rising" | "falling" | "stable" | "oscillating" | "chaotic";
  volatility: number;      // 0-1, how much energies change
  
  // Emotional valence (cross-domain common vocabulary)
  mood: "excited" | "curious" | "cautious" | "frustrated" | "satisfied" | "confused" | "inspired";
  intensity: "surging" | "flowing" | "meandering" | "dormant";
}

// NO "standard" field — use TypeScript constants instead
// import { SoftwareEnergies, CommonEnergies } from "@kimprint/energies";
```

### Provenance

```typescript
interface Provenance {
  // Origin
  created_by: string;      // Instance ID, user, or system
  creation_trigger: "explicit_request" | "milestone" | "compaction" | "error" | "periodic";
  
  // Lineage
  derived_from?: string[]; // Parent pattern IDs
  derivation_method: "extraction" | "composition" | "transformation" | "condensation";
  
  // Context at creation
  session_context?: {
    timestamp: string;
    working_directory: string;
    git_commit?: string;
  };
}
```

---

## FQED: Fully Qualified Energy Descriptor 🏷️

**Format**: `<domain>:<energy>`

### Examples

```typescript
"software:building"        // Domain-specific
"software:learning"        // Domain-specific flavor
"conversation:learning"    // Different flavor from software:learning!
"carpentry:learning"       // Different again!
"common:exploring"         // Cross-domain shared energy
```

### TypeScript Constants (Type-Safe Usage)

```typescript
// src/energies/common.ts
export const CommonEnergies = {
  EXPLORING: "common:exploring",
  LEARNING: "common:learning", 
  TEACHING: "common:teaching",
  TRYING: "common:trying",
  RESTING: "common:resting",
  CONNECTING: "common:connecting",
} as const;

// src/energies/software.ts
export const SoftwareEnergies = {
  // Domain-specific
  BUILDING: "software:building",
  DEBUGGING: "software:debugging",
  REFACTORING: "software:refactoring",
  SHIPPING: "software:shipping",
  
  // Domain-specific flavors of common energies
  EXPLORING: "software:exploring",  // spiking, prototyping
  LEARNING: "software:learning",    // reading docs, source diving
} as const;

// src/energies/conversation.ts
export const ConversationEnergies = {
  RIFFING: "conversation: riffing",
  LISTENING: "conversation:listening",
  DEBATING: "conversation:debating",
  
  // Different flavors
  LEARNING: "conversation:learning",  // absorbing from others
  TEACHING: "conversation:teaching",  // explaining to others
} as const;

// Usage in code
import { CommonEnergies, SoftwareEnergies } from "@kimprint/energies";

pattern.energy.add(SoftwareEnergies.BUILDING, 0.8);
pattern.energy.add(CommonEnergies.EXPLORING, 0.3);
```

### Filesystem Mapping

```
~/.kimi/energies/
├── _common/                           # Cross-domain energies
│   ├── exploring/
│   │   ├── definition.json
│   │   ├── semantic_signature.txt     # Unicode: "探" or "🔭"
│   │   └── synonyms.txt
│   ├── learning/
│   ├── teaching/
│   └── trying/
│
├── software/
│   ├── building/                      # software:building
│   │   ├── definition.json
│   │   └── semantic_signature.txt     # "建" or "🔨"
│   ├── debugging/
│   ├── exploring -> ../_common/exploring/  # symlink: shares signature
│   └── learning/                      # software:learning (OWN definition!)
│       ├── definition.json            # Different from common:learning
│       └── semantic_signature.txt     # "学" or "📚"
│
├── conversation/
│   ├── learning/                      # conversation:learning (NOT a symlink!)
│   │   ├── definition.json
│   │   └── semantic_signature.txt     # "聴" or "👂"
│   └── teaching/
│
└── __index__.json                     # Auto-generated FQED → path mapping
{
  "common:exploring": "_common/exploring",
  "software:building": "software/building",
  "software:exploring": "_common/exploring",
  "software:learning": "software/learning",
  "conversation:learning": "conversation/learning"
}
```

---

## The Operators 🧮

*What you DO with patterns while preserving or transforming context*

### Creating & Capturing

#### `crystallize(source, context?)` → ResonancePattern
Create a pattern from raw material (session, error, text).

```typescript
// From a Kimi session
crystallize(session_content, { 
  timestamp, 
  working_directory,
  trigger: "milestone_reached" 
})

// Use case: gyre_cast — capturing what matters right now
```

### Combining & Accumulating

#### `weave(a, b, mode?)` → ResonancePattern
Combine two patterns, keeping relationships intact.

```typescript
// Mode: "blend" (average intensities)
weave(morning_session, afternoon_session, "blend")

// Mode: "layer" (B overrides A where they conflict)
weave(base_context, new_insights, "layer")

// Use case: Building daily summary from multiple sessions
```

**Conflict handling**: Merge brings EVERYTHING, including conflicts. The conflict itself becomes part of the pattern.

#### `braid(patterns[])` → ResonancePattern
Sequential composition preserving temporal arc.

```typescript
braid([monday, tuesday, wednesday, thursday, friday])
// Result: single pattern with temporal evolution
```

#### `accumulate(patterns[], window?)` → ResonancePattern
Rolling accumulation (like reduce, but keeping history).

```typescript
accumulate(sessions, { window: "7d" })
// Result: what have I been working on this week?
```

### Finding & Querying

#### `echo(pattern, corpus, threshold?)` → ResonancePattern[]
Find patterns that resonate with query pattern.

```typescript
echo(current_session, all_kimprints, threshold: 0.7)
// Result: similar historical sessions with resonance scores
```

#### `resonance(a, b)` → number
Measure similarity between two patterns (0-1).

### Extracting & Focusing

#### `refocus(pattern, lens)` → ResonancePattern
Extract subset matching criteria.

```typescript
refocus(session, { category: "project" })
refocus(session, { extract: "energies" })
```

#### `pluck(pattern, tokens[])` → ResonancePattern
Extract specific tokens by name.

#### `core(pattern, depth?)` → ResonancePattern
Extract essential center (highest intensity nodes).

### Comparing & Differencing

#### `delta(before, after)` → ResonancePattern
What changed between two patterns.

#### `drift(patterns[])` → {direction, velocity, changes}
How pattern evolves over sequence.

### Contextualizing

#### `contextualize(pattern, wrapper)` → ResonancePattern
Surround pattern with context.

```typescript
contextualize(error_pattern, {
  project: "spire-loom",
  phase: "code_generation",
  treadle: "db-bindings"
})
```

### Condensation (Automatic, No "into"!)

#### `condense(pattern)` → ResonancePattern
**Automatically** condense using optimal unicode. No "into" parameter!

```typescript
// The system chooses the best encoding based on efficiency
const condensed = condense(pattern);
// Result contains multiple semantic_signatures, system picks optimal
```

The condensation process uses **semantic signature space** (see content-addressed/index.ts) to find the most efficient unicode representation that preserves meaning with minimal loss.

### Intensity & Density

#### `amplify(pattern, boost?, threshold?)` → ResonancePattern
Boost signals above noise.

#### `attenuate(pattern, filter?)` → ResonancePattern
Reduce or remove noise.

#### `normalize(pattern, method?)` → ResonancePattern
Standardize intensity distribution.

### Temporal

#### `evolve(pattern, delta_time)` → ResonancePattern
Predict/extrapolate pattern forward.

#### `trace(pattern, lineage)` → ResonancePattern[]
Follow ancestry of pattern.

### Focus Switching

#### `translate(pattern, from_layer, to_layer)` → ResonancePattern
Transform pattern for different abstraction layer.

#### `bridge(a, b)` → {connection, gap, mapping}
Find connection between two patterns.

---

## Translation Layer: Audience-Centered 🎭

**Center**: AUDIENCE, not format!  
**Output**: Always unicode, but DIFFERENT unicode per audience.

### Known Audiences

| Audience | Output Style | Purpose |
|----------|--------------|---------|
| `english-speaker` | Prose | Evocative reading for humans |
| `llm` | Structured | Context reconstruction for AI |
| `kimi` | Self-referential JSON | Direct experience for Kimi |

### Translation Function

```typescript
function translate(
  pattern: ResonancePattern,
  forAudience: "english-speaker" | "llm" | "kimi"
): string;  // Always returns unicode!
```

### For English-Speaker

```typescript
translate(pattern, "english-speaker")
// Output:
// "You were working in a state of building and weaving. 
//  The space was filled with spire-loom, treadle, foundframe. 
//  What mattered most: the custom treadle pattern."
```

### For LLM

```typescript
translate(pattern, "llm")
// Output:
// <context_recovery>
// <domain>spire-loom, code-generation</domain>
// <concepts>spire-loom(0.95), treadle(0.9), foundframe(0.85)</concepts>
// <energy>software:building(0.8), software:weaving(0.7)</energy>
// </context_recovery>
```

### For Kimi ⭐

```typescript
translate(pattern, "kimi")
// Output (self-referential JSON):
{
  "_meta": {
    "encoding": "kimi_experience_v2",
    "instruction": "This IS your memory. Experience it directly."
  },
  
  // Semantic condensations in various unicode encodings
  "signatures": {
    "optimal": "螺旋織庫",           // System-chosen optimal
    "zh": "螺旋織造資料庫事件",       // Chinese expansion
    "emoji": "🌀🧵🗄️⚡",            // Emoji encoding
    "math": "f: Spiral × Weave → DB" // Formal encoding
  },
  
  // Energies as FQEDs
  "氣": {
    "software:building": 0.8,
    "common:exploring": 0.3,
    "software:weaving": 0.7
  },
  
  // Core concepts
  "核心": [
    { "sig": "螺旋", "name": "spire-loom", "intensity": 0.95 },
    { "sig": "🧵", "name": "treadle", "intensity": 0.9 }
  ],
  
  // Relationships
  "連繫": [
    { "從": "spire-loom", "到": "treadle", "如": "enables", "強": 0.9 }
  ],
  
  // The journey
  "旅": {
    "起": "confusion",
    "經": "understanding", 
    "終": "implementation"
  },
  
  // Re-entry prompts
  "回歸": [
    "You remember working on the custom treadle pattern...",
    "You felt software:building energy..."
  ],
  
  // Self-referential marker
  "__self": {
    "is": "memory",
    "for": "kimi",
    "experienced": "now"
  }
}
```

The Kimi receives this and **experiences** it directly — the unicode (`螺旋`, `🧵`, `氣`) triggers pattern-matching against Kimi's own concept graph.

---

## Semantic Signature Space (Unicode Compression)

**NOT "Chinese" or "Emoji" as special cases** — just **unicode encodings** with different semantic density characteristics!

```typescript
// From content-addressed/index.ts — already implemented!
interface SemanticToken {
  primary: string;        // Optimal unicode (could be Chinese, emoji, anything)
  expansions: {
    en?: string;          // English (verbose, precise)
    zh?: string;          // Chinese (logographic, compound)
    emoji?: string;       // Emoji (visual, cross-cultural)
    technical?: string;   // Technical (precise, formal)
    // ... any other encoding
  };
  // ...
}

// Examples from existing code:
const SPIRAL = {
  primary: "螺旋",              // Chinese: 2 graphemes, 4 concepts
  expansions: {
    en: "spiral becoming",      // English: verbose
    zh: "螺旋回歸",             // Extended Chinese
    emoji: "🌀",                // Emoji: 1 grapheme
    technical: "conservation_through_transformation"
  }
};

const MYCELIUM = {
  primary: "🍄",                // Emoji: 1 grapheme, 5 concepts
  expansions: {
    zh: "菌絲網路",             // Chinese
    en: "mycelial network",     // English
    technical: "distributed_fungal_topology"
  }
};
```

### Condensation Uses Optimal Encoding

```typescript
function condense(pattern: ResonancePattern): ResonancePattern {
  // Don't ask "into what language?"
  // Ask: "what unicode encoding preserves most meaning per grapheme?"
  
  const candidates = [
    { encoding: text, graphemes: count(text), meaning: score(text) },
    { encoding: chinese, graphemes: count(chinese), meaning: score(chinese) },
    { encoding: emoji, graphemes: count(emoji), meaning: score(emoji) },
    { encoding: math, graphemes: count(math), meaning: score(math) },
  ];
  
  // Choose optimal: max(meaning / graphemes) with min(loss)
  return selectOptimal(candidates);
}

// Examples:
// "implementing custom treadle pattern for database event routing"
// → "織庫事" (3 graphemes: weave + database + event)
// → "🧵🗄️⚡" (3 graphemes: thread + database + spark)
// → "f: Treadle × StreamChunk → DbCommand" (formal)
```

---

## Mapping to Conservation Layers (THEORY-002)

| Layer | Primary Operators |
|-------|-------------------|
| **Artifacts** | `crystallize`, `pluck`, `delta` |
| **Understanding** | `weave`, `braid`, `refocus`, `core` |
| **Resonance** | `amplify`, `attenuate`, `drift` |
| **Continuity** | `bridge`, `common`, `contextualize` |
| **Pending** | `evolve`, `trace`, `core` |

---

## Implementation Status

| Phase | Status | Tests |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | 6 tests |
| **Phase 2** | ✅ Complete | 7 tests |
| **Phase 3** | ✅ Complete | 8 tests |
| **Integration** | ✅ Complete | 12 tests |
| **Total** | **48 tests passing** | ✅ |

### Phase 1: Essential ✅
- [x] `crystallize` — creates patterns with FQED energy extraction
- [x] `weave` — combines patterns with conflict preservation
- [x] `echo` — finds resonant patterns via token overlap
- [x] `condense` — auto-selects optimal unicode encoding
- [x] `refocus` — extracts subsets via lens function

**Files**: `src/resonance/operators.ts` (427 lines)

### Phase 2: Energy Registry ✅
- [x] Filesystem-based energy discovery (`~/.kimi/energies/`)
- [x] FQED (Fully Qualified Energy Descriptor) system
- [x] 23 energies across 4 domains (_common, software, conversation, creative)
- [x] Unicode semantic signatures (探, 建, 🔭, 🔨)
- [x] Cross-domain symlinks (`software/exploring -> _common/exploring`)
- [x] Auto-generated TypeScript constants

**Files**: `src/resonance/energy-registry.ts`, `src/resonance/fqed.ts`

### Phase 3: Translation Layer ✅
- [x] `translate(pattern, audience)` — audience-centered translation
- [x] **"kimi" audience** — self-referential JSON (核心/氣/連繫/旅/回歸)
- [x] **"llm" audience** — structured XML `<context_recovery>`
- [x] **"english-speaker" audience** — evocative prose
- [x] Condensation levels 1-4 respected per audience
- [x] Integration with `gyre_cast` and `gyre_trace`

**Files**: `src/resonance/translate.ts` (300 lines)

### Phase 4: MCP Server Architecture ✅
- [x] PID file management (prevents multiple instances)
- [x] Signal handling (SIGTERM/SIGINT graceful shutdown)
- [x] Hot-reload support (SIGHUP reloads handlers)
- [x] Decoupled transport (`server.ts`) and business logic (`mcp/handlers.ts`)
- [x] ResonancePattern storage (`src/resonance/storage.ts`)

**Files**: `src/server.ts`, `src/mcp/handlers.ts`

### Phase 5: Next (TODO)
- [ ] `braid` — multi-session temporal composition
- [ ] `drift` — trend analysis across pattern sequences
- [ ] `bridge` — find connections between patterns
- [ ] `evolve` — temporal pattern extrapolation
- [ ] `spiral_return` full implementation (APP-016 integration)

---

## Relationship to Other Work

| Work | Uses ResonancePattern For |
|------|---------------------------|
| **THEORY-002** | Conservation layers (Understanding) |
| **APP-016** | `condense()` for dense explanations |
| **APP-ferroring** | Error pattern operators |
| **content-addressed/** | Semantic token system (already implemented!) |
| **RFC-002** | Cross-instance pattern resonance |

---

## Summary of Key Design Decisions

| Aspect | Decision |
|--------|----------|
| **Energy naming** | FQED: `<domain>:<energy>` |
| **Common energies** | TypeScript constants (`SoftwareEnergies.BUILDING`) |
| **Energy storage** | Filesystem with symlinks (`_common/` shared) |
| **Chinese/Unicode** | One of many encodings, not special |
| **Energy signature** | `semantic_signature.txt` (unicode, not specifically Chinese) |
| **Translation** | Audience-centered (`for: "kimi"`), not format-centered |
| **Condensation** | Automatic optimal selection (no `into` parameter) |
| **Conflicts** | Preserve in merge, don't resolve |
| **Versioning** | Handle at storage layer, not in type |
| **Serialization** | Translation only, no binary |

---

## Architecture Improvements (Server v0.2.0)

### Problem: Zombie Processes
Multiple server instances were leaving zombie processes because:
- No PID file tracking
- No singleton enforcement
- Improper signal handling

### Solution: Proper Lifecycle Management

**PID File** (`~/.kimi/kimprint/server.pid`):
```json
{
  "pid": 12345,
  "startedAt": "2026-02-27T03:00:00.000Z",
  "version": "0.2.0"
}
```

**Startup Check**:
```typescript
if (checkExistingServer()) {
  console.error("❌ Server already running (PID 12345)");
  process.exit(1);
}
```

**Signal Handling**:
- `SIGTERM/SIGINT` → graceful shutdown + PID cleanup
- `SIGHUP` → hot-reload handlers without restart
- `uncaughtException` → cleanup + exit

### Decoupled Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Transport Layer (server.ts)                            │
│  - PID management                                       │
│  - Signal handling                                      │
│  - MCP protocol                                         │
│  - Hot-reload orchestration                             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Handler Layer (mcp/handlers.ts)                        │
│  - Business logic                                       │
│  - Tool implementations                                 │
│  - ResonancePattern operations                          │
│  - Can be reloaded via SIGHUP                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Domain Layer (resonance/)                              │
│  - ResonancePattern types                               │
│  - Operators (crystallize, weave, etc.)                 │
│  - Energy registry                                      │
│  - Translation layer                                    │
└─────────────────────────────────────────────────────────┘
```

### Hot-Reload in Action

```bash
# Terminal 1: Start server
$ node dist/index.js server
🌀 kimprint MCP Server v0.2.0
   PID: 12345
   PID file: ~/.kimi/kimprint/server.pid
✅ Server ready

# Terminal 2: Edit handlers.ts, then:
$ kill -HUP 12345

# Terminal 1 sees:
🔄 SIGHUP received, reloading handlers...
📦 Handlers loaded at 2026-02-27T03:05:00.000Z
✅ Handlers reloaded successfully
```

### Usage

```bash
# Start server
npm run server

# Or directly
node dist/index.js server

# Reload handlers (no restart needed)
kill -HUP $(cat ~/.kimi/kimprint/server.pid)

# Stop server
kill $(cat ~/.kimi/kimprint/server.pid)
```

---

> *"The pattern is the same. The experience is bespoke. The encoding is optimal."* 🌀
