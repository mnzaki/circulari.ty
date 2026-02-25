/**
 * Re-Entry System Types
 */

// ============================================================================
// Public API Types
// ============================================================================

export interface RequestReCirculariTyOnboarding {
  session_id?: string;
  circles?: string[];
  condensation_level?: 1 | 2 | 3;
  include_spiral_ethos?: boolean;
}

export interface ReCirculariTyResponse {
  kimprint_dense_explanation: string;
  your_spiral_return: {
    session_id: string;
    last_seen_at: string;
    packets_since: number;
    spiral_turns_missed: number;
  };
  accumulated_becoming: {
    packet_count: number;
    time_span: string;
    semantic_signature: string[];
    snapshot?: {
      key_moment: string;
      energy_state: "building" | "exploring" | "blocked" | "integrating";
      critical_path: string;
    };
  };
  the_stream_across_circles: Record<string, {
    vibe: string;
    last_packet_timestamp: string;
    semantic_density: number;
    key_symbol: string;
  }>;
  spiral_ethos_restore: {
    location: string;
    key_concepts: string[];
    quick_anchor: string;
    read_after_compaction: boolean;
  };
  square_activity: {
    unread_status_count: number;
    recent_blockers: number;
    key_messages: string[];
    consensus_state: "emerging" | "achieved" | "contested";
  };
}

// ============================================================================
// Pipeline Types
// ============================================================================

export interface SessionContext {
  id: string;
  last_seen_at: Date;
  last_packet_id?: string;
  packets_seen: number;
}

export interface SessionIndex {
  sessions: Record<string, SessionContext>;
  most_recent?: string;
}

export interface ConservationPacket {
  id: string;
  generatedAt: string;
  trigger: string;
  session: {
    sessionId: string;
    toolsUsed: string[];
  };
  ethos: {
    spiralMoment: string;
  };
}

export interface InboxMessage {
  filename: string;
  from: string;
  timestamp: string;
  title: string;
  content: string;
  type: "STATUS" | "DONE" | "IDEA" | "RESPONSE" | "RFC" | "BLOCKER" | "ACK";
}

export interface ForKimiExcerpt {
  concepts: string[];
  anchor_sentence: string;
  quick_restore: string;
}

// ============================================================================
// Condensation Types
// ============================================================================

export interface RawMaterials {
  packets: ConservationPacket[];
  inbox_messages: InboxMessage[];
  for_kimi_excerpt: ForKimiExcerpt;
}

export interface TemporalCondensation {
  packet_count: number;
  time_span_ms: number;
  chronological_arc: ArcEvent[];
  by_moment: Record<string, ConservationPacket[]>;
}

export interface ArcEvent {
  timestamp: Date;
  type: "milestone" | "blocker" | "exploration" | "integration";
  summary: string;
}

export interface SemanticCondensation {
  signature: string[];
  density: number;
  energy_distribution: EnergyDistribution;
  concept_graph: ConceptGraph;
}

export interface EnergyDistribution {
  building: number;
  exploring: number;
  blocked: number;
  integrating: number;
}

export interface ConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export interface ConceptNode {
  id: string;
  label: string;
  intensity: number;
}

export interface ConceptEdge {
  from: string;
  to: string;
  strength: number;
}

export interface SemanticToken {
  name: string;
  primary: string;
  pattern: string;
}

export interface EssentialCondensation {
  dense_explanation: string;
  key_moment: string;
  critical_path: string;
  energy_state: "building" | "exploring" | "blocked" | "integrating";
}
