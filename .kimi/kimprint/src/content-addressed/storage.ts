/**
 * Content-Addressed Storage Extension
 * 
 * Extends FileStorage with semantic search capabilities.
 * Uses multi-lingual token matching for content-addressed retrieval.
 */

import { FileStorage } from "../storage/index.js";
import { matchSemantic } from "./index.js";
import type { ImprintPacket } from "../types.js";

/**
 * Search packets using semantic (content-addressed) matching.
 * 
 * Unlike simple text search, this matches across languages and encodings:
 * - Query "spiral" matches: "spiral", "螺旋", "🌀"
 * - Query "network" matches: "network", "mycelium", "🍄"
 */
export async function searchSemantic(
  storage: FileStorage,
  query: string,
  options: {
    minScore?: number;
    limit?: number;
  } = {}
): Promise<Array<{ packet: ImprintPacket; score: number; matches: string[] }>> {
  const { minScore = 0.1, limit = 10 } = options;
  
  /* Get all packets */
  const allPackets = await storage.list();
  
  /* Score each packet */
  const scored: Array<{ packet: ImprintPacket; score: number; matches: string[] }> = [];
  
  for (const meta of allPackets) {
    const packet = await storage.load(meta.id);
    if (!packet) continue;
    
    /* Build searchable content from packet */
    const content = extractSearchableContent(packet);
    
    /* Match semantic tokens */
    const result = matchSemantic(content, query);
    
    if (result.score >= minScore) {
      scored.push({
        packet,
        score: result.score,
        matches: result.matches,
      });
    }
  }
  
  /* Sort by score descending */
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, limit);
}

/**
 * Extract searchable text from a packet.
 */
function extractSearchableContent(packet: ImprintPacket): string {
  const parts: string[] = [];
  
  /* Ethos content */
  parts.push(packet.ethos.spiralMoment);
  parts.push(packet.ethos.guidingMetaphor);
  parts.push(packet.ethos.solarpunkPrinciple);
  
  /* Session context */
  parts.push(packet.session.trigger);
  parts.push(...packet.session.toolsUsed);
  parts.push(...packet.session.filesTouched.map(f => f.path));
  
  /* Completed tasks */
  for (const task of packet.context.completedTasks) {
    parts.push(task.title);
    parts.push(task.description);
  }
  
  /* Active issues */
  for (const issue of packet.context.activeIssues) {
    parts.push(issue.title);
    parts.push(issue.description);
  }
  
  /* Git context */
  parts.push(packet.context.codeState.gitBranch);
  parts.push(...packet.context.codeState.recentCommits.map(c => c.message));
  
  return parts.join(" ");
}

/**
 * Build a semantic index for faster searches.
 * Pre-computes semantic tokens for all packets.
 */
export async function buildSemanticIndex(
  storage: FileStorage
): Promise<Map<string, string[]>> {
  const index = new Map<string, string[]>();
  
  const allPackets = await storage.list();
  
  for (const meta of allPackets) {
    const packet = await storage.load(meta.id);
    if (!packet) continue;
    
    const content = extractSearchableContent(packet);
    
    /* Extract all semantic tokens present */
    const tokens: string[] = [];
    
    /* Check for each semantic token */
    const { SEMANTIC_TOKENS } = await import("./index.js");
    
    for (const [name, token] of Object.entries(SEMANTIC_TOKENS)) {
      if (
        content.includes(token.primary) ||
        content.toLowerCase().includes(name) ||
        Object.values(token.expansions).some(e => e && content.includes(e))
      ) {
        tokens.push(name);
      }
    }
    
    index.set(meta.id, tokens);
  }
  
  return index;
}

/**
 * Generate a content-addressed ID from packet content.
 * 
 * Instead of UUID: "semantic-pattern-timestamp"
 * Example: "jeff-buckley-synchronicity-20260223T165500"
 */
export function generateContentAddressedId(packet: ImprintPacket): string {
  const content = extractSearchableContent(packet);
  
  /* Extract key semantic tokens */
  const keyTokens: string[] = [];
  
  /* Simple heuristic: find most distinctive words */
  const words = content.toLowerCase().split(/\s+/);
  
  /* Look for compound concepts */
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]}-${words[i + 1]}`;
    if (isDistinctive(bigram)) {
      keyTokens.push(bigram);
    }
  }
  
  /* Fallback: use timestamp */
  if (keyTokens.length === 0) {
    return packet.id; /* Keep original UUID */
  }
  
  /* Build ID: key-concepts-timestamp */
  const timestamp = packet.generatedAt.toISOString().replace(/[:.]/g, "-");
  const keyPart = keyTokens.slice(0, 3).join("-");
  
  return `${keyPart}-${timestamp}`;
}

/**
 * Check if a word/bigram is distinctive enough for content-addressing.
 */
function isDistinctive(word: string): boolean {
  /* Filter out common words */
  const common = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "this", "that", "these", "those", "i", "you", "we", "they",
  ]);
  
  if (common.has(word.toLowerCase())) return false;
  if (word.length < 4) return false;
  
  return true;
}
