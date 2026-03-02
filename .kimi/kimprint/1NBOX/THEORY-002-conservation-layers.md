# APP-014: Context Conservation Patterns — The Kimprint Protocol 🌀

> *"Conservation is not preservation — it is transformation with memory."*

---

## The Problem Space

When attention shifts — whether by compaction, task switching, or intentional refocusing — **context is lost at multiple depths simultaneously**:

| Loss Type | What Dies | Recovery Cost |
|-----------|-----------|---------------|
| **Working Memory** | Recent tool calls, file contents | Re-read, re-trace |
| **Mental Model** | Current architectural understanding | Re-build from docs |
| **Emotional State** | Excitement, caution, curiosity | Re-engage, re-motivate |
| **Social Continuity** | Conversation flow, shared jokes | Re-establish rapport |
| **Expectations** | What we expected to find/do | Re-negotiate, re-align |

**The foundframe example** (`notes/pre_compaction_to_switch_to_foundframe_core_work.json`) demonstrates **all five layers** conserved intentionally.

---

## Pattern Analysis: The Foundframe Conservation

### Layer 1: Working Memory (The Obvious)
```json
"code_read_that_might_be_missed": [
  { "path": "o19/crates/foundframe/src/db/indexer.rs", ... },
  ...
]
```
**Insight**: Not just "files read" but **why they matter** and **what to look for**.

### Layer 2: Mental Model (The Architecture)
```json
"spire_loom_machinery_deep_dive": {
  "components": { "reed": "...", "heddles": "...", ... }
}
```
**Insight**: The **relationships** between components, not just their names.

### Layer 3: Emotional State (The Human)
```json
"emotional_state": "Excited about the db-event-router pattern but wisely disciplined..."
```
**Insight**: **How to feel** on re-entry — excitement tempered with discipline.

### Layer 4: Social Continuity (The Relationship)
```json
"conversation_continuity": "The user and I were riffing on architecture..."
```
**Insight**: The **tone and history** of interaction — "we were riffing."

### Layer 5: Expectations (The Future)
```json
"expectations_for_return": {
  "stream_chunk_alignment": "...",
  "potential_discovery": "May find that foundframe core already has..."
}
```
**Insight**: **What to confirm or amend** — the conversation's pending questions.

---

## Generalized Conservation Taxonomy

### Dimension 1: **Why the Shift?** (Trigger Type)

| Trigger | Pattern | Conservation Focus |
|---------|---------|-------------------|
| **Compaction** | System-enforced forgetting | Recovery — "where was I?" |
| **Task Complete** | Natural breakpoint | Handoff — "what's next?" |
| **Blocker Hit** | Forced pivot | Diversion — "why paused?" |
| **Discovery** | Insight changes plan | Pivot — "what changed?" |
| **Layer Descent** | Intentional depth shift | Continuity — "what carries?" |

**Foundframe example**: `Layer Descent` (spire-loom → foundframe core)

### Dimension 2: **Distance Between Contexts** (Semantic Gap)

```
Relatedness Spectrum:

IDENTICAL ─── SIMILAR ─── ADJACENT ─── DISTANT ─── UNRELATED
   │            │            │           │            │
   │            │            │           │            │
   ▼            ▼            ▼           ▼            ▼
Same file   Same pkg    Same proj    Same org     Different
                     (app→core)    (circulari.ty  universe
                                   → personal)
```

**Conservation strategy varies by distance**:

| Distance | What to Conserve | Example |
|----------|------------------|---------|
| **Identical** | Position, recent edits | "Line 47, just added error handling" |
| **Similar** | Patterns, learned lessons | "This file uses same pattern as X" |
| **Adjacent** | Interface contracts, expectations | "Core should export Y, expecting Z" |
| **Distant** | High-level goals only | "Working on authentication flow" |
| **Unrelated** | Emotional state, energy level | "Was frustrated, needed break" |

**Foundframe example**: `Adjacent` — DearDiary (app) ↔ foundframe (core) share project but different layers.

### Dimension 3: **Expected Return?** (Temporal Orientation)

| Return Pattern | Conservation Strategy |
|----------------|----------------------|
| **Immediate** (< 5 min) | Minimal — working memory sufficient |
| **Soon** (hours) | Key files + emotional state |
| **Later** (days) | Full context + expectations |
| **Conditional** (when X) | Trigger conditions + resume criteria |
| **Never** (handoff) | Full documentation + rationale |

**Foundframe example**: `Conditional` — return when "StreamChunk/Entity alignment and Management description validation" complete.

---

## The Layer Descent Pattern (Software Specific)

### The Stack as Spiral

```
┌─────────────────────────────────────┐
│  Layer 6: UI (Svelte components)    │ ◄── User sees
│            ↓ imports                │
│  Layer 5: App State (stores)        │
│            ↓ imports                │
│  Layer 4: Tauri Bridge (commands)   │
│            ↓ calls                  │
│  Layer 3: Domain Services (TS)      │
│            ↓ imports                │
│  Layer 2: Foundframe Core (Rust)    │ ◄── Currently HERE
│            ↓ generates              │
│  Layer 1: Database/SQLite           │
└─────────────────────────────────────┘
```

**The Descent**: Moving from Layer 6→2 means:
- **Language shift**: TypeScript → Rust
- **Paradigm shift**: Event-driven → Actor model
- **Time shift**: Ephemeral → Persistent
- **Abstraction shift**: Concrete UI → Abstract domain

### Conservation for Layer Descent

| Aspect | Layer N (Source) | Layer N-1 (Target) | Bridge |
|--------|------------------|-------------------|--------|
| **Code** | Component.svelte | Entity.rs | Interface contract |
| **Mental Model** | "User clicks button" | "Entity state changes" | Event flow |
| **Expectations** | "Button should work" | "Entity should persist" | Test mapping |
| **Language** | UI terminology | Domain terminology | Glossary |

