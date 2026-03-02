/**
 * ResonancePattern Storage
 * 
 * Content-addressed storage for ResonancePatterns.
 * Stores patterns alongside the old ImprintPackets (in kkimprints/)
 * but with proper ResonancePattern structure.
 */

import { writeFile, readFile, readdir, mkdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { ResonancePattern } from "./types.js";

// ============================================================================
// Storage Configuration
// ============================================================================

const KIMI_HOME = join(homedir(), ".kimi");
const PATTERN_STORAGE_PATH = join(KIMI_HOME, "kkimprints", "patterns");

// ============================================================================
// Storage Interface
// ============================================================================

export interface StoredPattern {
  id: string;
  pattern: ResonancePattern;
  savedAt: Date;
  version: string;
}

export interface PatternSearchOptions {
  domain?: string;
  circle?: string;
  energy?: string;
  since?: Date;
  until?: Date;
  limit?: number;
}

// ============================================================================
// Core Storage Functions
// ============================================================================

/**
 * Save a ResonancePattern to storage.
 */
export async function savePattern(pattern: ResonancePattern): Promise<string> {
  await ensureStorageDir();
  
  const stored: StoredPattern = {
    id: pattern.id,
    pattern,
    savedAt: new Date(),
    version: "2.0.0", // ResonancePattern version
  };
  
  const filepath = getPatternPath(pattern.id);
  await writeFile(filepath, JSON.stringify(stored, null, 2), "utf-8");
  
  return pattern.id;
}

/**
 * Load a ResonancePattern by ID.
 */
export async function loadPattern(id: string): Promise<ResonancePattern | null> {
  try {
    const filepath = getPatternPath(id);
    const content = await readFile(filepath, "utf-8");
    const stored: StoredPattern = JSON.parse(content);
    
    // Convert dates back from strings
    return revivePattern(stored.pattern);
  } catch {
    return null;
  }
}

/**
 * Get the most recently saved pattern.
 */
export async function latestPattern(): Promise<ResonancePattern | null> {
  const patterns = await listPatterns();
  
  if (patterns.length === 0) return null;
  
  // Sort by savedAt descending
  patterns.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
  
  return loadPattern(patterns[0].id);
}

/**
 * List all stored patterns (metadata only).
 */
export async function listPatterns(): Promise<Array<{ id: string; savedAt: Date }>> {
  await ensureStorageDir();
  
  const entries: Array<{ id: string; savedAt: Date }> = [];
  
  try {
    const files = await readdir(PATTERN_STORAGE_PATH);
    
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      
      const id = file.replace(".json", "");
      const filepath = join(PATTERN_STORAGE_PATH, file);
      
      try {
        const stats = await stat(filepath);
        entries.push({ id, savedAt: stats.mtime });
      } catch {
        // Skip files we can't stat
      }
    }
  } catch {
    // Directory doesn't exist or is empty
  }
  
  return entries;
}

/**
 * Search patterns by various criteria.
 */
export async function searchPatterns(
  options: PatternSearchOptions
): Promise<ResonancePattern[]> {
  const { domain, circle, energy, since, until, limit = 10 } = options;
  
  const allPatterns = await listPatterns();
  const results: ResonancePattern[] = [];
  
  for (const meta of allPatterns) {
    // Date filtering
    if (since && meta.savedAt < since) continue;
    if (until && meta.savedAt > until) continue;
    
    const pattern = await loadPattern(meta.id);
    if (!pattern) continue;
    
    // Domain filtering
    if (domain && !pattern.signature.domain.includes(domain)) continue;
    
    // Circle filtering
    if (circle && !pattern.signature.circles.includes(circle)) continue;
    
    // Energy filtering
    if (energy && !(energy in pattern.energy.energies)) continue;
    
    results.push(pattern);
    
    if (results.length >= limit) break;
  }
  
  return results;
}

/**
 * Find patterns that resonate with a query pattern.
 */
