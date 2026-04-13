/**
 * Query Resonance Engine
 * 
 * Enhanced resonance matching for gyre_resonate tool.
 * Fixes the storage mismatch and improves matching quality.
 */

import { crystallize, calculateResonance, type CrystallizeInput } from "./operators.js";
import { listPatterns, loadPattern } from "./storage.js";
import type { ResonancePattern, SemanticToken } from "./types.js";

// ============================================================================
// Enhanced Token Extraction
// ============================================================================

interface ExtractedConcept {
  term: string;
  category: SemanticToken["category"];
  confidence: number;
  intensity: number;
}

/**
 * Extract concepts from query text with better technical term handling.
 * 
 * Improvements over basic token extraction:
 * - Preserves kebab-case technical terms (spire-loom, to-string)
 * - Preserves camelCase/PascalCase identifiers (LanguageType, gitCommit)
 * - Extracts phrases (multi-word concepts)
 * - Basic stemming for common variations
 */
export function extractQueryConcepts(query: string): ExtractedConcept[] {
  const concepts: ExtractedConcept[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Pattern 1: Kebab-case technical terms (spire-loom, barn-architecture)
  const kebabPattern = /\b([a-z]+-[a-z]+(?:-[a-z]+)*)\b/g;
  let match;
  while ((match = kebabPattern.exec(query)) !== null) {
    concepts.push({
      term: match[1],
      category: "entity",
      confidence: 0.9,
      intensity: 0.8,
    });
  }
  
  // Pattern 2: CamelCase/PascalCase identifiers (LanguageType, toString)
  const camelPattern = /\b([A-Z][a-z]+[A-Z][a-zA-Z]*)\b|\b([a-z]+[A-Z][a-zA-Z]*)\b/g;
  while ((match = camelPattern.exec(query)) !== null) {
    concepts.push({
      term: match[1] || match[2],
      category: "entity",
      confidence: 0.85,
      intensity: 0.75,
    });
  }
  
  // Pattern 3: SCREAMING_SNAKE_CASE constants
  const screamingPattern = /\b([A-Z][A-Z0-9_]*[A-Z])\b/g;
  while ((match = screamingPattern.exec(query)) !== null) {
    concepts.push({
      term: match[1],
      category: "state",
      confidence: 0.9,
      intensity: 0.7,
    });
  }
  
  // Pattern 4: Dot-notation paths (spire-loom.convergence)
  const dotPattern = /\b([a-z]+(?:-[a-z]+)*\.[a-z]+(?:-[a-z]+)*)\b/gi;
  while ((match = dotPattern.exec(query)) !== null) {
    concepts.push({
      term: match[1].toLowerCase(),
      category: "concept",
      confidence: 0.85,
      intensity: 0.8,
    });
    // Also extract the individual parts
    const parts = match[1].split(".");
    for (const part of parts) {
      if (part.length > 3) {
        concepts.push({
          term: part.toLowerCase(),
          category: "concept",
          confidence: 0.7,
          intensity: 0.6,
        });
      }
    }
  }
  
  // Pattern 5: Quoted phrases (exact matches)
  const quotePattern = /"([^"]+)"|'([^']+)'/g;
  while ((match = quotePattern.exec(query)) !== null) {
    const phrase = match[1] || match[2];
    concepts.push({
      term: phrase.toLowerCase(),
      category: "concept",
      confidence: 0.95,
      intensity: 0.9,
    });
  }
  
  // Pattern 6: Regular words (with stemming)
  // Match words but preserve kebab-case
  const wordPattern = /\b([a-z]+(?:-[a-z]+)*)\b/g;
  const seenTerms = new Set(concepts.map(c => c.term));
  while ((match = wordPattern.exec(lowerQuery)) !== null) {
    const word = match[1];
    // Skip if already captured or is a common stop word
    if (seenTerms.has(word) || isStopWord(word)) continue;
    
    // Apply basic stemming (only for non-kebab words)
    const stemmed = word.includes("-") ? word : basicStem(word);
    if (!seenTerms.has(stemmed) && stemmed.length > 3) {
      concepts.push({
        term: stemmed,
        category: "concept",
        confidence: 0.6,
        intensity: 0.5,
      });
    }
  }
  
  // Deduplicate by term, keeping highest confidence
  const deduped = new Map<string, ExtractedConcept>();
  for (const concept of concepts) {
    const existing = deduped.get(concept.term);
    if (!existing || existing.confidence < concept.confidence) {
      deduped.set(concept.term, concept);
    }
  }
  
  return Array.from(deduped.values());
}

/**
 * Basic stemming for common English variations.
 */
