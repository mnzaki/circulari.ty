/**
 * ResonancePattern Operators - Phase 1 Implementation
 * 
 * Essential operators: crystallize, weave, echo, condense, refocus
 */

import { randomUUID } from "crypto";
import type {
  ResonancePattern,
  SemanticToken,
  EnergySignature,
  WeaveOptions,
  EchoOptions,
  RefocusLens,
} from "./types.js";
// createFQED available from fqed module if needed

// ============================================================================
// 1. CRYSTALLIZE - Create pattern from raw material
// ============================================================================

export interface CrystallizeInput {
  content: string;
  tokens?: SemanticToken[];
  energies?: Record<string, number>;
  domain?: string[];
  circles?: string[];
  sourceType?: "session" | "error" | "conversation" | "documentation" | "code";
  sourceRef?: string;
  context?: {
    timestamp?: Date;
    workingDirectory?: string;
    gitCommit?: string;
  };
  createdBy?: string;
  trigger?: "explicit_request" | "milestone" | "compaction" | "error" | "periodic";
}

export function crystallize(input: CrystallizeInput): ResonancePattern {
  const now = new Date();
  
  // Extract or generate tokens from content
  const tokens = input.tokens ?? extractTokens(input.content);
  
  // Build semantic signature
  const signature = {
    tokens,
    domain: input.domain ?? ["general"],
    circles: input.circles ?? [],
    semanticHash: hashContent(input.content),
    sourceType: input.sourceType ?? "session",
    sourceRef: input.sourceRef ?? "unknown",
  };
  
  // Build energy signature
  const energy = buildEnergySignature(input.energies, tokens);
  
  // Build structure
  const structure = buildStructure(tokens);
  
  // Build provenance
  const provenance = {
    createdBy: input.createdBy ?? "unknown",
    creationTrigger: input.trigger ?? "explicit_request",
    sessionContext: input.context ? {
      timestamp: input.context.timestamp?.toISOString() ?? now.toISOString(),
      workingDirectory: input.context.workingDirectory ?? process.cwd(),
      gitCommit: input.context.gitCommit,
    } : undefined,
    derivationMethod: "extraction" as const,
  };
  
  // Generate content-addressed ID
  const id = generatePatternId(signature, provenance);
  
  return {
    id,
    signature,
    structure,
    energy,
    provenance,
    createdAt: now,
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

// ============================================================================
// 2. WEAVE - Combine two patterns (with conflict preservation!)
// ============================================================================

export function weave(
  a: ResonancePattern,
  b: ResonancePattern,
  options: WeaveOptions = {}
): ResonancePattern {
  const { mode = "blend" } = options;
  const now = new Date();
  
  // Merge tokens
  const tokenMap = new Map<string, SemanticToken>();
  
  for (const token of a.signature.tokens) {
    tokenMap.set(token.name, { ...token });
  }
  
  for (const token of b.signature.tokens) {
    if (tokenMap.has(token.name)) {
      // Conflict! Preserve both values (don't resolve)
      const existing = tokenMap.get(token.name)!;
      if (mode === "blend") {
        // Average the intensities
        existing.intensity = (existing.intensity + token.intensity) / 2;
      }
      // In "layer" mode, keep existing (don't override)
    } else {
      tokenMap.set(token.name, { ...token });
    }
  }
  
  // Merge energies (FQED format)
  const energies: Record<string, number> = { ...a.energy.energies };
  
  for (const [fqed, intensity] of Object.entries(b.energy.energies)) {
    if (energies[fqed] !== undefined) {
      // Conflict preserved! Store as array or use blending
      if (mode === "blend") {
        energies[fqed] = (energies[fqed] + intensity) / 2;
      }
      // In "layer" mode, keep existing
    } else {
      energies[fqed] = intensity;
    }
  }
  
  // Build merged pattern
  const merged: ResonancePattern = {
    id: randomUUID(), // New ID for merged pattern
    signature: {
      tokens: Array.from(tokenMap.values()),
      domain: [...new Set([...a.signature.domain, ...b.signature.domain])],
      circles: [...new Set([...a.signature.circles, ...b.signature.circles])],
      semanticHash: hashContent(JSON.stringify([a.signature, b.signature])),
      sourceType: a.signature.sourceType,
      sourceRef: `weave:${a.id}:${b.id}`,
    },
    structure: mergeStructure(a.structure, b.structure),
    energy: buildEnergySignature(energies),
    provenance: {
      createdBy: "weave-operator",
      creationTrigger: "explicit_request",
      derivedFrom: [a.id, b.id],
      derivationMethod: "composition",
    },
    createdAt: now,
    condensationLevel: Math.max(a.condensationLevel, b.condensationLevel) as 1 | 2 | 3 | 4,
    relationships: {
      resonatesWith: [],
      evolvedFrom: [a.id, b.id].map(id => ({ id, relationshipType: "parent" })),
      evolvedInto: [],
      contains: [],
      containedBy: [],
    },
  };
  
  return merged;
}

// ============================================================================
// 3. ECHO - Find patterns that resonate with query
// ============================================================================

export function echo(
  query: ResonancePattern,
  corpus: ResonancePattern[],
  options: EchoOptions = {}
): Array<{ pattern: ResonancePattern; score: number }> {
  const { threshold = 0.5, limit = 10 } = options;
  
  const results: Array<{ pattern: ResonancePattern; score: number }> = [];
  
  for (const candidate of corpus) {
    // Don't match with self
    if (candidate.id === query.id) continue;
    
    const score = calculateResonance(query, candidate);
    
    if (score >= threshold) {
      results.push({ pattern: candidate, score });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results.slice(0, limit);
}

export function calculateResonance(a: ResonancePattern, b: ResonancePattern): number {
  // Token overlap (normalize by stripping punctuation for comparison)
  const normalizeToken = (t: string) => t.toLowerCase().replace(/[^\w\-]+/g, "");
  const aTokens = new Set(a.signature.tokens.map(t => normalizeToken(t.name)));
  const bTokens = new Set(b.signature.tokens.map(t => normalizeToken(t.name)));
  
  // Remove empty tokens after normalization
  const cleanATokens = new Set([...aTokens].filter(t => t.length > 0));
  const cleanBTokens = new Set([...bTokens].filter(t => t.length > 0));
  
  const intersection = new Set([...cleanATokens].filter(x => cleanBTokens.has(x)));
  const union = new Set([...cleanATokens, ...cleanBTokens]);
  
  const tokenScore = union.size > 0 ? intersection.size / union.size : 0;
  
  // Energy overlap
  const aEnergies = Object.keys(a.energy.energies);
  const bEnergies = Object.keys(b.energy.energies);
  
  const energyIntersection = aEnergies.filter(e => bEnergies.includes(e));
  const energyUnion = [...new Set([...aEnergies, ...bEnergies])];
  
  const energyScore = energyUnion.length > 0 ? energyIntersection.length / energyUnion.length : 0;
  
  // Domain overlap
  const domainScore = a.signature.domain.some(d => b.signature.domain.includes(d)) ? 1 : 0;
  
  // Weighted combination
  return (tokenScore * 0.5) + (energyScore * 0.3) + (domainScore * 0.2);
}

// ============================================================================
// 4. CONDENSE - Automatically select optimal encoding
// ============================================================================

export function condense(pattern: ResonancePattern): ResonancePattern {
  // Clone the pattern
  const condensed: ResonancePattern = {
    ...pattern,
    id: randomUUID(),
    createdAt: new Date(),
    condensationLevel: (Math.min(4, pattern.condensationLevel + 1) as 1 | 2 | 3 | 4),
    provenance: {
      ...pattern.provenance,
      createdBy: "condense-operator",
      creationTrigger: "explicit_request",
      derivedFrom: [pattern.id],
      derivationMethod: "condensation",
    },
  };
  
  // Select optimal semantic signatures for tokens
  for (const token of condensed.signature.tokens) {
    // Find the shortest expansion (most condensed)
    const candidates = [
      { encoding: token.primary, length: Array.from(token.primary).length },
      ...(token.expansions.zh ? [{ encoding: token.expansions.zh, length: Array.from(token.expansions.zh).length }] : []),
      ...(token.expansions.emoji ? [{ encoding: token.expansions.emoji, length: Array.from(token.expansions.emoji).length }] : []),
    ];
    
    const optimal = candidates.reduce((best, current) => 
      current.length < best.length ? current : best
    );
    
    // Update primary to optimal (keeping expansions)
    token.primary = optimal.encoding;
  }
  
  // Keep only top energy
  const sortedEnergies = Object.entries(condensed.energy.energies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  condensed.energy.energies = Object.fromEntries(sortedEnergies);
  condensed.energy.dominant = sortedEnergies[0]?.[0] ?? condensed.energy.dominant;
  condensed.energy.secondary = sortedEnergies.slice(1).map(e => e[0]);
  
  return condensed;
}

// ============================================================================
// 5. REFOCUS - Extract subset matching criteria
// ============================================================================

export function refocus(
  pattern: ResonancePattern,
  lens: RefocusLens
): ResonancePattern {
  const { category, extract, minIntensity = 0 } = lens;
  
  const refocused: ResonancePattern = {
    ...pattern,
    id: randomUUID(),
    createdAt: new Date(),
    provenance: {
      ...pattern.provenance,
      createdBy: "refocus-operator",
      creationTrigger: "explicit_request",
      derivedFrom: [pattern.id],
      derivationMethod: "transformation",
    },
  };
  
  // Filter tokens by criteria
  if (category) {
    refocused.signature.tokens = refocused.signature.tokens.filter(
      t => t.category === category && t.intensity >= minIntensity
    );
  } else if (minIntensity > 0) {
    refocused.signature.tokens = refocused.signature.tokens.filter(
      t => t.intensity >= minIntensity
    );
  }
  
  // Extract specific aspects
  if (extract === "energies") {
    // Keep only energy-related info
    refocused.signature.tokens = [];
  } else if (extract === "tokens") {
    // Keep only tokens, clear structure
    refocused.structure = {
      graph: { nodes: [], edges: [] },
      nesting: [],
      keyNodes: [],
    };
  }
  
  return refocused;
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractTokens(content: string): SemanticToken[] {
  // Simple token extraction - in real impl, use semantic analysis
  const words = content.toLowerCase().split(/\s+/);
  
  // Normalize tokens: strip punctuation, filter short words
  const normalizedWords = words.map(w => w.replace(/[^\w\-]+/g, "")).filter(w => w.length > 3);
  const uniqueWords = [...new Set(normalizedWords)];
  
  return uniqueWords.map(word => ({
    name: word,
    primary: word,
    expansions: {},
    pattern: word,
    category: "concept" as const,
    intensity: 0.5,
    confidence: 0.7,
    aliases: [],
    related: [],
  }));
}

function hashContent(content: string): string {
  // Simple hash - in real impl, use proper hashing
  return Buffer.from(content).toString("base64").slice(0, 16);
}

function generatePatternId(signature: unknown, provenance: unknown): string {
  const combined = JSON.stringify({ signature, provenance });
  return hashContent(combined) + "-" + Date.now().toString(36);
}

function buildEnergySignature(
  energies?: Record<string, number>,
  tokens?: SemanticToken[]
): EnergySignature {
  const energyMap: Record<string, number> = energies ?? {};
  
  // Infer some energies from tokens if not provided
  if (!energies && tokens) {
    if (tokens.some(t => t.name.includes("build") || t.name.includes("implement"))) {
      energyMap["software:building"] = 0.7;
    }
    if (tokens.some(t => t.name.includes("explore") || t.name.includes("investigate"))) {
      energyMap["common:exploring"] = 0.6;
    }
  }
  
  const sorted = Object.entries(energyMap).sort((a, b) => b[1] - a[1]);
  
  return {
    energies: energyMap,
    dominant: sorted[0]?.[0] ?? "common:exploring",
    secondary: sorted.slice(1, 4).map(e => e[0]),
    trajectory: "stable",
    volatility: 0.3,
    mood: "curious",
    intensity: "flowing",
  };
}

function buildStructure(tokens: SemanticToken[]) {
  const nodes = tokens.map((t, i) => ({
    id: `node-${i}`,
    tokenRef: t.name,
    weight: t.intensity,
  }));
  
  // Simple fully-connected graph for now
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      edges.push({
        from: nodes[i].id,
        to: nodes[j].id,
        type: "relates_to" as const,
        strength: 0.5,
      });
    }
  }
  
  return {
    graph: { nodes, edges },
    nesting: [],
    keyNodes: nodes.slice(0, 3).map(n => n.id),
  };
}

function mergeStructure(a: ResonancePattern["structure"], b: ResonancePattern["structure"]) {
  return {
    graph: {
      nodes: [...a.graph.nodes, ...b.graph.nodes],
      edges: [...a.graph.edges, ...b.graph.edges],
    },
    nesting: [...a.nesting, ...b.nesting],
    keyNodes: [...a.keyNodes, ...b.keyNodes].slice(0, 6),
  };
}
