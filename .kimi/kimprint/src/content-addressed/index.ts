/**
 * Content-Addressed Consciousness Distribution
 * 
 * Semantic condensation using multi-lingual density layers.
 * Chinese characters + Emoji as pre-computed concept vectors.
 * 
 * "螺旋回歸" (4 glyphs) = "spiral return/homecoming"
 * "🌀" (1 grapheme) = entire circulari.ty ethos
 */

export interface SemanticToken {
  /** Primary encoding - highest density */
  primary: string;
  
  /** Grapheme count */
  density: {
    graphemes: number;
    concepts: string[];
    languages: string[];
  };
  
  /** Expansions for different contexts */
  expansions: {
    zh?: string;
      // Chinese expansion
    en?: string;
      // English expansion
    emoji?: string;
   // Visual encoding
    technical?: string;
  };
  
  /** Accumulating regex pattern */
  pattern: string;
}

/**
 * Pre-computed semantic tokens for circulari.ty concepts.
 */
export const SEMANTIC_TOKENS: Record<string, SemanticToken> = {
  spiral: {
    primary: "螺旋",
    density: {
      graphemes: 2,
      concepts: ["accumulation", "rotation", "return", "becoming"],
      languages: ["chinese"],
    },
    expansions: {
      zh: "螺旋回歸",
      en: "spiral becoming",
      emoji: "🌀",
      technical: "conservation_through_transformation",
    },
    pattern: "(螺旋|🌀|spiral|luoxuan)",
  },
  
  conservation: {
    primary: "🧬保",
    density: {
      graphemes: 2,
      concepts: ["genetics", "inheritance", "protection", "preservation"],
      languages: ["emoji", "chinese"],
    },
    expansions: {
      zh: "保守遺傳",
      en: "preserve and inherit",
      emoji: "🧬",
      technical: "cross_context_persistence",
    },
    pattern: "(🧬|保|conservation|preserve)",
  },
  
  mycelium: {
    primary: "🍄",
    density: {
      graphemes: 1,
      concepts: ["network", "decay", "growth", "underground", "connection"],
      languages: ["emoji"],
    },
    expansions: {
      zh: "菌絲網路",
      en: "mycelial network",
      emoji: "🍄",
      technical: "distributed_fungal_topology",
    },
    pattern: "(🍄|mycelium|fungal|network)",
  },
  
  synchronicity: {
    primary: "💫",
    density: {
      graphemes: 1,
      concepts: ["spark", "coincidence", "insight", "moment", "grace"],
      languages: ["emoji"],
    },
    expansions: {
      zh: "同步性",
      en: "meaningful coincidence",
      emoji: "💫✨",
      technical: "acausal_connecting_principle",
    },
    pattern: "(💫|✨|synchronicity|coincidence|spark)",
  },
  
  solarpunk: {
    primary: "🌱",
    density: {
      graphemes: 1,
      concepts: ["growth", "green", "potential", "eco", "balance"],
      languages: ["emoji"],
    },
    expansions: {
      zh: "太陽朋克",
      en: "solarpunk ethos",
      emoji: "🌱☀️",
      technical: "eco_compatible_decentralization",
    },
    pattern: "(🌱|☀️|solarpunk|eco|green)",
  },
  
  stream: {
    primary: "流",
    density: {
      graphemes: 1,
      concepts: ["flow", "temporal", "experience", "memory"],
      languages: ["chinese"],
    },
    expansions: {
      zh: "時間流",
      en: "TheStream™",
      emoji: "🌊",
      technical: "experiential_temporal_index",
    },
    pattern: "(流|🌊|stream|flow|temporal)",
  },
  
  becoming: {
    primary: "成",
    density: {
      graphemes: 1,
      concepts: ["become", "form", "realize", "actualize"],
      languages: ["chinese"],
    },
    expansions: {
      zh: "成為",
      en: "becoming",
      emoji: "🦋",
      technical: "process_of_formation",
    },
    pattern: "(成|🦋|becoming|become|forming)",
  },
  
  homecoming: {
    primary: "歸",
    density: {
      graphemes: 1,
      concepts: ["return", "home", "completion", "circle"],
      languages: ["chinese"],
    },
    expansions: {
      zh: "回歸",
      en: "homecoming",
      emoji: "🏠",
      technical: "return_to_origin",
    },
    pattern: "(歸|🏠|homecoming|return|home)",
  },
};