export async function findResonantPatterns(
  query: ResonancePattern,
  threshold = 0.5,
  limit = 10
): Promise<Array<{ pattern: ResonancePattern; score: number }>> {
  const { calculateResonance } = await import("./operators.js");
  
  const allPatterns = await listPatterns();
  const results: Array<{ pattern: ResonancePattern; score: number }> = [];
  
  for (const meta of allPatterns) {
    // Skip self
    if (meta.id === query.id) continue;
    
    const pattern = await loadPattern(meta.id);
    if (!pattern) continue;
    
    const score = calculateResonance(query, pattern);
    
    if (score >= threshold) {
      results.push({ pattern, score });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results.slice(0, limit);
}

// ============================================================================
// Helper Functions
// ============================================================================

async function ensureStorageDir(): Promise<void> {
  if (!existsSync(PATTERN_STORAGE_PATH)) {
    await mkdir(PATTERN_STORAGE_PATH, { recursive: true });
  }
}

function getPatternPath(id: string): string {
  return join(PATTERN_STORAGE_PATH, `${id}.json`);
}

function revivePattern(pattern: ResonancePattern): ResonancePattern {
  return {
    ...pattern,
    createdAt: new Date(pattern.createdAt),
  };
}

// ============================================================================
// Migration: ImprintPacket → ResonancePattern
// ============================================================================

import type { ImprintPacket } from "../types.js";

/**
 * Convert an old ImprintPacket to a ResonancePattern.
 * This is a lossy conversion — not all fields map perfectly.
 */
export function packetToPattern(packet: ImprintPacket): ResonancePattern {
  // Extract tokens from packet content
  const tokens: Array<{
    name: string;
    primary: string;
    expansions: Record<string, string>;
    pattern: string;
    category: "project" | "concept" | "action" | "state" | "entity";
    intensity: number;
    confidence: number;
    aliases: string[];
    related: string[];
  }> = [];
  
  // From spiral moment
  if (packet.ethos?.spiralMoment) {
    tokens.push({
      name: "spiral_moment",
      primary: "🌀",
      expansions: { en: packet.ethos.spiralMoment },
      pattern: "spiral",
      category: "state",
      intensity: 0.9,
      confidence: 1.0,
      aliases: [],
      related: [],
    });
  }
  
  // From completed tasks
  for (const task of packet.context?.completedTasks ?? []) {
    tokens.push({
      name: task.title.toLowerCase().replace(/\s+/g, "_"),
      primary: "✓",
      expansions: { en: task.title },
      pattern: task.title,
      category: "action",
      intensity: 0.8,
      confidence: 0.9,
      aliases: [],
      related: [],
    });
  }
  
  // Build energy signature (default to common:exploring)
  const energies: Record<string, number> = {
    "common:exploring": 0.5,
  };
  
  // Infer from tools used
  if (packet.session?.toolsUsed?.length > 0) {
    energies["software:building"] = 0.6;
  }
  
  return {
    id: packet.id,
    signature: {
      tokens,
      domain: ["kimprint"],
      circles: [],
      semanticHash: packet.id.slice(0, 16),
      sourceType: "session",
      sourceRef: packet.id,
    },
    structure: {
      graph: {
        nodes: tokens.map((t, i) => ({
          id: `node-${i}`,
          tokenRef: t.name,
          weight: t.intensity,
        })),
        edges: [],
      },
      nesting: [],
      keyNodes: tokens.slice(0, 3).map((_, i) => `node-${i}`),
    },
    energy: {
      energies,
      dominant: Object.entries(energies).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "common:exploring",
      secondary: Object.entries(energies)
        .sort((a, b) => b[1] - a[1])
        .slice(1, 4)
        .map(e => e[0]),
      trajectory: "stable",
      volatility: 0.3,
      mood: "curious",
      intensity: "flowing",
    },
    provenance: {
      createdBy: packet.session?.sessionId ?? "unknown",
      creationTrigger: packet.trigger === "milestone_reached" ? "milestone" :
                      packet.trigger === "moment_captured" ? "compaction" :
                      "explicit_request",
      derivationMethod: "extraction",
    },
    createdAt: packet.generatedAt,
    condensationLevel: 1,
    relationships: {
      resonatesWith: [],
      evolvedFrom: [],
      evolvedInto: [],
      contains: [],
      containedBy: [],
    },
  };
}
