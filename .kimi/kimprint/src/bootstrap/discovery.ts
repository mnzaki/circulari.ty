/**
 * Bootstrap Discovery - Mechanical Operations Only
 * 
 * STEP 1: Walk up tree, collect all bootstraps
 * STEP 2: Merge with specific-wins strategy
 * 
 * All operations are deterministic - no LLM required.
 */

import { dirname, join } from "path";
import { readFileSync, readdirSync, existsSync } from "fs";

// ============================================================================
// Types
// ============================================================================

export interface BootstrapLayer {
  level: number;
  path: string;
  bootstrap: Bootstrap;
  specificity: number;
}

export interface Bootstrap {
  version: string;
  name: string;
  stream?: string;
  project_context?: {
    root?: string;
    type?: string;
    streams?: string[];
    ethos?: string;
  };
  active_work?: {
    current_app?: string;
    in_flight?: string[];
    urgencies?: string[];
  };
  local_knowledge?: {
    inbox_location?: string;
    active_status?: string;
    relevant_apps?: string[];
    relevant_theories?: string[];
  };
  resonance_queries?: string[];
  essential_reads?: string[];
  stream_detection?: Record<string, string>;
  [key: string]: unknown;
}

// ============================================================================
// STEP 1: Walk Up Tree (Mechanical)
// ============================================================================

/**
 * Walk up from cwd to /home, collecting all bootstrap files found.
 * Returns array ordered L0 (most specific) to Ln (most general).
 */
export async function walkUpAndCollect(cwd: string): Promise<BootstrapLayer[]> {
  const results: BootstrapLayer[] = [];
  let current = cwd;
  let level = 0;
  
  // Stop at /home or /
  while (current !== "/home" && current !== "/" && current.length > 0) {
    const bootstrapDir = join(current, ".kimprint", "bootstrap");
    
    if (existsSync(bootstrapDir)) {
      try {
        const files = readdirSync(bootstrapDir)
          .filter(f => f.endsWith(".json"));
        
        if (files.length > 0) {
          // Load first bootstrap found at this level
          const bootstrapPath = join(bootstrapDir, files[0]);
          const content = readFileSync(bootstrapPath, "utf-8");
          const bootstrap: Bootstrap = JSON.parse(content);
          
          results.push({
            level,
            path: current,
            bootstrap,
            specificity: 1.0 - (level * 0.1),
          });
        }
      } catch (err) {
        // Skip malformed bootstrap files
        console.error(`Failed to load bootstrap at ${bootstrapDir}:`, err);
      }
    }
    
    const parent = dirname(current);
    if (parent === current) break; // Safety: reached root
    current = parent;
    level++;
  }
  
  return results; // Ordered L0, L1, L2...
}

// ============================================================================
// STEP 2: Merge with Specific Wins (Mechanical)
// ============================================================================

/**
 * ReduceRight merge: L0 wins on all conflicts.
 * Arrays concatenate (L0 first).
 * Objects deep merge (L0 wins on conflict).
 * Scalars: L0 replaces.
 */
export function mergeSpecificWins(layers: BootstrapLayer[]): Bootstrap {
  // Start with empty object
  let merged: Record<string, unknown> = {};
  
  // Fold from right (Ln to L0) so L0 wins
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i].bootstrap as Record<string, unknown>;
    merged = deepMerge(merged, layer);
  }
  
  return merged as Bootstrap;
}

/**
 * Deep merge two objects.
 * - Arrays: concatenate (second first)
 * - Objects: recursive merge
 * - Scalars: second wins
 */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      // Arrays: concatenate (source first)
      const targetArr = Array.isArray(target[key]) ? target[key] as unknown[] : [];
      result[key] = [...value, ...targetArr];
    } else if (isPlainObject(value) && isPlainObject(target[key])) {
      // Objects: recursive merge
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      // Scalars: source wins
      result[key] = value;
    }
  }
  
  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ============================================================================
// Stack Metadata (Mechanical)
// ============================================================================

export function getStackMetadata(layers: BootstrapLayer[]) {
  return {
    depth: layers.length,
    layers: layers.map(l => ({
      level: l.level,
      path: l.path,
      bootstrap_name: l.bootstrap.name,
      specificity: l.specificity,
    })),
    specificity_gradient: layers.map(l => `L${l.level}=${l.specificity.toFixed(1)}`).join(", "),
  };
}
