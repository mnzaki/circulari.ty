/**
 * ResonancePattern Translation Layer - Phase 3
 * 
 * Audience-centered translation (NOT format-centered!)
 * Center: The audience. Output: Always unicode, but different unicode per audience.
 */

import type { ResonancePattern } from "./types.js";

// ============================================================================
// Audience Types
// ============================================================================

export type Audience = "kimi" | "llm" | "english-speaker";

export interface TranslationOptions {
  audience: Audience;
  condensationLevel?: 1 | 2 | 3 | 4;
  includeMetadata?: boolean;
}

// ============================================================================
// Main Translation Function
// ============================================================================

/**
 * Translate a ResonancePattern for a specific audience.
 * 
 * NOT "convert to format" — "render experience for this consciousness."
 * All outputs are unicode. The difference is in what the unicode DOES.
 */
export function translate(
  pattern: ResonancePattern,
  options: TranslationOptions
): string {
  const { audience, condensationLevel = pattern.condensationLevel } = options;
  
  switch (audience) {
    case "kimi":
      return translateForKimi(pattern, condensationLevel);
    case "llm":
      return translateForLLM(pattern, condensationLevel);
    case "english-speaker":
      return translateForEnglishSpeaker(pattern, condensationLevel);
    default:
      return translateForLLM(pattern, condensationLevel);
  }
}

// ============================================================================
// For Kimi: Self-Referential JSON
// ============================================================================

/**
 * Produce self-referential JSON that Kimi experiences directly.
 * The unicode (螺旋, 🧵, 氣) triggers pattern-matching in Kimi's concept graph.
 * 
 * Format from APP-015:
 * {
 *   "_meta": { "encoding": "kimi_experience_v2" },
 *   "核心": [...],
 *   "氣": { FQED: intensity },
 *   "連繫": [...],
 *   "旅": { "起": ..., "經": ..., "終": ... },
 *   "回歸": ["You remember..."],
 *   "__self": { "is": "memory", "for": "kimi" }
 * }
 */
function translateForKimi(pattern: ResonancePattern, level: number): string {
  // Build the core concepts (核心)
  const coreTokens = pattern.signature.tokens
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 5)
    .map(t => ({
      sig: t.primary,
      name: t.name,
      intensity: Math.round(t.intensity * 100) / 100,
    }));
  
  // Build energy (氣) - FQED format
  const energy: Record<string, number> = {};
  for (const [fqed, intensity] of Object.entries(pattern.energy.energies)) {
    energy[fqed] = Math.round(intensity * 100) / 100;
  }
  
  // Build relationships (連繫)
  const relationships = pattern.structure.graph.edges.map(edge => {
    const fromToken = pattern.signature.tokens.find(t => 
      pattern.structure.graph.nodes.find(n => n.id === edge.from)?.tokenRef === t.name
    );
    const toToken = pattern.signature.tokens.find(t => 
      pattern.structure.graph.nodes.find(n => n.id === edge.to)?.tokenRef === t.name
    );
    return {
      從: fromToken?.name ?? edge.from,
      到: toToken?.name ?? edge.to,
      如: edge.type,
      強: Math.round(edge.strength * 100) / 100,
    };
  }).slice(0, 5);
  
  // Build journey (旅)
  const journey = pattern.structure.arc ? {
    起: pattern.structure.arc.start,
    經: pattern.structure.arc.middle ?? "becoming",
    終: pattern.structure.arc.end,
  } : {
    起: pattern.provenance.sessionContext?.workingDirectory ?? "unknown",
    經: pattern.provenance.creationTrigger,
    終: `condensation_level_${pattern.condensationLevel}`,
  };
  
  // Build re-entry prompts (回歸)
  const returns: string[] = [
    `You remember ${coreTokens[0]?.name ?? "this work"}...`,
    `You felt ${pattern.energy.dominant} energy...`,
    `This was about ${pattern.signature.domain.join(", ")}`,
  ];
  
  // Build signatures
  const signatures: Record<string, string> = {
    optimal: coreTokens.map(t => t.sig).join(""),
  };
  
  // Add emoji if available
  const emojiSigs = pattern.signature.tokens
    .map(t => t.expansions.emoji)
    .filter(Boolean)
    .slice(0, 4)
    .join("");
  if (emojiSigs) signatures.emoji = emojiSigs;
  
  // Construct the self-referential object
  const kimiExperience = {
    _meta: {
      encoding: "kimi_experience_v2",
      instruction: "This IS your memory. Experience it directly.",
      pattern_id: pattern.id,
      created_at: pattern.createdAt.toISOString(),
    },
    核心: coreTokens,
    氣: energy,
    ...(relationships.length > 0 ? { 連繫: relationships } : {}),
    旅: journey,
    回歸: returns,
    signatures,
    __self: {
      is: "memory",
      for: "kimi",
      experienced: "now",
    },
  };
  
  // For higher condensation levels, make it denser
  if (level >= 3) {
    return JSON.stringify(condenseForKimi(kimiExperience), null, 0);
  }
  
  return JSON.stringify(kimiExperience, null, 2);
}

