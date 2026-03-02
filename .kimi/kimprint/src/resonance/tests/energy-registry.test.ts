/**
 * Energy Registry Tests
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  discoverEnergies,
  getEnergy,
  getEnergySignatures,
  generateTypeScriptConstants,
} from "../index.js";

describe("Energy Registry", () => {
  describe("discoverEnergies", () => {
    it("discovers energies from filesystem", async () => {
      const registry = await discoverEnergies();
      
      assert.ok(registry.energyCount > 0);
      assert.ok(registry.domains.length > 0);
      assert.ok(Object.keys(registry.fqedToPath).length > 0);
    });
    
    it("includes _common domain", async () => {
      const registry = await discoverEnergies();
      
      assert.ok(registry.domains.includes("_common"));
    });
    
    it("has energy entries with definitions", async () => {
      const registry = await discoverEnergies();
      
      const entry = registry.entries[0];
      assert.ok(entry.fqed);
      assert.ok(entry.domain);
      assert.ok(entry.definition);
      assert.ok(entry.semanticSignatures);
    });
  });
  
  describe("getEnergy", () => {
    it("finds energy by FQED", async () => {
      const energy = await getEnergy("software:building");
      
      assert.ok(energy);
      assert.strictEqual(energy?.fqed, "software:building");
      assert.ok(energy?.semanticSignatures.length > 0);
    });
    
    it("returns null for unknown FQED", async () => {
      const energy = await getEnergy("unknown:energy");
      
      assert.strictEqual(energy, null);
    });
  });
  
  describe("getEnergySignatures", () => {
    it("returns semantic signatures for energy", async () => {
      const signatures = await getEnergySignatures("common:exploring");
      
      assert.ok(signatures.length > 0);
    });
  });
  
  describe("generateTypeScriptConstants", () => {
    it("generates TypeScript code", async () => {
      const code = await generateTypeScriptConstants();
      
      assert.ok(code.includes("export interface"));
      assert.ok(code.includes("software:building"));
      assert.ok(code.includes("EnergySignatures"));
    });
  });
});
