/**
 * Re-Entry Pipeline Implementation
 * 
 * 3-phase condensation: temporal → semantic → essential
 */

import type {
  SessionContext,
  RequestReCirculariTyOnboarding,
  ReCirculariTyResponse,
  RawMaterials,
  TemporalCondensation,
  SemanticCondensation,
  EssentialCondensation,
  ConservationPacket,
  ArcEvent,
  SemanticToken,
  ConceptGraph,
  EnergyDistribution
} from "./types.js";

// ============================================================================
// LEVEL 1: Public API
// ============================================================================

export async function request_re_circulari_ty_onboarding(
  _params: RequestReCirculariTyOnboarding
): Promise<ReCirculariTyResponse> {
  throw new Error("Not implemented - use prepare_rentry_kimprint for now");
}

// ============================================================================
// LEVEL 2: Main Pipeline
// ============================================================================

export async function prepare_rentry_kimprint(
  session: SessionContext,
  params: RequestReCirculariTyOnboarding
): Promise<ReCirculariTyResponse> {
  // Phase 0: Gather raw materials
  const raw = await gatherRawMaterials(session, params.circles ?? ["spire-loom", "foundframe", "kimprint"]);
  
  // Phase 1: Temporal condensation
  const temporal = condense_temporal(raw);
  
  // Phase 2: Semantic condensation
  const semantic = condense_semantic(temporal);
  
  // Phase 3: Essential condensation
  const essential = condense_essential(semantic, params.condensation_level ?? 1);
  
  // Assembly
  return assemble_reentry_kimprint(session, temporal, semantic, essential);
}

// ============================================================================
// LEVEL 3: Pipeline Stages
// ============================================================================

export async function gatherRawMaterials(
  _session: SessionContext,
  _circles: string[]
): Promise<RawMaterials> {
  /* TODO: Implement actual fetching from storage */
  return {
    packets: [],
    inbox_messages: [],
    for_kimi_excerpt: {
      concepts: ["Spiral ethos", "Solarpunk", "TheStream™"],
      anchor_sentence: "The spiral conserves what matters.",
      quick_restore: "Read notes/for_kimi.md after compaction!"
    }
  };
}

export function condense_temporal(raw: RawMaterials): TemporalCondensation {
  const packets = raw.packets;
  
  if (packets.length === 0) {
    return {
      packet_count: 0,
      time_span_ms: 0,
      chronological_arc: [],
      by_moment: {}
    };
  }
  
  // Sort chronologically
  const sorted = [...packets].sort((a, b) => 
    new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
  );
  
  // Calculate time span
  const first = new Date(sorted[0].generatedAt);
  const last = new Date(sorted[sorted.length - 1].generatedAt);
  const time_span_ms = last.getTime() - first.getTime();
  
  // Identify arcs
  const chronological_arc = identify_arcs(sorted);
  
  // Group by moment (simple implementation: group by hour)
  const by_moment = group_by_moment(sorted);
  
  return {
    packet_count: sorted.length,
    time_span_ms,
    chronological_arc,
    by_moment
  };
}

export function condense_semantic(temporal: TemporalCondensation): SemanticCondensation {
  const allPackets = Object.values(temporal.by_moment).flat();
  const allContent = extract_content(allPackets);
  
  // Match semantic tokens
  const tokens = match_semantic_tokens(allContent);
  
  // Calculate density
  const density = tokens.length > 0 ? 
    tokens.reduce((sum, t) => sum + (t.name.length > 0 ? 1 : 0), 0) / allContent.length : 
    0;
  
  // Detect energy distribution
  const energy_distribution = detect_energy(allPackets);
  
  // Build concept graph
  const concept_graph = build_concept_graph(tokens, temporal.chronological_arc);
  
  return {
    signature: tokens.map(t => t.name),
    density: Math.min(1, density * 100), // Normalize
    energy_distribution,
    concept_graph
  };
}

