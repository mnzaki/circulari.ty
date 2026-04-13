/**
 * Bootstrap Schema Types
 * 
 * Self-documenting bootstrap schemas with embedded health tracking.
 * Each bootstrap kind (ETHOS, STRUCTURE, STATE) has its own update frequency
 * and maintenance guidance embedded in the schema itself.
 */

// ============================================================================
// Health Tracking (All Kinds)
// ============================================================================

export interface BootstrapHealth {
  /** ISO timestamp of last update */
  last_updated: string;
  
  /** Who/what last updated this bootstrap */
  updated_by?: string;
  
  /** How often this bootstrap should be updated */
  update_frequency: "rare" | "monthly" | "continuous";
  
  /** ISO timestamp of next recommended review */
  next_review?: string;
  
  /** Confidence level 0-1 in current content accuracy */
  confidence: number;
  
  /** Current freshness status */
  staleness: "fresh" | "aging" | "stale";
  
  /** Warnings about observed vs declared mismatches */
  warnings?: string[];
  
  /** TODOs for maintaining this bootstrap */
  todos?: string[];
  
  /** Reason for last update */
  update_reason?: string;
}

// ============================================================================
// Common Fields (All Kinds)
// ============================================================================

export interface BootstrapBase {
  /** Schema version */
  version: string;
  
  /** Bootstrap kind: ethos | structure | state */
  kind: "ethos" | "structure" | "state";
  
  /** Human-readable name */
  name: string;
  
  /** Stream this bootstrap belongs to */
  stream: string;
  
  /** Maintenance guidance - when and how to update */
  _guideline: string;
  
  /** Health tracking metadata */
  _health: BootstrapHealth;
}

// ============================================================================
// Resonance Query (All Kinds)
// ============================================================================

export interface ResonanceQuery {
  /** The gyre query string */
  query: string;
  
  /** Why this query matters */
  purpose: string;
  
  /** Guidance on when to update this query */
  when_to_update: string;
}

// ============================================================================
// Essential Read (All Kinds)
// ============================================================================

export interface EssentialRead {
  /** Path to the file */
  path: string;
  
  /** Why this file matters */
  why: string;
  
  /** Guidance on when to update this entry */
  when_to_update: string;
}

// ============================================================================
// ETHOS Bootstrap - Layer 6/5: Foundation/Company Philosophy
// ============================================================================

export interface EthosPrinciple {
  /** Principle name */
  principle: string;
  
  /** What this means in practice */
  meaning: string;
  
  /** When to update this principle */
  when_to_update: string;
}

export interface EthosBootstrap extends BootstrapBase {
  kind: "ethos";
  
  stream_identity: {
    /** Why this stream exists (one sentence) */
    purpose: string;
    
    /** Core principles guiding the stream */
    principles: EthosPrinciple[];
    
    /** How decisions are made */
    governance: string;
  };
  
  /** Queries to find philosophical context in gyre */
  resonance_queries: ResonanceQuery[];
  
  /** Essential philosophy documents */
  essential_reads: EssentialRead[];
}

// ============================================================================
// STRUCTURE Bootstrap - Layer 4/3/2: Product/Framework/Generation
// ============================================================================

export interface Dependency {
  /** Stream name */
  stream: string;
  
  /** How this stream relates */
  relationship: "uses" | "extends" | "integrates_with" | "depends_on";
  
  /** When to update this dependency entry */
  when_to_update: string;
}

export interface KeyConcept {
  /** Concept name */
  concept: string;
  
  /** What this concept means here */
  meaning: string;
  
  /** When to add/remove this concept */
  when_to_update: string;
}

export interface ArchitecturePattern {
  /** Pattern name */
  pattern: string;
  
  /** Where this pattern is used */
  where_used: string;
  
  /** When to update this pattern entry */
  when_to_update: string;
}

export interface TechStackItem {
  /** Technology name */
  technology: string;
  
  /** Version string */
  version: string;
  
  /** When to update this entry */
  when_to_update: string;
}

