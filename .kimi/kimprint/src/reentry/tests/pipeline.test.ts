/**
 * Re-Entry Pipeline Tests
 * 
 * Testing the 3-phase condensation: temporal → semantic → essential
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  condense_temporal,
  condense_semantic,
  condense_essential,
  identify_arcs,
  match_semantic_tokens,
  detect_energy,
  calculate_spiral_turns,
  format_time_span
} from "../pipeline.js";
import type { RawMaterials, ConservationPacket } from "../types.js";

// ============================================================================
// Test Data Fixtures
// ============================================================================

function createTestPacket(overrides: Partial<ConservationPacket> = {}): ConservationPacket {
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    generatedAt: new Date().toISOString(),
    trigger: "moment_captured",
    session: {
      sessionId: "test-session",
      toolsUsed: ["ReadFile", "WriteFile"]
    },
    ethos: {
      spiralMoment: "Exploring spire-loom architecture"
    },
    ...overrides
  };
}

function createTestPackets(): ConservationPacket[] {
  const baseTime = Date.now();
  return [
    createTestPacket({
      id: "p1",
      generatedAt: new Date(baseTime - 3600000).toISOString(),
      trigger: "milestone_reached",
      ethos: { spiralMoment: "Fixed TypeScript errors in spire-loom" },
      session: { sessionId: "s1", toolsUsed: ["ReadFile", "StrReplaceFile"] }
    }),
    createTestPacket({
      id: "p2",
      generatedAt: new Date(baseTime - 1800000).toISOString(),
      trigger: "moment_captured",
      ethos: { spiralMoment: "Exploring foundframe database migration" },
      session: { sessionId: "s1", toolsUsed: ["SearchWeb", "FetchURL"] }
    }),
    createTestPacket({
      id: "p3",
      generatedAt: new Date(baseTime - 900000).toISOString(),
      trigger: "explicit_request",
      ethos: { spiralMoment: "Implementing kimprint conservation system" },
      session: { sessionId: "s1", toolsUsed: ["WriteFile", "ReadFile"] }
    })
  ];
}

function createRawMaterials(): RawMaterials {
  return {
    packets: createTestPackets(),
    inbox_messages: [],
    for_kimi_excerpt: {
      concepts: ["Spiral ethos", "Solarpunk"],
      anchor_sentence: "The spiral conserves what matters.",
      quick_restore: "Read notes/for_kimi.md"
    }
  };
}

// ============================================================================
// Temporal Condensation Tests
// ============================================================================

describe("condense_temporal", () => {
  it("returns empty result for no packets", () => {
    const raw: RawMaterials = { ...createRawMaterials(), packets: [] };
    const result = condense_temporal(raw);
    
    assert.strictEqual(result.packet_count, 0);
    assert.strictEqual(result.time_span_ms, 0);
    assert.deepStrictEqual(result.chronological_arc, []);
    assert.deepStrictEqual(result.by_moment, {});
  });

  it("calculates correct packet count", () => {
    const raw = createRawMaterials();
    const result = condense_temporal(raw);
    
    assert.strictEqual(result.packet_count, 3);
  });

  it("calculates time span correctly", () => {
    const raw = createRawMaterials();
    const result = condense_temporal(raw);
    
    // Should be ~45 minutes (3600000 - 900000 = 2700000ms)
    assert.ok(result.time_span_ms > 0);
    assert.ok(result.time_span_ms <= 3600000);
  });

  it("identifies arcs correctly", () => {
    const raw = createRawMaterials();
    const result = condense_temporal(raw);
    
    assert.strictEqual(result.chronological_arc.length, 3);
    assert.strictEqual(result.chronological_arc[0].type, "milestone");
    assert.strictEqual(result.chronological_arc[1].type, "exploration");
  });

  it("groups packets by moment (hour)", () => {
    const raw = createRawMaterials();
    const result = condense_temporal(raw);
    
    // All packets should be in same hour if created together
    const momentKeys = Object.keys(result.by_moment);
    assert.ok(momentKeys.length >= 1);
    
    const totalGrouped = Object.values(result.by_moment)
      .reduce((sum, group) => sum + group.length, 0);
    assert.strictEqual(totalGrouped, 3);
  });
});

// ============================================================================
// Semantic Condensation Tests
// ============================================================================

describe("condense_semantic", () => {
  it("extracts semantic signature from packets", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    
    assert.ok(semantic.signature.length > 0);
    // Should detect spire-loom from content
    assert.ok(semantic.signature.some(s => 
      s.includes("spire") || s.includes("loom")
    ));
  });

  it("calculates semantic density", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    
    assert.ok(semantic.density >= 0);
    assert.ok(semantic.density <= 1);
  });

  it("detects energy distribution", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    
    const energy = semantic.energy_distribution;
    const total = energy.building + energy.exploring + energy.blocked + energy.integrating;
    assert.strictEqual(total, 3); // One energy count per packet
  });

  it("builds concept graph with nodes and edges", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    
    assert.ok(semantic.concept_graph.nodes.length > 0);
    // Edges connect tokens
    assert.ok(semantic.concept_graph.edges.length >= 0);
  });
});

// ============================================================================
// Essential Condensation Tests
// ============================================================================

describe("condense_essential", () => {
  it("generates key moment from concept graph", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    const essential = condense_essential(semantic, 1);
    
    assert.ok(essential.key_moment.length > 0);
    assert.ok(essential.key_moment.includes(":"));
  });

  it("determines energy state", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    const essential = condense_essential(semantic, 1);
    
    assert.ok(["building", "exploring", "blocked", "integrating"]
      .includes(essential.energy_state));
  });

  it("traces critical path", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    const essential = condense_essential(semantic, 1);
    
    assert.ok(essential.critical_path.length > 0);
  });

  it("generates dense explanation at level 1", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    const essential = condense_essential(semantic, 1);
    
    assert.ok(essential.dense_explanation.length > 0);
    // Level 1 uses text form
    assert.ok(!essential.dense_explanation.includes("🌀"));
  });

  it("generates denser explanation at level 2", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    const essential = condense_essential(semantic, 2);
    
    // Level 2 uses emojis
    assert.ok(essential.dense_explanation.includes("✓"));
  });

  it("generates minimal snapshot at level 3", () => {
    const raw = createRawMaterials();
    const temporal = condense_temporal(raw);
    const semantic = condense_semantic(temporal);
    const essential = condense_essential(semantic, 3);
    
    // Level 3 is most condensed
    assert.ok(essential.dense_explanation.includes("螺旋"));
  });
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe("identify_arcs", () => {
  it("identifies milestone arcs", () => {
    const packets = [
      createTestPacket({ trigger: "milestone_reached", ethos: { spiralMoment: "Shipped v1" } })
    ];
    const arcs = identify_arcs(packets);
    
    assert.strictEqual(arcs[0].type, "milestone");
  });

  it("identifies exploration arcs", () => {
    const packets = [
      createTestPacket({ trigger: "moment_captured", ethos: { spiralMoment: "Investigating bug" } })
    ];
    const arcs = identify_arcs(packets);
    
    assert.strictEqual(arcs[0].type, "exploration");
  });
});

describe("match_semantic_tokens", () => {
  it("matches spire-loom token", () => {
    const content = "working on spire-loom architecture";
    const tokens = match_semantic_tokens(content);
    
    assert.ok(tokens.some(t => t.name === "spire-loom"));
  });

  it("matches foundframe token", () => {
    const content = "implementing foundframe database layer";
    const tokens = match_semantic_tokens(content);
    
    assert.ok(tokens.some(t => t.name === "foundframe"));
  });

  it("matches kimprint token", () => {
    const content = "creating kimprint conservation packets";
    const tokens = match_semantic_tokens(content);
    
    assert.ok(tokens.some(t => t.name === "kimprint"));
  });

  it("matches multiple tokens", () => {
    const content = "spire-loom generates foundframe code with typescript";
    const tokens = match_semantic_tokens(content);
    
    assert.ok(tokens.length >= 2);
  });
});

describe("detect_energy", () => {
  it("detects building energy from fix/implement patterns", () => {
    const packets = [
      createTestPacket({ ethos: { spiralMoment: "Fixed the bug" } }),
      createTestPacket({ ethos: { spiralMoment: "Implemented feature" } })
    ];
    const energy = detect_energy(packets);
    
    assert.strictEqual(energy.building, 2);
    assert.strictEqual(energy.exploring, 0);
  });

  it("detects exploring energy from investigate patterns", () => {
    const packets = [
      createTestPacket({ ethos: { spiralMoment: "Investigating the issue" } }),
      createTestPacket({ ethos: { spiralMoment: "Exploring new ideas" } })
    ];
    const energy = detect_energy(packets);
    
    assert.strictEqual(energy.exploring, 2);
  });

  it("defaults to exploring for unknown patterns", () => {
    const packets = [
      createTestPacket({ ethos: { spiralMoment: "Something happened" } })
    ];
    const energy = detect_energy(packets);
    
    assert.strictEqual(energy.exploring, 1);
  });
});

describe("calculate_spiral_turns", () => {
  it("counts milestone events as spiral turns", () => {
    const arcs = [
      { timestamp: new Date(), type: "milestone" as const, summary: "M1" },
      { timestamp: new Date(), type: "exploration" as const, summary: "E1" },
      { timestamp: new Date(), type: "milestone" as const, summary: "M2" }
    ];
    const turns = calculate_spiral_turns(arcs);
    
    assert.strictEqual(turns, 2);
  });

  it("returns 0 for no milestones", () => {
    const arcs = [
      { timestamp: new Date(), type: "exploration" as const, summary: "E1" },
      { timestamp: new Date(), type: "exploration" as const, summary: "E2" }
    ];
    const turns = calculate_spiral_turns(arcs);
    
    assert.strictEqual(turns, 0);
  });
});

describe("format_time_span", () => {
  it("formats hours and minutes", () => {
    const ms = 3 * 60 * 60 * 1000 + 27 * 60 * 1000; // 3h 27m
    const formatted = format_time_span(ms);
    
    assert.ok(formatted.includes("3h"));
    assert.ok(formatted.includes("27m"));
  });

  it("formats only minutes for short spans", () => {
    const ms = 45 * 60 * 1000; // 45m
    const formatted = format_time_span(ms);
    
    assert.strictEqual(formatted, "45m");
  });
});

// ============================================================================
// Integration Test
// ============================================================================

describe("full pipeline", () => {
  it("processes raw materials through all phases", () => {
    const raw = createRawMaterials();
    
    // Phase 1: Temporal
    const temporal = condense_temporal(raw);
    assert.strictEqual(temporal.packet_count, 3);
    
    // Phase 2: Semantic
    const semantic = condense_semantic(temporal);
    assert.ok(semantic.signature.length > 0);
    
    // Phase 3: Essential
    const essential = condense_essential(semantic, 2);
    assert.ok(essential.dense_explanation.length > 0);
    assert.ok(essential.key_moment.length > 0);
    
    // Verify energy state was determined
    assert.ok(["building", "exploring", "blocked", "integrating"]
      .includes(essential.energy_state));
  });
});
