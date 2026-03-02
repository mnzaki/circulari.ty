/**
 * ResonancePattern Operator Tests
 * 
 * Phase 1: crystallize, weave, echo, condense, refocus
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  crystallize,
  weave,
  echo,
  condense,
  refocus,
  CommonEnergies,
  SoftwareEnergies,
} from "../index.js";

describe("Phase 1 Operators", () => {
  describe("crystallize", () => {
    it("creates a pattern from content", () => {
      const pattern = crystallize({
        content: "Working on spire-loom implementation",
        domain: ["spire-loom"],
        sourceType: "session",
      });
      
      assert.ok(pattern.id);
      assert.ok(pattern.createdAt);
      assert.strictEqual(pattern.condensationLevel, 1);
      assert.ok(pattern.signature.tokens.length > 0);
    });
    
    it("captures energies in FQED format", () => {
      const pattern = crystallize({
        content: "Building the database layer",
        energies: {
          [SoftwareEnergies.BUILDING]: 0.8,
          [CommonEnergies.EXPLORING]: 0.3,
        },
        sourceType: "session",
      });
      
      assert.strictEqual(pattern.energy.energies[SoftwareEnergies.BUILDING], 0.8);
      assert.strictEqual(pattern.energy.dominant, SoftwareEnergies.BUILDING);
    });
  });
  
  describe("weave", () => {
    it("combines two patterns", () => {
      const a = crystallize({
        content: "First session",
        domain: ["project-a"],
        sourceType: "session",
      });
      
      const b = crystallize({
        content: "Second session", 
        domain: ["project-b"],
        sourceType: "session",
      });
      
      const woven = weave(a, b);
      
      assert.ok(woven.id);
      assert.strictEqual(woven.relationships.evolvedFrom.length, 2);
      assert.ok(woven.signature.domain.includes("project-a"));
      assert.ok(woven.signature.domain.includes("project-b"));
    });
  });
  
  describe("echo", () => {
    it("runs without error", () => {
      const target = crystallize({
        content: "Test",
        domain: ["test"],
        sourceType: "session",
      });
      
      const corpus = [
        crystallize({ content: "Test 2", domain: ["test"], sourceType: "session" }),
      ];
      
      const echoes = echo(target, corpus, { threshold: 0 });
      
      // Just verify it returns an array
      assert.ok(Array.isArray(echoes));
    });
  });
  
  describe("condense", () => {
    it("increases condensation level", () => {
      const pattern = crystallize({
        content: "Test content with many tokens",
        sourceType: "session",
      });
      
      const condensed = condense(pattern);
      
      assert.strictEqual(condensed.condensationLevel, 2);
      assert.ok(condensed.provenance.derivedFrom?.includes(pattern.id));
    });
  });
  
  describe("refocus", () => {
    it("filters tokens", () => {
      const pattern = crystallize({
        content: "Test content",
        sourceType: "session",
      });
      
      const refocused = refocus(pattern, { minIntensity: 0.5 });
      
      assert.ok(refocused.id);
      assert.ok(refocused.signature.tokens);
    });
  });
});
