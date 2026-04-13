/**
 * Bootstrap Synthesis - Template Filling Only
 * 
 * STEP 7: Synthesize output using templates (NO LLM)
 * 
 * All operations are string concatenation and array joining.
 */

import type { Bootstrap } from "./discovery.js";
import type { MechanicalAnalysis } from "./analysis.js";

// ============================================================================
// Types
// ============================================================================

export interface SynthesisResult {
  summary: string;
  mood: string;
  confidence: "high" | "medium" | "low";
  next_steps: string[];
}

// ============================================================================
// STEP 7: Template Synthesis (Mechanical)
// ============================================================================

/**
 * Synthesize output using only template filling.
 * NO LLM generation - deterministic string construction.
 */
export function templateSynthesize(
  merged: Bootstrap,
  analysis: MechanicalAnalysis,
  totalMatches: number
): SynthesisResult {
  // Build summary parts
  const parts: string[] = [];
  
  // Part 1: Active work (from bootstrap)
  if (merged.active_work?.current_app) {
    parts.push(merged.active_work.current_app);
  } else if (merged.name) {
    parts.push(merged.name);
  }
  
  // Part 2: Vibe (from analysis)
  if (analysis.vibe.dominant_mood) {
    parts.push(`${analysis.vibe.dominant_mood} energy`);
  }
  
  // Part 3: Match count (calculated)
  if (totalMatches > 0) {
    parts.push(`${totalMatches} gyre matches`);
  }
  
  // Part 4: Top circles (from analysis)
  if (analysis.patterns.common_circles.length > 0) {
    const circles = analysis.patterns.common_circles.slice(0, 3).join(", ");
    parts.push(`Common: ${circles}`);
  }
  
  const summary = parts.join(" | ");
  
  // Build next steps
  const steps: string[] = [];
  
  // Step 1: Review active work
  if (merged.active_work?.current_app) {
    steps.push(`Review: ${merged.active_work.current_app}`);
  }
  
  // Step 2: Address urgencies
  for (const urgency of merged.active_work?.urgencies || []) {
    steps.push(`Address: ${urgency}`);
  }
  
  // Step 3: Check recent activity
  if (analysis.recency.has_recent_activity) {
    steps.push(`Check ${analysis.recency.recent_count} recent gyre entries`);
  }
  
  // Step 4: Time gap notice
  if (analysis.temporal.hours_since_last_reentry !== null) {
    const hours = Math.floor(analysis.temporal.hours_since_last_reentry);
    if (hours > 24) {
      steps.push(`Last re-entry was ${hours}h ago`);
    }
  }
  
  // Step 5: Read essential
  for (const essential of merged.essential_reads || []) {
    steps.push(`Read: ${essential}`);
  }
  
  // Determine confidence
  let confidence: SynthesisResult["confidence"];
  if (analysis.vibe.avg_intensity > 0.6) {
    confidence = "high";
  } else if (analysis.vibe.avg_intensity > 0.3) {
    confidence = "medium";
  } else {
    confidence = "low";
  }
  
  return {
    summary,
    mood: analysis.vibe.dominant_mood,
    confidence,
    next_steps: steps,
  };
}