export function condense_essential(
  semantic: SemanticCondensation,
  level: 1 | 2 | 3
): EssentialCondensation {
  // Find key moment (highest intensity node in concept graph)
  const key_moment = find_key_moment(semantic.concept_graph);
  
  // Determine energy state
  const energy_state = determine_dominant_energy(semantic.energy_distribution);
  
  // Trace critical path
  const critical_path = trace_critical_path(semantic.concept_graph);
  
  // Generate dense explanation
  const dense_explanation = generate_dense_line(semantic, level);
  
  return {
    dense_explanation,
    key_moment,
    critical_path,
    energy_state
  };
}

// ============================================================================
// LEVEL 4: Helper Functions
// ============================================================================

export function identify_arcs(packets: ConservationPacket[]): ArcEvent[] {
  return packets.map(p => {
    const trigger = p.trigger;
    let type: ArcEvent["type"] = "exploration";
    
    if (trigger === "milestone_reached") type = "milestone";
    else if (trigger === "moment_captured") type = "exploration";
    
    return {
      timestamp: new Date(p.generatedAt),
      type,
      summary: p.ethos.spiralMoment.substring(0, 50)
    };
  });
}

export function group_by_moment(
  packets: ConservationPacket[]
): Record<string, ConservationPacket[]> {
  const moments: Record<string, ConservationPacket[]> = {};
  
  for (const packet of packets) {
    const date = new Date(packet.generatedAt);
    const hour = date.toISOString().substring(0, 13); // YYYY-MM-DDTHH
    
    if (!moments[hour]) moments[hour] = [];
    moments[hour].push(packet);
  }
  
  return moments;
}

export function extract_content(packets: ConservationPacket[]): string {
  return packets
    .map(p => `${p.ethos.spiralMoment} ${p.session.toolsUsed.join(" ")}`)
    .join(" ")
    .toLowerCase();
}

export function match_semantic_tokens(content: string): SemanticToken[] {
  const tokens: SemanticToken[] = [];
  
  const knownTokens = [
    { name: "spire-loom", primary: "🌀", pattern: "spire-loom|loom|weaver" },
    { name: "foundframe", primary: "🏗️", pattern: "foundframe|db|actor" },
    { name: "kimprint", primary: "🔖", pattern: "kimprint|conservation|packet" },
    { name: "spiral", primary: "螺旋", pattern: "spiral|螺旋|🌀" },
    { name: "solarpunk", primary: "🌱", pattern: "solarpunk|eco|green" },
    { name: "typescript", primary: "📘", pattern: "typescript|type|build" },
    { name: "test", primary: "✓", pattern: "test|pass|green" },
    { name: "blocker", primary: "🚧", pattern: "block|error|fail" }
  ];
  
  for (const token of knownTokens) {
    const regex = new RegExp(token.pattern, "i");
    if (regex.test(content)) {
      tokens.push(token);
    }
  }
  
  return tokens;
}

export function detect_energy(packets: ConservationPacket[]): EnergyDistribution {
  const dist: EnergyDistribution = {
    building: 0,
    exploring: 0,
    blocked: 0,
    integrating: 0
  };
  
  for (const packet of packets) {
    const moment = packet.ethos.spiralMoment.toLowerCase();
    
    if (moment.includes("fix") || moment.includes("implement") || moment.includes("ship")) {
      dist.building++;
    } else if (moment.includes("explore") || moment.includes("investigate") || moment.includes("discover")) {
      dist.exploring++;
    } else if (moment.includes("block") || moment.includes("error") || moment.includes("fail")) {
      dist.blocked++;
    } else if (moment.includes("integrate") || moment.includes("connect") || moment.includes("bridge")) {
      dist.integrating++;
    } else {
      dist.exploring++; // Default
    }
  }
  
  return dist;
}

