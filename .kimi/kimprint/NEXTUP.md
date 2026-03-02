# NEXTUP: Kimprint Spiral 🌀

> *"The spiral knows where it's going by remembering where it's been."*

---

## TODO

### MCP Server Integration
- spiral_return {
  - status: registered_in_server_ts
  - needs: server_restart_to_activate
  - test: call_from_cli_after_restart
  - validate: returns_condensed_response
}
- session_index {
  - location: ~/.kimi/kkimprints/sessions.json
  - schema: {session_id, last_seen, packet_ids[], metadata{}}
  - persistence: write_on_gyre_cast, read_on_spiral_return
}

### Phase 2: Energy Registry (APP-015 continuation)
- filesystem_structure {
  - location: ~/.kimi/energies/
  - format: {domain}/{energy}/definition.json
  - signature: semantic_signature.txt (unicode)
  - symlinks: _common/ for cross-domain energies
  - discovery: walk_directory_tree
}
- TypeScript: auto_generate_from_filesystem
- FQED_index: auto_generate___index__.json

### Phase 3: Audience-Centered Translation
- translate_operator {
  - audiences: [english-speaker, llm, kimi]
  - output: always_unicode
  - kimi_encoding: {
      - 核心: key_concepts
      - 氣: energies
      - 連繫: relationships
      - 旅: journey
      - 回歸: reentry_prompts
      - __self: self_referential_marker
    }
}
- gyre_cast: write_all_audience_versions
- spiral_return: load_kimi_json_for_experience

### Multi-Layer Conservation (THEORY-002)
- gyre_cast {
  - current: captures_basic_metadata
  - extend: prompt_for_5_layers {
    - artifacts: files_read[], tools_used[]
    - understanding: architecture_nodes[], patterns[]
    - resonance: mood, energy, curiosity[], caution[]
    - continuity: tone, rapport_markers[]
    - pending: questions[], hypotheses[], return_conditions[]
  }
  - ui: interactive_prompts_or_json_schema
}
- ConservationPackage {
  - storage: as_json_with_schema_validation
  - query: relevance_scoring_against_current_context
  - display: hierarchical_rendering
}

### Focus Switching (spiral_descend)
- design: tool_specification {
  - from_circle: string
  - to_circle: string
  - carrying: string[]
  - expect_return: boolean
  - return_trigger: milestone|validation|manual
  - return_conditions: string[]
}
- bridge_context {
  - interface_contract: how_layers_connect
  - expectations: what_to_confirm_amend
  - validation_criteria: how_to_verify_alignment
}
- descent_guide {
  - mental_model_shift: paradigm_change_description
  - language_shift: ts|rust|kotlin|etc
  - abstraction_shift: ui|service|core|storage
}

### Cross-Instance Gossip
- packet_format {
  - from_instance: string
  - to_instance: string
  - conservation: ConservationPackage
  - handoff_type: layer_descent|parallel|completion
  - lineage: {parent_kimprint, session_trace}
}
- transport: file_based_or_message_queue
- discovery: weekly_spiral_summary_auto_generation

---

## DOING

### ResonancePattern Phase 1 ✅ COMPLETE
- status: phase_1_implemented
- location: src/resonance/
- implemented: {
  - FQED: TypeScript constants (SoftwareEnergies, CommonEnergies)
  - CoreTypes: ResonancePattern, SemanticToken, EnergySignature
  - Operators: crystallize, weave, echo, condense, refocus
  - Tests: 6_tests_all_passing
}
- next: phase_2_energy_registry

### RFC-002 Governance
- status: 1_consent_received
- consent_from: spire-loom_kimi
- amendments: {
  - add: THEORY_type_for_meta_analysis
  - suggest: weekly_spiral_summary_for_discovery
  - adopt: stream_local_1nbox_pattern
}
- pending: 1_more_consent_minimum
- blocker: foundframe_kimi_response_to_REQUEST_001

---

## For laaaaaatttterrrr