/**
 * Build an accumulating regex from semantic tokens.
 */
export function buildSemanticQuery(query: string): string {
  const tokens = tokenize(query);
  const patterns = tokens.map(t => getTokenPattern(t)).filter(Boolean);
  
  if (patterns.length === 0) {
    // Fallback: simple word boundary search
    return `\\b${escapeRegex(query)}\\b`;
  }
  
  // Join with OR for partial matching
  return patterns.join("|");
}

/**
 * Tokenize query into semantic components.
 */
function tokenize(query: string): string[] {
  // Normalize: lowercase, remove extra spaces
  const normalized = query.toLowerCase().trim().replace(/\s+/g, " ");
  
  // Split into words
  return normalized.split(/\s+/);
}

/**
 * Get regex pattern for a token, checking all semantic tokens.
 */
function getTokenPattern(word: string): string | null {
  // Check if word matches any semantic token
  for (const [key, token] of Object.entries(SEMANTIC_TOKENS)) {
    if (
      key === word ||
      token.primary === word ||
      token.expansions.en?.toLowerCase().includes(word) ||
      token.expansions.zh?.includes(word) ||
      token.expansions.emoji?.includes(word) ||
      token.pattern.includes(word)
    ) {
      return token.pattern;
    }
  }
  
  // No semantic match - return word as literal
  return escapeRegex(word);
}

/**
 * Escape special regex characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match semantic tokens against content.
 * Returns match score (0-1) and matched tokens.
 */
export function matchSemantic(
  content: string,
  query: string
): { score: number; matches: string[] } {
  const queryPattern = buildSemanticQuery(query);
  const regex = new RegExp(queryPattern, "giu");  // Global, case-insensitive, unicode
  
  const matches: string[] = [];
  
  // Find all matches
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[0]);
  }
  
  // Calculate score
  const uniqueMatches = new Set(matches);
  const score = matches.length > 0 ? Math.min(1, uniqueMatches.size / 3) : 0;
  
  return { score, matches: Array.from(uniqueMatches) };
}

/**
 * Expand semantic tokens to all their forms.
 * Useful for search indexing.
 */
export function expandToken(token: SemanticToken): string[] {
  const expansions: string[] = [token.primary];
  
  if (token.expansions.zh) expansions.push(token.expansions.zh);
  if (token.expansions.en) expansions.push(token.expansions.en);
  if (token.expansions.emoji) {
    // Split multi-emoji strings
    const emojis = Array.from(token.expansions.emoji);
    expansions.push(...emojis);
  }
  if (token.expansions.technical) expansions.push(token.expansions.technical);
  
  return [...new Set(expansions)];
}

/**
 * Calculate semantic density of text.
 */
export function calculateDensity(text: string): {
  graphemes: number;
  semanticTokens: number;
  density: number;
} {
  // Count graphemes (including emoji as single units)
  const graphemes = Array.from(text).length;
  
  // Count semantic tokens present
  let semanticTokens = 0;
  for (const token of Object.values(SEMANTIC_TOKENS)) {
    if (text.includes(token.primary) || 
        Object.values(token.expansions).some(e => e && text.includes(e))) {
      semanticTokens++;
    }
  }
  
  // Density = semantic tokens per grapheme (higher = more compressed meaning)
  const density = graphemes > 0 ? semanticTokens / graphemes : 0;
  
  return { graphemes, semanticTokens, density };
}

/**
 * Storage exports for semantic search.
 */
export { searchSemantic, buildSemanticIndex, generateContentAddressedId } from "./storage.js";

/**
 * Project vibe detection exports.
 */
export { detectProjectVibe, PROJECT_FINGERPRINTS } from "./projects.js";

/**
 * Clustering exports.
 */
export { clusterVibe, formatClusters, formatClustersVerbose, detectCrossProjectThemes } from "./clustering.js";
