/**
 * Bootstrap Handler - Mechanical Pre-Resonating Bootstrap
 * 
 * Orchestrates all 7 steps:
 * 1. Discover bootstraps (walk up tree)
 * 2. Merge contexts (specific wins)
 * 3. Execute queries (gyre_resonate)
 * 4. Analyze results (mechanical)
 * 5. Auto-trace top matches (gyre_trace)
 * 6. Cast reentry (gyre_cast)
 * 7. Synthesize output (template filling)
 */

import { walkUpAndCollect, mergeSpecificWins, getStackMetadata } from "./discovery.js";
import { mechanicalAnalysis, type GyreResult } from "./analysis.js";
import { templateSynthesize } from "./synthesis.js";
import { checkBootstrapHealth, gatherObservedState, type BootstrapHealthCheck } from "./health.js";
import { searchResonance } from "../resonance/query-resonance.js";
import { loadPattern } from "../resonance/index.js";
import { crystallize, savePattern, translate } from "../resonance/index.js";
import type { HandlerContext } from "../mcp/handlers.js";
import type { Bootstrap } from "./schemas/types.js";

// ============================================================================
// Main Handler
// ============================================================================

export interface BootstrapInput {
  cwd: string;
  auto_trace_threshold?: number;
}

export interface BootstrapOutput {
  context: {
    project: unknown;
    stream?: string;
    active_work?: unknown;
    urgencies?: string[];
    essential_reads?: string[];
    resonance_queries?: string[];
  };
  stack: {
    depth: number;
    layers: Array<{ level: number; path: string; bootstrap_name: string; specificity: number }>;
    specificity_gradient: string;
  };
  gyre: {
    queries_executed: string[];
    results: Record<string, GyreResult>;
    analysis: {
      vibe: {
        dominant_mood: string;
        avg_intensity: number;
        energy_state: string;
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
    };
  };
  traces: Record<string, Array<{ id: string; score: number; preview?: string; full_trace?: string }>>;
  conservation: {
    reentry_kimprint_id: string;
    timestamp: string;
  };
  synthesis: {
    summary: string;
    mood: string;
    confidence: string;
    next_steps: string[];
  };
  meta: {
    processing_time_ms: number;
    bootstraps_loaded: number;
    gyre_calls_made: number;
    traces_fetched: number;
    mechanical: true;
  };
  
  bootstrap_health: Record<string, {
    kind: string;
    confidence: number;
    staleness: string;
    days_since_update: number;
    maintenance_guidance: string;
    warnings: string[];
    todos: string[];
  }>;
}

export async function handleBootstrap(
  input: BootstrapInput,
  _ctx: HandlerContext
): Promise<BootstrapOutput> {
  const startTime = Date.now();
  
  // ========================================================================
  // STEP 1: Discover bootstraps
  // ========================================================================
  const layers = await walkUpAndCollect(input.cwd);
  
  // ========================================================================
  // STEP 2: Merge contexts
  // ========================================================================
  const merged = mergeSpecificWins(layers);
  
  // ========================================================================
  // STEP 3: Execute resonance queries
  // ========================================================================
  const queries = merged.resonance_queries || ["bootstrap re-entry", "spiral return"];
  const gyreResults: Record<string, GyreResult> = {};
  
  for (const query of queries) {
    const results = await searchResonance({
      query,
      limit: 5,
      threshold: 0.1,
    });
    
    gyreResults[query] = {
      query,
      match_count: results.length,
      matches: results.map(r => {
        // Extract concepts from token names
        const tokenConcepts: Record<string, number> = {};
        for (const token of r.pattern.signature.tokens) {
          tokenConcepts[token.name] = token.intensity;
        }
        return {
          id: r.pattern.id,
          score: r.score,
          preview: r.pattern.signature.tokens.map(t => t.name).join(", ").substring(0, 100),
          mood: r.pattern.energy.mood,
          intensity: r.pattern.energy.intensity === "surging" ? 0.9 : 
                     r.pattern.energy.intensity === "flowing" ? 0.6 : 
                     r.pattern.energy.intensity === "meandering" ? 0.3 : 0.1,
          circles: r.pattern.signature.circles,
          concepts: tokenConcepts,
          created_at: r.pattern.createdAt.toISOString(),
        };
      }),
    };
  }
  
  const gyreCallsMade = queries.length;
  
  // ========================================================================
  // STEP 4: Mechanical analysis
  // ========================================================================
  const analysis = await mechanicalAnalysis(gyreResults);
  
  // ========================================================================
  // STEP 5: Auto-trace top matches
  // ========================================================================
  const traces: BootstrapOutput["traces"] = {};
  const threshold = input.auto_trace_threshold ?? 0.5;
  let tracesFetched = 0;
  
  for (const [query, result] of Object.entries(gyreResults)) {
    traces[query] = [];
    
    for (const match of result.matches) {
      if (match.score >= threshold) {
        const pattern = await loadPattern(match.id);
        if (pattern) {
          const translated = translate(pattern, { audience: "llm", condensationLevel: 2 });
          traces[query].push({
            id: match.id,
            score: match.score,
            preview: match.preview,
            full_trace: translated,
          });
          tracesFetched++;
        }
      }
    }
  }
  
  // ========================================================================
  // STEP 6: Cast reentry kimprint
  // ========================================================================
  const reentryPattern = crystallize({
    content: `Re-entry from ${input.cwd}. Stack depth: ${layers.length}. Stream: ${merged.stream || "unknown"}.`,
    circles: ["re-entry", "bootstrap", merged.stream || "unknown", "spiral-return"],
    sourceType: "session",
    trigger: "explicit_request",
    context: {
      timestamp: new Date(),
      workingDirectory: input.cwd,
    },
  });
  
  await savePattern(reentryPattern);
  
  // ========================================================================
  // STEP 7: Synthesize output
  // ========================================================================
  const totalMatches = Object.values(gyreResults).reduce((sum, r) => sum + r.match_count, 0);
  const synthesis = templateSynthesize(merged, analysis, totalMatches);
  
  // ========================================================================
  // STEP 8: Health checking (NEW for APP-019)
  // ========================================================================
  const observedState = gatherObservedState(input.cwd);
  const healthChecks: Record<string, BootstrapHealthCheck> = {};
  
  for (const layer of layers) {
    const check = checkBootstrapHealth(
      layer.path,
      layer.bootstrap as unknown as Bootstrap,
      observedState
    );
    // Extract just the filename for the key
    const filename = `${layer.bootstrap.name?.replace(/\s+/g, "-").toLowerCase() || "bootstrap"}.json`;
    healthChecks[filename] = check;
  }
  
  // ========================================================================
  // Assemble output
  // ========================================================================
  const processingTime = Date.now() - startTime;
  
  return {
    context: {
      project: merged.project_context,
      stream: merged.stream,
      active_work: merged.active_work,
      urgencies: merged.active_work?.urgencies,
      essential_reads: merged.essential_reads,
      resonance_queries: merged.resonance_queries,
    },
    stack: getStackMetadata(layers),
    gyre: {
      queries_executed: queries,
      results: gyreResults,
      analysis: {
        vibe: {
          dominant_mood: analysis.vibe.dominant_mood,
          avg_intensity: analysis.vibe.avg_intensity,
          energy_state: analysis.vibe.energy_state,
        },
        temporal: {
          hours_since_last_reentry: analysis.temporal.hours_since_last_reentry,
        },
        patterns: {
          common_circles: analysis.patterns.common_circles,
          top_concepts: analysis.patterns.top_concepts,
          related_tokens: analysis.patterns.related_tokens,
        },
        recency: {
          has_recent_activity: analysis.recency.has_recent_activity,
          recent_count: analysis.recency.recent_count,
        },
      },
    },
    traces,
    conservation: {
      reentry_kimprint_id: reentryPattern.id,
      timestamp: new Date().toISOString(),
    },
    synthesis: {
      summary: synthesis.summary,
      mood: synthesis.mood,
      confidence: synthesis.confidence,
      next_steps: synthesis.next_steps,
    },
    meta: {
      processing_time_ms: processingTime,
      bootstraps_loaded: layers.length,
      gyre_calls_made: gyreCallsMade,
      traces_fetched: tracesFetched,
      mechanical: true,
    },
    
    bootstrap_health: Object.fromEntries(
      Object.entries(healthChecks).map(([key, check]) => [
        key,
        {
          kind: check.kind,
          confidence: check.calculated.confidence,
          staleness: check.calculated.staleness,
          days_since_update: check.calculated.days_since_update,
          maintenance_guidance: check.maintenance_guidance,
          warnings: check.warnings,
          todos: check.todos,
        },
      ])
    ),
  };
}