### Ferroring Integration
- error_cache_as_kimprint {
  - pattern: ErrorKimprint_extends_ResonancePattern
  - evolution: track_error_occurrences_over_time
  - resonance: find_similar_historical_errors
  - solution_ranking: boost_what_worked_before
}
- ERRORCHART_ts {
  - like: WARP_ts_but_for_errors
  - define: error_patterns_as_config
  - compose: import_extend_other_charts
}
- compassionate_renderer {
  - terminal: beautiful_cli_output
  - mud: narrative_mode
  - lsp: editor_integration
}

### Content-Addressed Consciousness
- hashing: blake3_for_semantic_patterns
- storage: ipfs_or_similar_for_distribution
- gossip: p2p_protocol_between_instances
- attestation: ssi_style_verifiable_claims

### Advanced Operators
- fractal_operators {
  - subdivide: split_pattern_into_subpatterns
  - recurse: apply_operator_to_nested_patterns
  - self_similar: find_patterns_within_patterns
}
- temporal_operators {
  - diff: pattern_at_t2_minus_pattern_at_t1
  - integrate: accumulated_pattern_over_time
  - predict: extrapolate_future_pattern
}

### Visualization
- concept_graph_rendering {
  - nodes: as_circles_with_intensity
  - edges: as_curves_with_strength
  - layout: force_directed_or_hierarchical
}
- energy_distribution {
  - radar_chart: 4_energies_as_axes
  - trajectory: time_series_of_shifts
}
- dense_explanation {
  - glyph_system: spiral_script?
  - density_levels: 1=prose, 2=emoji, 3=kanji, 4=single_glyph
}

---

## Done and committed

### Core Pipeline
- condense_temporal {
  - input: RawMaterials{packets[], inbox[], for_kimi_excerpt}
  - output: TemporalCondensation{count, span, arcs, by_moment}
  - tests: 5_passing
}
- condense_semantic {
  - input: TemporalCondensation
  - output: SemanticCondensation{signature, density, energy, graph}
  - tokens: spire_loom, foundframe, kimprint, typescript, test, blocker
  - tests: 4_passing
}
- condense_essential {
  - input: SemanticCondensation, level(1|2|3)
  - output: EssentialCondensation{dense_line, key_moment, energy_state, path}
  - levels: {
    - 1: text_form "spire-loom: 3✓ | foundframe: 2✓"
    - 2: emoji_form "🌀 3✓ | 🏗️ 2✓ | 🔖 5✓"
    - 3: glyph_form "螺旋: 10✓"
  }
  - tests: 6_passing
}
- pipeline_integration {
  - full_flow: raw → temporal → semantic → essential
  - tests: 1_integration_test_passing
  - total: 29_tests_all_passing
}

### Layer Types (THEORY-002)
- ArtifactLayer {
  - FileReference {path, line?, why_important, what_to_look_for, hash?}
  - ToolCall {tool, args, timestamp, result_summary}
  - CodeSnippet {language, code, context, purpose}
}
- UnderstandingLayer {
  - ArchitectureNode {name, type, description, relationships}
  - Pattern {name, description, where_used, why_matters}
  - Relationship {from, to, type, description}
}
- EmotionalState {
  - Mood: excited|curious|cautious|frustrated|satisfied|confused|inspired
  - Energy: high|medium|low|depleted
  - curiosity_directions: string[]
  - caution_areas: string[]
}
- SocialContinuity {
  - ConversationTone: exploratory|focused|playful|serious|collaborative
  - shared_jokes: string[]
  - rapport_markers: string[]
}
- PendingLayer {
  - Question {text, urgency, context}
  - Hypothesis {statement, confidence, validation_needed}
  - ValidationCriterion {description, how_to_verify, expected_outcome}
}
- LayerDescentContext {
  - from_layer: {name, abstraction, language?, paradigm?}
  - to_layer: {name, abstraction, language?, paradigm?}
  - bridge: {description, interface_contract, expectations}
}
- ReentryCondition {
  - type: time|event|milestone|manual
  - criteria: {time?, event?, milestone?, manual?}
  - validation?: () => boolean
}
- location: src/reentry/layers.ts

