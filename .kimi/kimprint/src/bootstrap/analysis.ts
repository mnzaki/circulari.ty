/**
 * Bootstrap Analysis - Mechanical Operations Only
 * 
 * STEP 4: Analyze gyre results deterministically
 * 
 * All operations use statistics, not LLM.
 */

import { searchResonance } from "../resonance/query-resonance.js";

// ============================================================================
// Types
// ============================================================================

export interface GyreResult {
  query: string;
  match_count: number;
  matches: Array<{
    id: string;
    score: number;
    preview?: string;
    mood?: string;
    intensity?: number;
    circles?: string[];
    concepts?: Record<string, number>;
    created_at?: string;
  }>;
}

export interface MechanicalAnalysis {
  vibe: {
    dominant_mood: string;
    avg_intensity: number;
    energy_state: "focused" | "flowing" | "gentle";
  };
  temporal: {
    hours_since_last_reentry: number | null;
  };
  patterns: {
    common_circles: string[];
    top_concepts: Array<{ concept: string; count: number }>;
    related_tokens: string[];
  };
  recency: {
    has_recent_activity: boolean;
    recent_count: number;
  };
}

// ============================================================================
// STEP 4: Mechanical Analysis
// ============================================================================

/**
 * Analyze all gyre results using only mechanical operations.
 */
export async function mechanicalAnalysis(results: Record<string, GyreResult>): Promise<MechanicalAnalysis> {
  // Collect all matches from all queries
  const allMatches = Object.values(results).flatMap(r => r.matches);
  
  return {
    vibe: analyzeVibe(allMatches),
    temporal: await analyzeTemporal(),
    patterns: analyzePatterns(allMatches),
    recency: analyzeRecency(allMatches),
  };
}

// ---------------------------------------------------------------------------
// 4.1 Vibe Synthesis (Mode + Mean)
// ---------------------------------------------------------------------------

function analyzeVibe(matches: GyreResult["matches"]): MechanicalAnalysis["vibe"] {
  const moods = matches.map(m => m.mood).filter((m): m is string => !!m);
  const intensities = matches.map(m => m.intensity).filter((i): i is number => i !== undefined);
  
  const dominant_mood = mode(moods) || "neutral";
  const avg_intensity = mean(intensities) || 0.5;
  
  // Classify energy state deterministically
  let energy_state: MechanicalAnalysis["vibe"]["energy_state"];
  if (avg_intensity > 0.7) {
    energy_state = "focused";
  } else if (avg_intensity > 0.4) {
    energy_state = "flowing";
  } else {
    energy_state = "gentle";
  }
  
  return {
    dominant_mood,
    avg_intensity,
    energy_state,
  };
}

// ---------------------------------------------------------------------------
// 4.2 Temporal Gap (Timestamp math)
// ---------------------------------------------------------------------------

async function analyzeTemporal(): Promise<MechanicalAnalysis["temporal"]> {
  // Query for recent re-entry
  const reentries = await searchResonance({
    query: "re-entry",
    limit: 1,
    threshold: 0.1,
  });
  
  if (reentries.length === 0) {
    return { hours_since_last_reentry: null };
  }
  
  const lastReentry = reentries[0];
  const lastTime = lastReentry.pattern.createdAt;
  const hoursSince = (Date.now() - lastTime.getTime()) / (1000 * 60 * 60);
  
  return { hours_since_last_reentry: hoursSince };
}

// ---------------------------------------------------------------------------
// 4.3 Circle Overlap (Set intersection)
// ---------------------------------------------------------------------------

function analyzePatterns(matches: GyreResult["matches"]): MechanicalAnalysis["patterns"] {
  // Common circles across all matches
  const allCircles = matches.map(m => m.circles || []);
  const common_circles = allCircles.length > 0 
    ? intersection(...allCircles) 
    : [];
  
  // Top concepts by frequency
  const allConcepts = matches.flatMap(m => Object.keys(m.concepts || {}));
  const conceptCounts = countBy(allConcepts);
  const top_concepts = Object.entries(conceptCounts)
    .map(([concept, count]) => ({ concept, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Related tokens (from top match's pattern)
  const related_tokens: string[] = [];
  if (matches.length > 0 && matches[0].preview) {
    // Extract tokens from preview (simple word extraction)
    const words = matches[0].preview.toLowerCase().match(/\b[a-z]+\b/g) || [];
    related_tokens.push(...words.slice(0, 10));
  }
  
  return {
    common_circles,
    top_concepts,
    related_tokens: [...new Set(related_tokens)], // Deduplicate
  };
}

// ---------------------------------------------------------------------------
// 4.4 Recency Check (Timestamp comparison)
// ---------------------------------------------------------------------------

function analyzeRecency(matches: GyreResult["matches"]): MechanicalAnalysis["recency"] {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  const recentTimestamps = matches
    .map(m => m.created_at)
    .filter((t): t is string => !!t)
    .map(t => new Date(t).getTime())
    .filter(t => (now - t) < oneDay);
  
  return {
    has_recent_activity: recentTimestamps.length > 0,
    recent_count: recentTimestamps.length,
  };
}

// ============================================================================
// Statistical Utilities (Mechanical)
// ============================================================================

/**
 * Mode: most frequent value
 */
function mode(arr: string[]): string | null {
  if (arr.length === 0) return null;
  
  const counts = countBy(arr);
  const entries = Object.entries(counts);
  entries.sort((a, b) => b[1] - a[1]);
  
  return entries[0]?.[0] || null;
}

/**
 * Mean: arithmetic average
 */
function mean(arr: number[]): number | null {
  if (arr.length === 0) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Count by: frequency map
 */
function countBy(arr: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return counts;
}

/**
 * Intersection: common elements across all arrays
 */
function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  
  const first = arrays[0];
  const rest = arrays.slice(1);
  
  return first.filter(item => 
    rest.every(arr => arr.includes(item))
  );
}
