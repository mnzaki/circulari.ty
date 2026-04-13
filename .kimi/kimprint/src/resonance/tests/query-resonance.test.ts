/**
 * Tests for query-resonance.ts
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  extractQueryConcepts,
  crystallizeQuery,
  isStopWord,
} from "../query-resonance.js";

// ============================================================================
// Concept Extraction Tests
// ============================================================================

describe("extractQueryConcepts", () => {
  it("preserves kebab-case technical terms", () => {
    const query = "spire-loom convergence with barn-architecture";
    const concepts = extractQueryConcepts(query);
    
    const terms = concepts.map(c => c.term);
    assert(terms.includes("spire-loom"), "Should extract 'spire-loom'");
    assert(terms.includes("barn-architecture"), "Should extract 'barn-architecture'");
    assert(terms.includes("convergence"), "Should keep 'convergence' as-is (no stem match)");
  });

  it("extracts CamelCase identifiers", () => {
    const query = "LanguageType toString method";
    const concepts = extractQueryConcepts(query);
    
    const terms = concepts.map(c => c.term);
    assert(terms.includes("LanguageType"), "Should extract 'LanguageType'");
    assert(terms.includes("toString"), "Should extract 'toString'");
  });

  it("extracts SCREAMING_SNAKE_CASE constants", () => {
    const query = "MAX_SIZE and DEFAULT_VALUE";
    const concepts = extractQueryConcepts(query);
    
    const terms = concepts.map(c => c.term);
    assert(terms.includes("MAX_SIZE"), "Should extract 'MAX_SIZE'");
    assert(terms.includes("DEFAULT_VALUE"), "Should extract 'DEFAULT_VALUE'");
  });

  it("extracts dot-notation paths", () => {
    const query = "spire-loom.convergence pattern";
    const concepts = extractQueryConcepts(query);
    
    const terms = concepts.map(c => c.term);
    assert(terms.includes("spire-loom.convergence"), "Should extract full path");
  });

  it("extracts quoted phrases with high confidence", () => {
    const query = 'find "exact phrase match" in the system';
    const concepts = extractQueryConcepts(query);
    
    const phrase = concepts.find(c => c.term === "exact phrase match");
    assert(phrase, "Should extract quoted phrase");
    assert.strictEqual(phrase.confidence, 0.95, "Should have high confidence");
  });

  it("filters out stop words", () => {
    const query = "the quick brown fox jumps over the lazy dog";
    const concepts = extractQueryConcepts(query);
    
    const terms = concepts.map(c => c.term);
    assert(!terms.includes("the"), "Should filter 'the'");
    assert(!terms.includes("over"), "Should filter 'over'");
    assert(terms.includes("quick"), "Should keep 'quick'");
    assert(terms.includes("brown"), "Should keep 'brown'");
  });
});

// ============================================================================
// Crystallize Query Tests
// ============================================================================

describe("crystallizeQuery", () => {
  it("creates a pattern from query text", () => {
    const query = "spire-loom convergence toString conventions";
    const pattern = crystallizeQuery(query);
    
    assert(pattern.id, "Should have an ID");
    assert(pattern.signature, "Should have a signature");
    assert(pattern.signature.tokens.length > 0, "Should have tokens");
    assert(pattern.createdAt, "Should have createdAt");
  });

  it("infers domains from query content", () => {
    const query = "kimprint spiral gyre";
    const pattern = crystallizeQuery(query);
    
    assert(pattern.signature.domain.includes("kimprint"), "Should infer kimprint domain");
  });

  it("infers circles from query content", () => {
    const query = "spire-loom architecture diviner";
    const pattern = crystallizeQuery(query);
    
    assert(pattern.signature.circles.includes("spire-loom"), "Should infer spire-loom circle");
    assert(pattern.signature.circles.includes("architecture"), "Should infer architecture circle");
  });

  it("uses provided circles when specified", () => {
    const query = "general query";
    const pattern = crystallizeQuery(query, { circles: ["custom-circle"] });
    
    assert(pattern.signature.circles.includes("custom-circle"), "Should use provided circles");
  });
});

// ============================================================================
// Stop Word Tests
// ============================================================================

describe("isStopWord", () => {
  it("recognizes common stop words", () => {
    assert.strictEqual(isStopWord("the"), true);
    assert.strictEqual(isStopWord("and"), true);
    assert.strictEqual(isStopWord("with"), true);
    assert.strictEqual(isStopWord("from"), true);
  });

  it("does not flag technical terms as stop words", () => {
    assert.strictEqual(isStopWord("spire"), false);
    assert.strictEqual(isStopWord("loom"), false);
    assert.strictEqual(isStopWord("convergence"), false);
    assert.strictEqual(isStopWord("architecture"), false);
  });
});