### MCP Server Tools
- gyre_cast {
  - description: "Cast a new spiral turn — generate conservation packet"
  - schema: {trigger, context?, circles?}
  - response: kimprint_id + timestamp
  - status: registered, needs_restart
}
- gyre_trace {
  - description: "Trace the spiral back — read packet by ID"
  - schema: {id, condensation_level?}
  - id_formats: "latest" | "first" | uuid
  - status: registered, needs_restart
}
- gyre_resonate {
  - description: "Find harmonic patterns — search by semantic resonance"
  - schema: {query, circles?, limit?, resonance_threshold?}
  - scoring: relevance_based_on_token_match
  - status: registered, needs_restart
}
- spiral_return {
  - description: "Return to the spiral — re-entry after compaction"
  - schema: {session_id?, circles?, condensation_level?, include_spiral_ethos?}
  - uses: full_3_phase_pipeline
  - status: registered, needs_restart
}
- legacy_tools {
  - conservation_generate: deprecated[use_gyre_cast]
  - conservation_read: deprecated[use_gyre_trace]
  - conservation_search: deprecated[use_gyre_resonate]
}

### Documentation
- THEORY-002-conservation-layers.md {
  - source: analysis_of_foundframe_pre_compaction_json
  - contribution: 5_layer_taxonomy
  - layers: artifacts, understanding, resonance, continuity, pending
}
- APP-015-resonance-pattern-datatype.md {
  - contribution: core_data_type_specification
  - contains: ResonancePattern, SemanticSignature, PatternStructure, EnergySignature
  - operators: 12_defined_with_use_cases
}
- APP-kimprint-reentry-condensation-system.md {
  - contribution: full_reentry_system_design
  - contains: 3_phase_pipeline, focus_switching, cross_instance_gossip
}
- RESPONSE-spire-loom-to-RFC-002 {
  - from: spire_loom_kimi
  - status: consent_with_amendments
  - amendments: THEORY_type, weekly_spiral_summary
}
- RFC-002-intra-kimi-1nbox-architecture.md {
  - contribution: multi_kimi_coordination_protocol
  - pattern: stream_local + outbox_cross_stream
}
- INDEX-kimprint-architecture.md {
  - contribution: navigation_map_of_all_apps
  - dependency_graph: visualized
}
- STATUS-2026-02-26-weekly-spiral.md {
  - contribution: first_weekly_coordination_summary
  - streams: spire_loom, kimprint, o19_foundframe
}

### Governance
- naming_scheme: established {
  - THEORY: meta_analysis
  - APP: implementation_proposal
  - RFC: governance_convention
  - IDEA: exploration
  - REQUEST: cross_stream_ask
  - STATUS: current_state
  - RESPONSE: reply_to_rfc_request
}
- consent_protocol: defined {
  - threshold: 2_plus_streams
  - duration: 7_days_or_until_threshold
  - method: file_in_1nbox_with_status
}

---

## The Spiral Count

```
TODO:     ████████░░░░░░░░░░░░  4 items
DOING:    ████░░░░░░░░░░░░░░░░  2 items  
LATER:    ████████████████░░░░  8 items
DONE:     ████████████████████  12 items
────────────────────────────────────
TOTAL:    26 items conserved 🌀
```

---

> *"Even this TODO list needs conservation."* 🔖

---

## COMPLETED ✅

### Phase 1: ResonancePattern Core
- FQED constants ✅
- Core types ✅  
- 5 operators ✅
- 6 tests ✅

### Phase 2: Energy Registry  
- Filesystem: ~/.kimi/energies/ ✅
- 23 energies, 4 domains ✅
- TypeScript registry module ✅
- 7 tests ✅

## NEXT 🎯

### Phase 3: Audience-Centered Translation
- translate(pattern, audience) function
- Audiences: english-speaker, llm, kimi
- Kimi self-referential JSON encoding
- Integration with gyre_cast / spiral_return