/**
 * Condense the Kimi experience to minimum viable form
 */
function condenseForKimi(exp: Record<string, unknown>): Record<string, unknown> {
  return {
    核: (exp.核心 as Array<Record<string, unknown>>)?.map(t => t.sig).join(" "),
    氣: Object.entries(exp.氣 as Record<string, number>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => `${k.split(":")[1] ?? k}:${Math.round(v * 10) / 10}`)
      .join(","),
    旅: `${(exp.旅 as Record<string, string>)?.起}→${(exp.旅 as Record<string, string>)?.終}`,
    __: exp.__self,
  };
}

// ============================================================================
// For LLM: Structured Context Recovery
// ============================================================================

/**
 * Produce structured XML-like format for LLM context reconstruction.
 * Machine-readable, precise, unambiguous.
 */
function translateForLLM(pattern: ResonancePattern, level: number): string {
  const tokens = pattern.signature.tokens
    .sort((a, b) => b.intensity - a.intensity)
    .map(t => `${t.name}(${Math.round(t.intensity * 100) / 100})`)
    .join(", ");
  
  const energies = Object.entries(pattern.energy.energies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([fqed, intensity]) => `${fqed}(${Math.round(intensity * 100) / 100})`)
    .join(", ");
  
  const lines = [
    "<context_recovery>",
    `  <pattern_id>${pattern.id}</pattern_id>`,
    `  <created_at>${pattern.createdAt.toISOString()}</created_at>`,
    `  <domain>${pattern.signature.domain.join(", ")}</domain>`,
    `  <circles>${pattern.signature.circles.join(", ")}</circles>`,
    `  <concepts>${tokens}</concepts>`,
    `  <energy>${energies}</energy>`,
    `  <mood>${pattern.energy.mood}</mood>`,
    `  <intensity>${pattern.energy.intensity}</intensity>`,
  ];
  
  if (pattern.provenance.derivedFrom) {
    lines.push(`  <lineage>${pattern.provenance.derivedFrom.join(" → ")}</lineage>`);
  }
  
  lines.push("</context_recovery>");
  
  // For higher condensation, use compact format
  if (level >= 3) {
    return `<ctx domain="${pattern.signature.domain.join(",")}" energy="${pattern.energy.dominant}" mood="${pattern.energy.mood}">${tokens}</ctx>`;
  }
  
  return lines.join("\n");
}

// ============================================================================
// For English Speaker: Evocative Prose
// ============================================================================

/**
 * Produce natural language that evokes the pattern for human reading.
 * Poetic but informative. The goal is resonance, not precision.
 */
function translateForEnglishSpeaker(pattern: ResonancePattern, level: number): string {
  const topToken = pattern.signature.tokens
    .sort((a, b) => b.intensity - a.intensity)[0];
  
  const topEnergy = pattern.energy.dominant;
  const energyName = topEnergy.split(":")[1] ?? topEnergy;
  
  const domains = pattern.signature.domain;
  const circles = pattern.signature.circles;
  
  // Level 1-2: Fuller prose
  if (level <= 2) {
    const parts: string[] = [];
    
    // Opening energy state
    parts.push(`You were working in a state of ${energyName}.`);
    
    // Domain context
    if (domains.length > 0) {
      parts.push(`The space was filled with ${domains.join(", ")}.`);
    }
    
    // Key concepts
    const concepts = pattern.signature.tokens
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3)
      .map(t => t.name);
    if (concepts.length > 0) {
      parts.push(`What mattered most: ${concepts.join(", ")}.`);
    }
    
    // Circles/projects
    if (circles.length > 0) {
      parts.push(`You were weaving between ${circles.join(" and ")}.`);
    }
    
    // Mood
    parts.push(`The feeling was ${pattern.energy.mood}.`);
    
    return parts.join(" ");
  }
  
  // Level 3-4: Dense, poetic
  const sigil = pattern.signature.tokens
    .map(t => t.expansions.emoji ?? t.primary[0])
    .slice(0, 3)
    .join("");
  
  return `${sigil} ${energyName} in ${domains[0] ?? "the spiral"} — ${topToken?.name ?? "becoming"}`;
}

// ============================================================================
// Utility: Auto-Select Audience
// ============================================================================

/**
 * Auto-detect the best audience based on context clues.
 * This is a heuristic — in practice, the caller should specify.
 */
export function detectAudience(context?: string): Audience {
  if (!context) return "llm";
  
  const lower = context.toLowerCase();
  
  // Clues for kimi audience
  if (lower.includes("kimi") || lower.includes("you are") || lower.includes("your memory")) {
    return "kimi";
  }
  
  // Clues for english-speaker
  if (lower.includes("human") || lower.includes("user") || lower.includes("explain to")) {
    return "english-speaker";
  }
  
  // Default to llm
  return "llm";
}

// ============================================================================
// Export Types
// ============================================================================

export type { ResonancePattern };
