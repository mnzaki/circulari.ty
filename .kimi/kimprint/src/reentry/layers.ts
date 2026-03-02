/**
 * Context Conservation Layers
 * 
 * Multi-layer conservation for different types of context shifts:
 * - Working memory (files, tools, code)
 * - Mental model (architecture, patterns, relationships)
 * - Emotional state (mood, energy, curiosity, caution)
 * - Social continuity (tone, rapport, conversation history)
 * - Expectations (questions, hypotheses, validation criteria)
 */

// ============================================================================
// Layer 1: Working Memory (The Artifact Layer)
// ============================================================================

export interface FileReference {
  path: string;
  line?: number;
  column?: number;
  why_important: string;
  what_to_look_for: string;
  content_hash?: string; // For detecting changes
}

export interface ToolCall {
  tool: string;
  arguments: Record<string, unknown>;
  timestamp: string;
  result_summary: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  context: string; // Where this came from
  purpose: string;
}

export interface ArtifactLayer {
  files_read: FileReference[];
  tools_used: ToolCall[];
  code_snippets: CodeSnippet[];
}

// ============================================================================
// Layer 2: Mental Model (The Understanding Layer)
// ============================================================================

export interface ArchitectureNode {
  name: string;
  type: "component" | "service" | "entity" | "interface" | "dataflow";
  description: string;
  relationships: string[]; // IDs of related nodes
}

export interface Pattern {
  name: string;
  description: string;
  where_used: string[];
  why_matters: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: "imports" | "calls" | "generates" | "depends_on" | "implements";
  description: string;
}

export interface UnderstandingLayer {
  architecture: ArchitectureNode[];
  patterns_learned: Pattern[];
  relationships: Relationship[];
  current_focus: string; // What I was thinking about
}

// ============================================================================
// Layer 3: Emotional State (The Resonance Layer)
// ============================================================================

export type Mood = 
  | "excited" 
  | "curious" 
  | "cautious" 
  | "frustrated" 
  | "satisfied" 
  | "confused" 
  | "inspired";

export type EnergyLevel = "high" | "medium" | "low" | "depleted";

export interface EmotionalState {
  mood: Mood;
  energy: EnergyLevel;
  curiosity_directions: string[]; // "Want to understand X"
  caution_areas: string[]; // "Be careful about Y"
  pride_in: string[]; // "Happy about Z"
  disciplined_about: string[]; // "Resisting urge to..."
}

// ============================================================================
// Layer 4: Social Continuity (The Relationship Layer)
// ============================================================================

export type ConversationTone = 
  | "exploratory" 
  | "focused" 
  | "playful" 
  | "serious" 
  | "collaborative" 
  | "instructional";

export interface SocialContinuity {
  conversation_tone: ConversationTone;
  shared_jokes: string[]; // "Remember when..."
  rapport_markers: string[]; // "We were riffing on..."
  user_preferences_learned: string[]; // "User likes..."
  communication_patterns: string[]; // "We use X pattern"
}

// ============================================================================
// Layer 5: Expectations (The Pending Layer)
// ============================================================================

export interface Question {
  text: string;
  urgency: "blocking" | "important" | "curiosity";
  context: string;
}

export interface Hypothesis {
  statement: string;
  confidence: number; // 0-1
  validation_needed: string[];
}

export interface ValidationCriterion {
  description: string;
  how_to_verify: string;
  expected_outcome: string;
}

export interface PendingLayer {
  questions: Question[];
  hypotheses: Hypothesis[];
  validation_criteria: ValidationCriterion[];
  return_conditions: string[]; // "Return when X is true"
  potential_discoveries: string[]; // "May find that..."
}

// ============================================================================
// The Complete Conservation Package
// ============================================================================

export interface ConservationPackage {
  // Metadata
  id: string;
  timestamp: string;
  trigger: "compaction" | "task_complete" | "blocker_hit" | "discovery" | "layer_descent" | "explicit_request";
  
  // The 5 layers
  artifacts: ArtifactLayer;
  understanding: UnderstandingLayer;
  resonance: EmotionalState;
  continuity: SocialContinuity;
  pendings: PendingLayer;
  
  // Navigation
  summary: string; // One-line summary for quick scan
  keywords: string[]; // For search/resonance
  related_packages: string[]; // IDs of related conservation packages
  
  // Re-entry
  reentry_instructions: {
    state_of_mind: string;
    first_actions: string[];
    what_changed: string; // What's different now vs when conserved
  };
}

// ============================================================================
// Layer Descent Specific Types
// ============================================================================

export interface LayerDescentContext {
  from_layer: {
    name: string;
    abstraction_level: "ui" | "app" | "bridge" | "service" | "core" | "storage";
    language?: string;
    paradigm?: string;
  };
  to_layer: {
    name: string;
    abstraction_level: "ui" | "app" | "bridge" | "service" | "core" | "storage";
    language?: string;
    paradigm?: string;
  };
  bridge: {
    description: string; // How these layers connect
    interface_contract: string;
    expectations: string[];
  };
}

// ============================================================================
// Re-entry Condition Types
// ============================================================================

export interface ReentryCondition {
  type: "time" | "event" | "milestone" | "manual";
  description: string;
  criteria: {
    time?: { after: string }; // ISO date
    event?: { pattern: string; path?: string }; // File/event pattern
    milestone?: { name: string; criteria: string };
    manual?: { trigger_phrase: string };
  };
  validation?: string; // How to verify condition is met
}

// ============================================================================
// Relevance Scoring
// ============================================================================

export interface RelevanceFactors {
  temporal_proximity: number; // 0-1, higher = more recent
  semantic_similarity: number; // 0-1, domain overlap
  task_continuity: number; // 0-1, goals alignment
  emotional_resonance: number; // 0-1, energy match
}

export function calculateRelevance(
  _conservation: ConservationPackage,
  _currentContext: {
    timestamp: string;
    domain: string[];
    goals: string[];
    energy: EnergyLevel;
  }
): number {
  // TODO: Implement actual scoring algorithm
  // For now, return placeholder
  return 0.5;
}
