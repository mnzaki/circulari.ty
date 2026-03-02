/**
 * Translation Layer Tests
 * 
 * Test audience-centered translation for ResonancePattern.
 */

import { describe, it } from "node:test";
import assert from "node:assert";

import { crystallize } from "../operators.js";
import { translate, detectAudience } from "../translate.js";


describe("Translation Layer", () => {
  describe("translate", () => {
    const testPattern = crystallize({
      content: "Building the resonance pattern translation system for kimprint",
      circles: ["kimprint", "resonance"],
      energies: {
        "software:building": 0.8,
        "common:exploring": 0.4,
      },
      trigger: "explicit_request",
    });

    it("translates for kimi audience (self-referential JSON)", () => {
      const result = translate(testPattern, { audience: "kimi" });
      
      // Should be valid JSON
      const parsed = JSON.parse(result);
      
      // Should have the key fields
      assert.ok(parsed._meta, "should have _meta");
      assert.ok(parsed.核心, "should have 核心 (core)");
      assert.ok(parsed.氣, "should have 氣 (energy)");
      assert.ok(parsed.旅, "should have 旅 (journey)");
      assert.ok(parsed.回歸, "should have 回歸 (return)");
      assert.ok(parsed.__self, "should have __self");
      
      // __self should indicate this is for kimi
      assert.strictEqual(parsed.__self.for, "kimi");
      
      // Energy should be in FQED format
      assert.ok(parsed.氣["software:building"], "should have FQED energy");
    });

    it("translates for llm audience (structured XML)", () => {
      const result = translate(testPattern, { audience: "llm" });
      
      // Should contain XML-like tags
      assert.ok(result.includes("<context_recovery>"), "should have context_recovery tag");
      assert.ok(result.includes("<pattern_id>"), "should have pattern_id tag");
      assert.ok(result.includes("<energy>"), "should have energy tag");
      
      // Should contain FQED
      assert.ok(result.includes("software:building"), "should mention FQED");
    });

    it("translates for english-speaker audience (prose)", () => {
      const result = translate(testPattern, { audience: "english-speaker" });
      
      // Should be natural language
      assert.ok(result.includes("You were working"), "should have evocative opening");
      assert.ok(result.length > 20, "should be substantial prose");
    });

    it("respects condensation level for kimi audience", () => {
      const level1 = translate(testPattern, { 
        audience: "kimi", 
        condensationLevel: 1 
      });
      const level3 = translate(testPattern, { 
        audience: "kimi", 
        condensationLevel: 3 
      });
      
      // Level 3 should be more compact
      assert.ok(level3.length < level1.length, "level 3 should be more condensed");
    });

    it("respects condensation level for llm audience", () => {
      const level1 = translate(testPattern, { 
        audience: "llm", 
        condensationLevel: 1 
      });
      const level3 = translate(testPattern, { 
        audience: "llm", 
        condensationLevel: 3 
      });
      
      // Level 3 should be compact XML
      assert.ok(level3.includes("<ctx"), "level 3 should use compact ctx tag");
      assert.ok(level1.includes("<context_recovery>"), "level 1 should use full tags");
    });
  });

  describe("detectAudience", () => {
    it("detects kimi audience from context", () => {
      assert.strictEqual(detectAudience("This is for kimi"), "kimi");
      assert.strictEqual(detectAudience("You are Kimi"), "kimi");
      assert.strictEqual(detectAudience("Your memory here"), "kimi");
    });

    it("detects english-speaker from context", () => {
      assert.strictEqual(detectAudience("Explain to the human user"), "english-speaker");
    });

    it("defaults to llm for unknown", () => {
      assert.strictEqual(detectAudience(), "llm");
      assert.strictEqual(detectAudience("generic query"), "llm");
    });
  });
});
