/**
 * ResonancePattern Core Types
 * 
 * The semantic condensation data type with composable operators.
 */

import type { FQED } from "./fqed.js";

// ============================================================================
// Core Pattern
// ============================================================================

export interface ResonancePattern {
  /** Content-addressed ID (hash of signature + provenance) */
  id: string;
  
  /** What concepts are present */
  signature: SemanticSignature;
  
  /** How concepts relate */
  structure: PatternStructure;
  
  /** Emotional/activity state (FQED format) */
  energy: EnergySignature;
  
  /** Where this pattern came from */
  provenance: Provenance;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Condensation level: 1=raw, 2=structured, 3=semantic, 4=essential */
  condensationLevel: 1 | 2 | 3 | 4;
  
  /** Relationships to other patterns */
  relationships: PatternRelationships;
}

// ============================================================================
// Semantic Signature
// ============================================================================

export interface SemanticSignature {
  /** The tokens/concepts present */
  tokens: SemanticToken[];
  
  /** Domain classification */
  domain: string[];
  
  /** Project circles */
  circles: string[];
  
  /** Content hash for addressing */
  semanticHash: string;
  
  /** Source type */
  sourceType: "session" | "error" | "conversation" | "documentation" | "code";
  
  /** Reference to original source */
  sourceRef: string;
}

export interface SemanticToken {
  /** Token name */
  name: string;
  
  /** Primary optimal unicode encoding */
  primary: string;
  
  /** Expansions for different contexts */
  expansions: {
    en?: string;
    zh?: string;
    emoji?: string;
    technical?: string;
    [key: string]: string | undefined;
  };
  
  /** Accumulating regex pattern for matching */
  pattern: string;
  
  /** Category */
  category: "project" | "concept" | "action" | "state" | "entity";
  
  /** Intensity in this pattern (0-1) */
  intensity: number;
  
  /** Confidence (0-1) */
  confidence: number;
  
  /** Alternative names */
  aliases: string[];
  
  /** Related concepts */
  related: string[];
}

// ============================================================================
// Pattern Structure
// ============================================================================

export interface PatternStructure {
  /** Concept relationship graph */
  graph: ConceptGraph;
  
  /** Temporal arc (if applicable) */
  arc?: ArcStructure;
  
  /** Hierarchical nesting */
  nesting: NestingLevel[];
  
  /** Most important node IDs */
  keyNodes: string[];
  
  /** Critical path through graph */
  criticalPath?: string[];
}

export interface ConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export interface ConceptNode {
  id: string;
  tokenRef: string;
  weight: number;
}

export interface ConceptEdge {
  from: string;
  to: string;
  type: "causes" | "enables" | "contains" | "relates_to" | "precedes" | "follows";
  strength: number;
}

export interface ArcStructure {
  start: string;
  middle?: string;
  end: string;
}

export interface NestingLevel {
  parent: string;
  children: string[];
  depth: number;
}

// ============================================================================
// Energy Signature (FQED Format)
// ============================================================================

export interface EnergySignature {
  /** FQED -> intensity mapping */
  energies: Record<FQED, number>;
  
  /** Dominant energy (highest intensity) */
  dominant: FQED;
  
  /** Top 3 energies */
  secondary: FQED[];
  
  /** Temporal trajectory */
  trajectory: "rising" | "falling" | "stable" | "oscillating" | "chaotic";
  
  /** Volatility (0-1) */
  volatility: number;
  
  /** Emotional mood */
  mood: "excited" | "curious" | "cautious" | "frustrated" | "satisfied" | "confused" | "inspired";
  
  /** Overall intensity */
  intensity: "surging" | "flowing" | "meandering" | "dormant";
}

// ============================================================================
// Provenance
// ============================================================================

export interface Provenance {
  createdBy: string;
  creationTrigger: "explicit_request" | "milestone" | "compaction" | "error" | "periodic";
  derivedFrom?: string[];
  derivationMethod: "extraction" | "composition" | "transformation" | "condensation";
  sessionContext?: {
    timestamp: string;
    workingDirectory: string;
    gitCommit?: string;
  };
}

// ============================================================================
// Relationships
// ============================================================================

export interface PatternRelationships {
  resonatesWith: PatternReference[];
  evolvedFrom: PatternReference[];
  evolvedInto: PatternReference[];
  contains: PatternReference[];
  containedBy: PatternReference[];
}

export interface PatternReference {
  id: string;
  resonanceScore?: number;
  relationshipType: string;
}

// ============================================================================
// Operator Types
// ============================================================================

export type Operator<TArgs, TReturn> = (pattern: ResonancePattern, ...args: TArgs[]) => TReturn;

export interface WeaveOptions {
  mode?: "blend" | "layer";
  weights?: [number, number];
}

export interface EchoOptions {
  threshold?: number;
  limit?: number;
}

export interface RefocusLens {
  category?: string;
  extract?: "energies" | "tokens" | "relationships";
  minIntensity?: number;
}