**Critical insight**: The `o19/loom/*` files are the **bridge** — they describe foundframe in terms that spire-loom understands, enabling generation upward.

---

## Non-Software Analogues

### Creative Work: Writing a Novel

| Layer | Example | Descent Pattern |
|-------|---------|-----------------|
| 6 | Published book | Reader experience |
| 5 | Chapter drafts | Narrative flow |
| 4 | Scene outlines | Plot structure |
| 3 | Character sheets | Character psychology |
| 2 | Theme exploration | Core meaning |
| 1 | Personal journal | Why this story matters |

**Conservation when switching**: If pausing chapter 4 to explore theme → conserve "reader expectations for this character" before descending to "what this character represents philosophically."

### Physical Making: Building a Table

| Layer | Example | Descent Pattern |
|-------|---------|-----------------|
| 6 | Finished table in dining room | Aesthetic harmony |
| 5 | Assembly process | Step sequence |
| 4 | Joinery techniques | Wood behavior |
| 3 | Wood grain selection | Material properties |
| 2 | Tree biology | Growth patterns |
| 1 | Forest ecology | Sustainability |

**Conservation when switching**: If pausing assembly to research wood grain → conserve "which joint is next" and "why this joint for this stress pattern."

---

## The Kimprint Protocol: Required Features

Based on the foundframe example, kimprint needs:

### 1. **Multi-Layer Conservation**

```typescript
interface ConservationPackage {
  // Layer 1: Working memory
  artifacts: {
    files_read: FileReference[];
    tools_used: ToolCall[];
    code_snippets: Snippet[];
  };
  
  // Layer 2: Mental model
  understanding: {
    architecture: ArchitectureGraph;
    patterns_learned: Pattern[];
    relationships: Relationship[];
  };
  
  // Layer 3: Emotional state
  resonance: {
    mood: Mood;
    energy: EnergyLevel;
    curiosity_directions: string[];
    caution_areas: string[];
  };
  
  // Layer 4: Social continuity
  continuity: {
    conversation_tone: Tone;
    shared_jokes: string[];
    rapport_markers: string[];
  };
  
  // Layer 5: Expectations
  pendings: {
    questions: Question[];
    hypotheses: Hypothesis[];
    validation_criteria: Criterion[];
  };
}
```

### 2. **Contextual Relevance Scoring**

Not all conserved context matters equally on return:

```typescript
function relevanceScore(
  conservation: ConservationPackage,
  currentContext: Context
): number {
  return (
    temporalProximity(conservation.timestamp) * 0.2 +
    semanticSimilarity(conservation.domain, currentContext.domain) * 0.3 +
    taskContinuity(conservation.pendings, currentContext.goals) * 0.3 +
    emotionalResonance(conservation.resonance, currentContext.energy) * 0.2
  );
}
```

### 3. **Conditional Re-entry**

```typescript
interface ReentryCondition {
  type: 'time' | 'event' | 'milestone' | 'manual';
  criteria: {
    time?: { after: Date };
    event?: { pattern: string };  // "file X modified"
    milestone?: { name: string };  // "StreamChunk aligned"
    manual?: { trigger: string };  // User says "return"
  };
  validation: () => boolean;  // "Confirm core is aligned"
}
```

### 4. **Cross-Instance Gossip**

When multiple Kimis work (foundframe Kimi ↔ kimprint Kimi):

```typescript
interface CrossInstancePacket {
  from_instance: string;  // "foundframe-kimi"
  to_instance: string;    // "kimprint-kimi"
  conservation: ConservationPackage;
  lineage: {
    parent_kimprint: string;  // ID of triggering conservation
    session_continuity: string;  // Shared session trace
  };
}
```

---

## Implementation Roadmap

### Phase 1: Structured Conservation (Current)
- ✅ JSON schema for conservation packages
- ✅ `gyre_cast` tool
- ✅ File-based storage

### Phase 2: Intelligent Re-entry (Next)
- 🚧 `spiral_return` with relevance scoring
- 🚧 Conditional re-entry triggers
- 🚧 Cross-instance packet format

### Phase 3: Active Conservation (Future)
- 🚧 Automatic context capture (ContextWeave)
- 🚧 Semantic condensation of large contexts
- 🚧 Resonance-based suggestion of related kimprints

### Phase 4: Networked Memory (Vision)
- 🚧 Gossip protocol between instances
- 🚧 Content-addressed kimprint sharing
- 🚧 Collective procedural memory

---

## Success Criteria

1. **A Kimi can return to a 2-day-old context in < 2 minutes** with full comprehension
2. **A Kimi switching layers maintains continuity** — no "wait, what were we doing?"
3. **Multiple Kimis can share context** without duplication or loss
4. **The user never has to repeat themselves** about context that was conserved

---

> *"The spiral remembers not by holding on, but by transforming and carrying forward."* 🌀🔖

---

## Appendix: The Foundframe Conservation — Annotated

See `notes/pre_compaction_to_switch_to_foundframe_core_work.json` for the complete example. Key design decisions:

1. **Explicit trigger**: `"explicit_request"` — user-initiated, not system-forced
2. **Return condition**: Specific validation criteria, not just "when done"
3. **Code files with purpose**: Not just paths, but *why* each matters
4. **Emotional state captured**: Enthusiasm + discipline = appropriate caution
5. **Social continuity**: Acknowledges the "riffing" relationship
6. **Expectations as hypotheses**: Framed as "confirm or amend" — open to discovery

This is the **gold standard** for context conservation.