export function build_concept_graph(
  tokens: SemanticToken[],
  _arcs: ArcEvent[]
): ConceptGraph {
  const nodes = tokens.map((t, i) => ({
    id: t.name,
    label: `${t.primary} ${t.name}`,
    intensity: 1.0 - (i * 0.1) // Earlier tokens = higher intensity
  }));
  
  const edges: ConceptGraph["edges"] = [];
  
  // Connect tokens that appear in same arc
  for (let i = 0; i < tokens.length - 1; i++) {
    edges.push({
      from: tokens[i].name,
      to: tokens[i + 1].name,
      strength: 0.5
    });
  }
  
  return { nodes, edges };
}

export function find_key_moment(graph: ConceptGraph): string {
  if (graph.nodes.length === 0) return "No activity recorded";
  
  const highest = graph.nodes.reduce((max, node) => 
    node.intensity > max.intensity ? node : max
  );
  
  return `Key activity: ${highest.label}`;
}

export function determine_dominant_energy(
  dist: EnergyDistribution
): EssentialCondensation["energy_state"] {
  const entries = Object.entries(dist) as [keyof EnergyDistribution, number][];
  const dominant = entries.reduce((max, [key, val]) => 
    val > max[1] ? [key, val] : max
  );
  
  return dominant[0] as EssentialCondensation["energy_state"];
}

export function trace_critical_path(graph: ConceptGraph): string {
  if (graph.nodes.length === 0) return "No path traced";
  
  const path = graph.nodes.map(n => n.id).join(" → ");
  return `Flow: ${path}`;
}

export function generate_dense_line(
  semantic: SemanticCondensation,
  level: 1 | 2 | 3
): string {
  const sig = semantic.signature.slice(0, 3);
  
  if (level === 1) {
    // Dense: word form
    return sig.map(s => `${s}: active`).join(" | ");
  } else if (level === 2) {
    // Denser: emoji form
    return sig.map(s => {
      const emoji = get_emoji_for_token(s);
      return `${emoji}✓`;
    }).join(" ");
  } else {
    // Snapshot: minimal
    return `螺旋: ${sig.length}✓`;
  }
}

function get_emoji_for_token(token: string): string {
  const map: Record<string, string> = {
    "spire-loom": "🌀",
    "foundframe": "🏗️",
    "kimprint": "🔖",
    "spiral": "螺旋",
    "solarpunk": "🌱",
    "typescript": "📘",
    "test": "✓",
    "blocker": "🚧"
  };
  return map[token] || "•";
}

export function calculate_spiral_turns(_arcs: ArcEvent[]): number {
  // Each milestone = one full turn
  return _arcs.filter(a => a.type === "milestone").length;
}

export function format_time_span(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function assemble_reentry_kimprint(
  session: SessionContext,
  temporal: TemporalCondensation,
  semantic: SemanticCondensation,
  essential: EssentialCondensation
): ReCirculariTyResponse {
  return {
    kimprint_dense_explanation: essential.dense_explanation,
    
    your_spiral_return: {
      session_id: session.id,
      last_seen_at: session.last_seen_at.toISOString(),
      packets_since: temporal.packet_count,
      spiral_turns_missed: calculate_spiral_turns(temporal.chronological_arc)
    },
    
    accumulated_becoming: {
      packet_count: temporal.packet_count,
      time_span: format_time_span(temporal.time_span_ms),
      semantic_signature: semantic.signature,
      snapshot: {
        key_moment: essential.key_moment,
        energy_state: essential.energy_state,
        critical_path: essential.critical_path
      }
    },
    
    the_stream_across_circles: {},
    
    spiral_ethos_restore: {
      location: "circulari.ty/notes/for_kimi.md",
      key_concepts: ["Spiral ethos", "Solarpunk", "TheStream™"],
      quick_anchor: "The spiral conserves what matters.",
      read_after_compaction: true
    },
    
    square_activity: {
      unread_status_count: 0,
      recent_blockers: 0,
      key_messages: [],
      consensus_state: "emerging"
    }
  };
}