function basicStem(word: string): string {
  // Remove common suffixes
  const suffixes = ["ing", "ed", "er", "est", "ly", "tion", "sion", "ness", "ment", "s"];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

/**
 * Common stop words to filter out.
 * Exported for testing.
 */
export function isStopWord(word: string): boolean {
  const stops = new Set([
    "this", "that", "with", "from", "they", "have", "been", "were", "said", "each",
    "which", "their", "would", "there", "could", "should", "about", "after",
    "before", "being", "over", "than", "very", "when", "where", "what", "how",
    "all", "any", "both", "can", "had", "her", "his", "into", "its", "may",
    "more", "most", "now", "our", "out", "she", "some", "such", "the", "him",
    "use", "way", "who", "will", "you", "your", "but", "not", "and", "for",
    "are", "was", "are", "has", "had", "did", "does", "was", "were", "been",
    "have", "does", "did", "doing", "done", "get", "got", "getting", "gotten",
    "make", "made", "making", "take", "took", "taken", "taking", "come", "came",
    "coming", "know", "knew", "known", "knowing", "think", "thought", "thinking",
    "look", "looked", "looking", "want", "wanted", "wanting", "give", "gave",
    "given", "giving", "find", "found", "finding", "tell", "told", "telling",
    "work", "worked", "working", "call", "called", "calling", "try", "tried",
    "trying", "need", "needed", "needing", "feel", "felt", "feeling", "become",
    "became", "becoming", "leave", "left", "leaving", "put", "puts", "putting",
    "mean", "meant", "meaning", "keep", "kept", "keeping", "let", "lets", "letting",
    "begin", "began", "begun", "beginning", "seem", "seemed", "seeming", "help",
    "helped", "helping", "show", "showed", "shown", "showing", "hear", "heard",
    "hearing", "play", "played", "playing", "run", "ran", "running", "move",
    "moved", "moving", "live", "lived", "living", "believe", "believed", "believing",
    "bring", "brought", "bringing", "happen", "happened", "happening", "write",
    "wrote", "written", "writing", "provide", "provided", "providing", "sit",
    "sat", "sitting", "stand", "stood", "standing", "lose", "lost", "losing",
    "pay", "paid", "paying", "meet", "met", "meeting", "include", "included",
    "including", "continue", "continued", "continuing", "set", "sets", "setting",
    "learn", "learned", "learnt", "learning", "change", "changed", "changing",
    "lead", "led", "leading", "understand", "understood", "understanding", "watch",
    "watched", "watching", "follow", "followed", "following", "stop", "stopped",
    "stopping", "create", "created", "creating", "speak", "spoke", "spoken",
    "speaking", "read", "reading", "allow", "allowed", "allowing", "add", "added",
    "adding", "spend", "spent", "spending", "grow", "grew", "grown", "growing",
    "open", "opened", "opening", "walk", "walked", "walking", "win", "won",
    "winning", "offer", "offered", "offering", "remember", "remembered", "remembering",
    "love", "loved", "loving", "consider", "considered", "considering", "appear",
    "appeared", "appearing", "buy", "bought", "buying", "wait", "waited", "waiting",
    "serve", "served", "serving", "die", "died", "dying", "send", "sent", "sending",
    "expect", "expected", "expecting", "build", "built", "building", "stay",
    "stayed", "staying", "fall", "fell", "fallen", "falling", "cut", "cuts",
    "cutting", "reach", "reached", "reaching", "kill", "killed", "killing",
    "remain", "remained", "remaining"
  ]);
  return stops.has(word);
}

// ============================================================================
// Query Crystallization
// ============================================================================

/**
 * Crystallize a query string into a ResonancePattern for matching.
 * This is the key improvement — we turn the query into a proper pattern
 * so we can use the full resonance calculation.
 */
export function crystallizeQuery(
  query: string,
  options: {
    circles?: string[];
    domain?: string[];
  } = {}
): ResonancePattern {
  const concepts = extractQueryConcepts(query);
  
  // Convert concepts to semantic tokens
  const tokens = concepts.map((concept): SemanticToken => ({
    name: concept.term,
    primary: concept.term,
    expansions: {},
    pattern: concept.term,
    category: concept.category,
    intensity: concept.intensity,
    confidence: concept.confidence,
    aliases: [],
    related: [],
  }));
  
  // Infer domain from query content
  const domains = options.domain ?? inferDomain(query);
  
  // Infer circles from query content
  const circles = options.circles ?? inferCircles(query);
  
  // Use crystallize with our extracted tokens
  const input: CrystallizeInput = {
    content: query,
    tokens,
    domain: domains,
    circles,
    sourceType: "conversation",
    trigger: "explicit_request",
  };
  
  return crystallize(input);
}

/**
 * Infer domain from query content.
 */
function inferDomain(query: string): string[] {
  const lower = query.toLowerCase();
  const domains: string[] = ["general"];
  
  if (lower.includes("kimprint") || lower.includes("spiral") || lower.includes("gyre")) {
    domains.push("kimprint");
  }
  if (lower.includes("code") || lower.includes("function") || lower.includes("class")) {
    domains.push("software");
  }
  if (lower.includes("spire-loom") || lower.includes("o19")) {
    domains.push("o19");
  }
  if (lower.includes("baa") || lower.includes("architecture")) {
    domains.push("architecture");
  }
  
  return domains;
}

/**
 * Infer circles from query content.
 */
function inferCircles(query: string): string[] {
  const lower = query.toLowerCase();
  const circles: string[] = [];
  
  if (lower.includes("spire-loom")) circles.push("spire-loom");
  if (lower.includes("kimprint")) circles.push("kimprint");
  if (lower.includes("architecture")) circles.push("architecture");
  if (lower.includes("diviner")) circles.push("diviner-pattern");
  if (lower.includes("baa") || lower.includes("barn")) circles.push("baa");
  
  return circles;
}

// ============================================================================
// Enhanced Resonance Search
// ============================================================================

export interface ResonanceSearchOptions {
  query: string;
  circles?: string[];
  domain?: string[];
  limit?: number;
  threshold?: number;
  recencyBoost?: boolean;
  exactPhraseBonus?: number;
}

export interface ResonanceResult {
  pattern: ResonancePattern;
  score: number;
  matchedTokens: string[];
  recencyBonus: number;
}

/**
 * Search for resonant patterns using the new ResonancePattern storage.
 * 
 * This is the main function for gyre_resonate — it:
 * 1. Crystallizes the query into a pattern
 * 2. Searches ResonancePattern storage (not old ImprintPacket storage!)
 * 3. Calculates proper resonance scores
 * 4. Applies recency boosting
 * 5. Returns ranked results
 */
export async function searchResonance(
  options: ResonanceSearchOptions
): Promise<ResonanceResult[]> {
  const {
    query,
    circles,
    domain,
    limit = 10,
    threshold = 0.5,
    recencyBoost = true,
    exactPhraseBonus = 0.2,
  } = options;
  
  // Step 1: Crystallize the query
  const queryPattern = crystallizeQuery(query, { circles, domain });
  
  // Step 2: Get all patterns from storage
  const allMeta = await listPatterns();
  
  // Step 3: Calculate resonance for each pattern
  const results: ResonanceResult[] = [];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  for (const meta of allMeta) {
    const pattern = await loadPattern(meta.id);
    if (!pattern) continue;
    
    // Calculate base resonance
    let score = calculateResonance(queryPattern, pattern);
    
    // Apply exact phrase bonus
    const lowerQuery = query.toLowerCase();
    const patternText = JSON.stringify(pattern).toLowerCase();
    const queryWords = lowerQuery.split(/\s+/);
    const exactMatches = queryWords.filter(word => 
      word.length > 3 && patternText.includes(word)
    ).length;
    const exactMatchRatio = exactMatches / queryWords.length;
    score += exactMatchRatio * exactPhraseBonus;
    
    // Apply recency boost (patterns from last 24h get bonus)
    let recencyBonus = 0;
    if (recencyBoost) {
      const ageMs = now - pattern.createdAt.getTime();
      const ageDays = ageMs / oneDayMs;
      if (ageDays < 1) {
        recencyBonus = 0.15 * (1 - ageDays); // Up to +0.15 for fresh patterns
      } else if (ageDays < 7) {
        recencyBonus = 0.05 * (1 - ageDays / 7); // Up to +0.05 for week-old patterns
      }
      score += recencyBonus;
    }
    
    // Cap at 1.0
    score = Math.min(1.0, score);
    
    // Find matched tokens for debugging
    const queryTokens = new Set(queryPattern.signature.tokens.map(t => t.name));
    const matchedTokens = pattern.signature.tokens
      .filter(t => queryTokens.has(t.name))
      .map(t => t.name);
    
    if (score >= threshold) {
      results.push({
        pattern,
        score,
        matchedTokens,
        recencyBonus,
      });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results.slice(0, limit);
}

// ============================================================================
// Backwards Compatibility
// ============================================================================

/**
 * Legacy search for backwards compatibility with old ImprintPackets.
 * This can be removed once all old packets are migrated.
 */
export async function searchLegacyPackets(
  storage: { search: (query: string) => Promise<any[]> },
  query: string,
  limit = 10
): Promise<Array<{ packet: any; score: number }>> {
  const packets = await storage.search(query);
  const limited = packets.slice(0, limit);
  
  if (limited.length === 0) return [];
  
  // Calculate simple resonance score
  return limited
    .map((packet: any) => {
      const searchable = JSON.stringify(packet).toLowerCase();
      const lowerQuery = query.toLowerCase();
      const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 3);
      const matches = queryWords.filter((q: string) => searchable.includes(q)).length;
      const score = queryWords.length > 0 ? matches / queryWords.length : 0;
      return { packet, score };
    })
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
}