export interface StructureBootstrap extends BootstrapBase {
  kind: "structure";
  
  project_identity: {
    /** Type of project */
    type: "app" | "library" | "infrastructure" | "meta";
    
    /** What this stream builds (one sentence) */
    mission: string;
    
    /** How it builds it (philosophy/approach) */
    approach: string;
  };
  
  product_stack: {
    /** Primary component */
    core: string;
    
    /** Dependencies on other streams */
    dependencies: Dependency[];
    
    /** Key architectural concepts */
    key_concepts: KeyConcept[];
  };
  
  architecture: {
    /** Patterns used */
    patterns: ArchitecturePattern[];
    
    /** Technology stack */
    tech_stack: TechStackItem[];
  };
  
  /** Queries for architectural context */
  resonance_queries: ResonanceQuery[];
}

// ============================================================================
// STATE Bootstrap - Layer 1/0: Knowledge/Substrate Current Work
// ============================================================================

export interface ActiveApp {
  /** APP ID */
  id: string;
  
  /** APP title */
  title: string;
  
  /** Current status */
  status: "in_progress" | "complete" | "blocked" | "planning";
  
  /** When to update this entry */
  when_to_update: string;
}

export interface InFlightApp {
  /** APP ID */
  id: string;
  
  /** APP title */
  title: string;
  
  /** When to move/completed this */
  when_to_update: string;
}

export interface CompletedApp {
  /** APP ID */
  id: string;
  
  /** APP title */
  title: string;
  
  /** ISO timestamp of completion */
  completed_at: string;
  
  /** When to archive this */
  when_to_update: string;
}

export interface Urgency {
  /** Description of the urgent matter */
  urgency: string;
  
  /** Source file (e.g., 1NBOX/BUG-001.md) */
  source?: string;
  
  /** Priority level */
  priority: "high" | "medium" | "low";
  
  /** When to remove/update this urgency */
  when_to_update: string;
}

export interface ActiveStream {
  /** Stream name */
  stream: string;
  
  /** Relationship to this stream */
  relationship: "waiting_for" | "blocked_by" | "collaborating_with" | "watching";
  
  /** What we're waiting for/blocking on */
  what: string;
  
  /** When to update this relationship */
  when_to_update: string;
}

export interface StateBootstrap extends BootstrapBase {
  kind: "state";
  
  current_work: {
    /** Currently active APP */
    active_app: ActiveApp;
    
    /** APPs in flight (not yet complete) */
    in_flight: InFlightApp[];
    
    /** Recently completed APPs */
    recently_completed: CompletedApp[];
  };
  
  /** Current urgencies */
  urgencies: Urgency[];
  
  /** Active relationships with other streams */
  active_streams: ActiveStream[];
  
  /** Essential reads for current context */
  essential_reads: EssentialRead[];
  
  /** Queries for current work context */
  resonance_queries: ResonanceQuery[];
}

// ============================================================================
// Union Type for All Bootstraps
// ============================================================================

export type Bootstrap = EthosBootstrap | StructureBootstrap | StateBootstrap;

// ============================================================================
// Bootstrap Set (All Three Kinds for a Stream)
// ============================================================================

export interface BootstrapSet {
  ethos?: EthosBootstrap;
  structure?: StructureBootstrap;
  state?: StateBootstrap;
}

// ============================================================================
// Maintenance Guidance (for health checks)
// ============================================================================

export const MAINTENANCE_GUIDANCE: Record<Bootstrap["kind"], string> = {
  ethos: "ETHOS: Rare updates. Change only when core philosophy shifts. Add principles when new ethical patterns emerge. Review quarterly.",
  structure: "STRUCTURE: Monthly review. Update when tech changes, dependencies added, or patterns refactored.",
  state: "STATE: Update every session! Keep current_app accurate. Add urgencies as they arise, remove when resolved."
};

export const UPDATE_FREQUENCY: Record<Bootstrap["kind"], BootstrapHealth["update_frequency"]> = {
  ethos: "rare",
  structure: "monthly",
  state: "continuous"
};
