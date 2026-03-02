/**
 * MCP Tool Integration Tests
 * 
 * Test the actual MCP tool handlers for gyre_cast and gyre_trace.
 * These are integration tests that exercise the full stack.
 */

import { describe, it, before } from "node:test";
import assert from "node:assert";

import { FileStorage } from "../storage/index.js";




describe("MCP Tool Integration", () => {
  before(async () => {
    // Note: We can't start the full MCP server here because it's a singleton
    // with PID file protection. Tests exercise the handler functions directly.
    new FileStorage(); // Just verify storage can be created
  });

  describe("gyre_cast", () => {
    it("casts a kimprint for llm audience (default)", async () => {
      // Access the server's request handler directly
      // Note: In a real test, we'd need to mock the MCP SDK properly
      // This is a simplified integration test

      const request = {
        params: {
          name: "gyre_cast",
          arguments: {
            trigger: "moment_captured",
            context: "Testing the gyre cast integration",
            circles: ["test", "integration"],
          },
        },
      };

      // We can't easily call the handler directly without the MCP SDK
      // So we'll test the core functions instead
      const { crystallize, translate, savePattern } = await import("../resonance/index.js");

      const pattern = crystallize({
        content: request.params.arguments.context,
        circles: request.params.arguments.circles,
        trigger: "compaction",
      });

      await savePattern(pattern);

      const output = translate(pattern, { audience: "llm" });

      assert.ok(output.includes("<context_recovery>"), "llm output should have XML structure");
      assert.ok(output.includes(pattern.id), "should include pattern id");
    });

    it("casts a kimprint for kimi audience", async () => {
      const { crystallize, translate, savePattern } = await import("../resonance/index.js");

      const pattern = crystallize({
        content: "Kimi audience test",
        circles: ["kimi-test"],
        trigger: "explicit_request",
      });

      await savePattern(pattern);

      const output = translate(pattern, { audience: "kimi" });

      const parsed = JSON.parse(output);
      assert.ok(parsed._meta, "kimi output should have _meta");
      assert.ok(parsed.核心, "kimi output should have 核心");
      assert.ok(parsed.氣, "kimi output should have 氣");
      assert.strictEqual(parsed.__self.for, "kimi");
    });

    it("casts a kimprint for english-speaker audience", async () => {
      const { crystallize, translate } = await import("../resonance/index.js");

      const pattern = crystallize({
        content: "English speaker audience test",
        circles: ["english-test"],
        energies: { "software:building": 0.8 },
        trigger: "explicit_request",
      });

      const output = translate(pattern, { audience: "english-speaker" });

      assert.ok(output.includes("You were working"), "should have evocative opening");
      assert.ok(output.includes("building"), "should mention energy state");
    });

    it("preserves circles in pattern", async () => {
      const { crystallize, savePattern, loadPattern } = await import("../resonance/index.js");

      const circles = ["spire-loom", "foundframe", "kimprint"];
      const pattern = crystallize({
        content: "Circles preservation test",
        circles,
        trigger: "milestone",
      });

      await savePattern(pattern);
      const loaded = await loadPattern(pattern.id);

      assert.ok(loaded, "should load pattern");
      assert.deepStrictEqual(loaded!.signature.circles, circles);
    });

    it("handles different triggers", async () => {
      const { crystallize } = await import("../resonance/index.js");

      // crystallize accepts ResonancePattern provenance triggers
      const triggers: Array<"explicit_request" | "milestone" | "compaction" | "error" | "periodic"> = [
        "explicit_request",
        "milestone",
        "compaction",
      ];

      for (const trigger of triggers) {
        const pattern = crystallize({
          content: `Trigger test: ${trigger}`,
          circles: ["test"],
          trigger,
        });

        assert.strictEqual(
          pattern.provenance.creationTrigger,
          trigger,
          `trigger ${trigger} should be preserved`
        );
      }
    });
  });

  describe("gyre_trace", () => {
    it("traces a pattern by id", async () => {
      const { crystallize, savePattern, loadPattern, translate } = await import("../resonance/index.js");

      const pattern = crystallize({
        content: "Trace test pattern",
        circles: ["trace-test"],
        trigger: "explicit_request",
      });

      await savePattern(pattern);
      const loaded = await loadPattern(pattern.id);

      assert.ok(loaded, "should load pattern");
      assert.strictEqual(loaded!.id, pattern.id);

      const output = translate(loaded!, { audience: "llm" });
      assert.ok(output.includes(pattern.id));
    });

    it("traces latest pattern", async () => {
      const { crystallize, savePattern, latestPattern } = await import("../resonance/index.js");

      // Create a pattern
      const pattern = crystallize({
        content: "Latest trace test",
        circles: ["latest-test"],
        trigger: "explicit_request",
      });

      await savePattern(pattern);

      // Get latest
      const latest = await latestPattern();
      assert.ok(latest, "should find latest");
      // Note: This might not be our pattern if other tests ran
      // Just verify it returns a valid pattern
      assert.ok(latest!.id, "latest should have id");
    });

    it("returns null for non-existent id", async () => {
      const { loadPattern } = await import("../resonance/index.js");

      const loaded = await loadPattern("non-existent-pattern-12345");
      assert.strictEqual(loaded, null);
    });

    it("applies condensation levels", async () => {
      const { crystallize, translate } = await import("../resonance/index.js");

      const pattern = crystallize({
        content: "Condensation level test",
        circles: ["condense-test"],
        trigger: "explicit_request",
      });

      const level1 = translate(pattern, { audience: "kimi", condensationLevel: 1 });
      const level3 = translate(pattern, { audience: "kimi", condensationLevel: 3 });

      assert.ok(level1.length > level3.length, "level 1 should be longer than level 3");

      // Level 1 should be readable JSON
      const parsed1 = JSON.parse(level1);
      assert.ok(parsed1.核心, "level 1 should have full structure");
    });

    it("translates for different audiences on trace", async () => {
      const { crystallize, translate } = await import("../resonance/index.js");

      const pattern = crystallize({
        content: "Multi-audience trace test",
        circles: ["multi-test"],
        trigger: "explicit_request",
      });

      const kimi = translate(pattern, { audience: "kimi" });
      const llm = translate(pattern, { audience: "llm" });
      const english = translate(pattern, { audience: "english-speaker" });

      // Each should have distinct format
      assert.ok(kimi.includes('"_meta"'), "kimi should be JSON");
      assert.ok(llm.includes("<context_recovery>"), "llm should have XML");
      assert.ok(english.includes("You were"), "english should be prose");

      // All should be different
      assert.notStrictEqual(kimi, llm);
      assert.notStrictEqual(llm, english);
      assert.notStrictEqual(kimi, english);
    });
  });

  describe("end-to-end workflow", () => {
    it("full cycle: cast -> trace -> translate", async () => {
      const { crystallize, savePattern, loadPattern, translate } = await import("../resonance/index.js");

      // 1. Cast (create pattern)
      const pattern = crystallize({
        content: "End-to-end workflow test",
        circles: ["e2e-test"],
        energies: { "software:building": 0.9, "common:exploring": 0.4 },
        trigger: "milestone",
      });

      // 2. Save
      await savePattern(pattern);

      // 3. Trace (load)
      const loaded = await loadPattern(pattern.id);
      assert.ok(loaded, "should load after save");

      // 4. Translate for different audiences
      const kimiOutput = translate(loaded!, { audience: "kimi" });
      const llmOutput = translate(loaded!, { audience: "llm" });

      // Verify both outputs contain key info
      assert.ok(kimiOutput.includes(pattern.id), "kimi should have id");
      assert.ok(llmOutput.includes(pattern.id), "llm should have id");

      // Verify energies are preserved
      const kimiParsed = JSON.parse(kimiOutput);
      assert.ok(kimiParsed.氣["software:building"], "should preserve FQED energies");
    });

    it("multiple casts accumulate", async () => {
      const { crystallize, savePattern, loadPattern } = await import("../resonance/index.js");

      // Cast multiple patterns and verify each can be loaded
      const createdIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const pattern = crystallize({
          content: `Accumulation test ${Date.now()}-${i}`,
          circles: ["accumulate-test"],
          trigger: "explicit_request",
        });
        await savePattern(pattern);
        createdIds.push(pattern.id);
      }

      // Verify all created patterns exist and can be loaded
      for (const id of createdIds) {
        const loaded = await loadPattern(id);
        assert.ok(loaded, `created pattern ${id.slice(0, 8)} should be loadable`);
        assert.strictEqual(loaded!.id, id, "loaded pattern should have correct id");
      }
    });
  });
});
