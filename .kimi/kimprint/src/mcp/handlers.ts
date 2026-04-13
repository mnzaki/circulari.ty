/**
 * MCP Tool Handlers
 * 
 * Business logic for all MCP tools.
 * Separated from transport layer for hot-reload support.
 * 
 * This module can be reloaded via SIGHUP without restarting
 * the server transport.
 */

import { randomUUID } from "crypto";
import type { ImprintStorage, ImprintPacket } from "../types.js";
import {
  crystallize,
  translate,
  savePattern,
  loadPattern,
  latestPattern,
  type Audience,
  type ResonancePattern,
} from "../resonance/index.js";
import {
  searchResonance,
  searchLegacyPackets,
  type ResonanceResult,
} from "../resonance/query-resonance.js";
import { handleBootstrap } from "../bootstrap/handler.js";

// ============================================================================
// Handler Context
// ============================================================================

export interface HandlerContext {
  storage: ImprintStorage;
  startTime: Date;
  version: string;
}

// ============================================================================
// Tool Definitions
// ============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
}

export function getToolDefinitions(): ToolDefinition[] {
  return [
    /* OLD TOOLS - DEPRECATED */
    {
      name: "conservation_generate",
      description: "[DEPRECATED: use gyre_cast] Generate a conservation packet",
      inputSchema: {
        type: "object",
        properties: {
          trigger: {
            type: "string",
            enum: ["explicit_request", "milestone_reached", "moment_captured"],
          },
          context: { type: "string" },
        },
        required: ["trigger"],
      },
    },
    {
      name: "conservation_read",
      description: "[DEPRECATED: use gyre_trace] Read a conservation packet by ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },
    {
      name: "conservation_search",
      description: "[DEPRECATED: use gyre_resonate] Search historical packets",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "number", default: 10 },
        },
        required: ["query"],
      },
    },
    /* NEW SPIRAL TOOLS */
    {
      name: "gyre_cast",
      description: "Cast a new spiral turn — generate a conservation packet (kimprint)",
      inputSchema: {
        type: "object",
        properties: {
          trigger: {
            type: "string",
            enum: ["explicit_request", "milestone_reached", "moment_captured"],
            description: "Why this kimprint is being cast",
          },
          context: {
            type: "string",
            description: "Optional context to weave into the kimprint",
          },
          circles: {
            type: "array",
            items: { type: "string" },
            default: ["kimprint"],
          },
          audience: {
            type: "string",
            enum: ["kimi", "llm", "english-speaker"],
            default: "llm",
          },
        },
        required: ["trigger"],
      },
    },
    {
      name: "gyre_trace",
      description: "Trace the spiral back — read a conservation packet by ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string" },
          audience: {
            type: "string",
            enum: ["kimi", "llm", "english-speaker"],
            default: "llm",
          },
          condensation_level: {
            type: "number",
            enum: [1, 2, 3, 4],
            default: 1,
          },
        },
        required: ["id"],
      },
    },
    {
      name: "gyre_resonate",
      description: "Find harmonic patterns — search by semantic resonance",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          circles: { type: "array", items: { type: "string" } },
          limit: { type: "number", default: 10 },
          resonance_threshold: { type: "number", default: 0.5 },
        },
        required: ["query"],
      },
    },
    {
      name: "spiral_return",
      description: "Return to the spiral — re-entry onboarding after compaction",
      inputSchema: {
        type: "object",
        properties: {
          session_id: { type: "string" },
          circles: { type: "array", items: { type: "string" }, default: ["kimprint"] },
          condensation_level: { type: "number", enum: [1, 2, 3], default: 2 },
          include_spiral_ethos: { type: "boolean", default: true },
        },
      },
    },
    {
      name: "gyre_resonance_bootstrap",
      description: "Execute hierarchical mechanical bootstrap — discovers, merges, resonates, analyzes, and synthesizes re-entry context",
      inputSchema: {
        type: "object",
        properties: {
          cwd: { 
            type: "string",
            description: "Current working directory to start discovery from"
          },
          auto_trace_threshold: { 
            type: "number", 
            default: 0.5,
            description: "Minimum resonance score to auto-trace full content"
          },
        },
        required: ["cwd"],
      },
    },
  ];
}

// ============================================================================
// Tool Handlers
// ============================================================================

export interface ToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export async function handleTool(
  name: string,
  args: Record<string, unknown>,
  ctx: HandlerContext
): Promise<ToolResult> {
  switch (name) {
    case "conservation_generate":
      return handleConservationGenerate(args, ctx);
    case "conservation_read":
      return handleConservationRead(args, ctx);
    case "conservation_search":
      return handleConservationSearch(args, ctx);
    case "gyre_cast":
      return handleGyreCast(args, ctx);
    case "gyre_trace":
      return handleGyreTrace(args, ctx);
    case "gyre_resonate":
      return handleGyreResonate(args, ctx);
    case "spiral_return":
      return handleSpiralReturn(args, ctx);
    case "gyre_resonance_bootstrap":
      return handleGyreResonanceBootstrap(args, ctx);
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}

// ---------------------------------------------------------------------------
// Deprecated Handlers
// ---------------------------------------------------------------------------

async function handleConservationGenerate(
  args: Record<string, unknown>,
  ctx: HandlerContext
): Promise<ToolResult> {
  const packet: ImprintPacket = {
    id: randomUUID(),
    generatedAt: new Date(),
    trigger: args.trigger as ImprintPacket["trigger"],
    session: {
      sessionId: randomUUID(),
      startedAt: new Date(),
      trigger: "user_request",
      messageCount: 0,
      toolsUsed: args.context ? [args.context as string] : [],
      filesTouched: [],
    },
    context: {
      timestamp: new Date(),
      completedTasks: [],
      activeIssues: [],
      codeState: {
        gitBranch: "unknown",
        gitCommit: "unknown",
        gitDirty: false,
        uncommittedFiles: [],
        recentCommits: [],
      },
      workingDirectory: process.cwd(),
      projectRoot: process.cwd(),
    },
    ethos: {
      spiralMoment: "Initial implementation",
      solarpunkPrinciple: "balance_over_optimization",
      guidingMetaphor: "The spiral conserves what matters",
    },
    schemaVersion: "1.0.0",
  };

  const id = await ctx.storage.save(packet);

  return {
    content: [
      {
        type: "text",
        text: `Generated conservation packet: ${id}\nTrigger: ${packet.trigger}`,
      },
    ],
  };
}

async function handleConservationRead(
  args: Record<string, unknown>,
  ctx: HandlerContext
): Promise<ToolResult> {
  let packet: ImprintPacket | null;

  if (args.id === "latest") {
    packet = await ctx.storage.latest();
  } else {
    packet = await ctx.storage.load(args.id as string);
  }

  if (!packet) {
    return {
      content: [{ type: "text", text: `No packet found: ${args.id}` }],
      isError: true,
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(packet, null, 2) }],
  };
}

async function handleConservationSearch(
  args: Record<string, unknown>,
  ctx: HandlerContext
): Promise<ToolResult> {
  const packets = await ctx.storage.search(args.query as string);
  const limit = (args.limit as number) || 10;
  const limited = packets.slice(0, limit);

  if (limited.length === 0) {
    return {
      content: [{ type: "text", text: `No packets found: ${args.query}` }],
    };
  }

  const summary = limited
    .map((p: ImprintPacket) => `- ${p.id} (${p.generatedAt.toISOString()}): ${p.trigger}`)
    .join("\n");

  return {
    content: [{ type: "text", text: `Found ${limited.length} packet(s):\n${summary}` }],
  };
}

// ---------------------------------------------------------------------------
// Spiral Tool Handlers (ResonancePattern-based)
// ---------------------------------------------------------------------------

async function handleGyreCast(
  args: Record<string, unknown>,
  _ctx: HandlerContext
): Promise<ToolResult> {
  const audience = (args.audience as Audience) || "llm";
  const circles = (args.circles as string[]) || ["kimprint"];
  const context = (args.context as string) || "Gyre cast — conserving what matters";

  /* Map tool trigger to ResonancePattern provenance trigger */
  const triggerMap: Record<string, ResonancePattern["provenance"]["creationTrigger"]> = {
    explicit_request: "explicit_request",
    milestone_reached: "milestone",
    moment_captured: "compaction",
  };
  const trigger = triggerMap[args.trigger as string] || "explicit_request";

  /* Create a ResonancePattern from the context */
  const pattern = crystallize({
    content: context,
    circles,
    sourceType: "session",
    trigger,
    context: {
      timestamp: new Date(),
      workingDirectory: process.cwd(),
    },
  });

  /* Save the pattern */
  await savePattern(pattern);

  /* Translate for the requested audience */
  const translated = translate(pattern, {
    audience,
    condensationLevel: pattern.condensationLevel,
  });

  return {
    content: [
      {
        type: "text",
        text:
          `🌀 Kimprint cast: ${pattern.id}\n` +
          `Trigger: ${pattern.provenance.creationTrigger}\n` +
          `Audience: ${audience}\n` +
          `Timestamp: ${pattern.createdAt.toISOString()}\n\n` +
          `${translated}`,
      },
    ],
  };
}

async function handleGyreTrace(
  args: Record<string, unknown>,
  _ctx: HandlerContext
): Promise<ToolResult> {
  const audience = (args.audience as Audience) || "llm";
  const condensationLevel = (args.condensation_level as 1 | 2 | 3 | 4) || 1;

  let pattern: ResonancePattern | null;

  if (args.id === "latest") {
    pattern = await latestPattern();
  } else {
    pattern = await loadPattern(args.id as string);
  }

  if (!pattern) {
    return {
      content: [
        { type: "text", text: `🔍 No kimprint found at this point in the spiral: ${args.id}` },
      ],
      isError: true,
    };
  }

  /* Translate for the requested audience */
  const translated = translate(pattern, {
    audience,
    condensationLevel,
  });

  return {
    content: [
      {
        type: "text",
        text:
          `🔮 Traced: ${pattern.id}\n` +
          `Created: ${pattern.createdAt.toISOString()}\n` +
          `Condensation Level: ${condensationLevel}\n` +
          `Audience: ${audience}\n\n` +
          `${translated}`,
      },
    ],
  };
}

async function handleGyreResonate(
  args: Record<string, unknown>,
  ctx: HandlerContext
): Promise<ToolResult> {
  const query = args.query as string;
  const limit = (args.limit as number) || 10;
  const threshold = (args.resonance_threshold as number) || 0.5;
  const circles = args.circles as string[] | undefined;

  // Step 1: Search new ResonancePattern storage (primary)
  const results = await searchResonance({
    query,
    circles,
    limit,
    threshold,
    recencyBoost: true,
  });

  // Step 2: Fall back to legacy ImprintPacket storage if no results
  let legacyResults: Array<{ packet: any; score: number }> = [];
  if (results.length === 0) {
    legacyResults = await searchLegacyPackets(ctx.storage, query, limit);
  }

  // Step 3: Format and return results
  if (results.length === 0 && legacyResults.length === 0) {
    return {
      content: [{ type: "text", text: `🔇 No resonance found for: ${query}` }],
    };
  }

  // Format new-style results
  const newSummary = results
    .map((r: ResonanceResult, i: number) => {
      const date = r.pattern.createdAt.toISOString().split("T")[0];
      const circles = r.pattern.signature.circles.length > 0
        ? ` [${r.pattern.signature.circles.join(", ")}]`
        : "";
      const tokens = r.matchedTokens.length > 0
        ? ` {${r.matchedTokens.slice(0, 3).join(", ")}}`
        : "";
      return `${i + 1}. [${Math.round(r.score * 100)}%] ${r.pattern.id.substring(0, 8)}... (${date})${circles}${tokens}`;
    })
    .join("\n");

  // Format legacy results (if any)
  const legacySummary = legacyResults.length > 0
    ? "\n\n[Legacy patterns]:\n" +
      legacyResults
        .map((r, i) => {
          const date = r.packet.generatedAt
            ? new Date(r.packet.generatedAt).toISOString().split("T")[0]
            : "unknown";
          return `${results.length + i + 1}. [${Math.round(r.score * 100)}%] ${r.packet.id?.substring(0, 8) ?? "unknown"}... (${date})`;
        })
        .join("\n")
    : "";

  const totalCount = results.length + legacyResults.length;
  const sourceNote = results.length > 0 && legacyResults.length > 0
    ? ` (new: ${results.length}, legacy: ${legacyResults.length})`
    : results.length > 0
      ? ""
      : " (legacy mode)";

  return {
    content: [
      {
        type: "text",
        text: `🌀 Resonance found — ${totalCount} harmonic pattern(s)${sourceNote}:\n\n${newSummary}${legacySummary}`,
      },
    ],
  };
}

async function handleSpiralReturn(
  _args: Record<string, unknown>,
  _ctx: HandlerContext
): Promise<ToolResult> {
  /* TODO: Implement spiral_return with proper re-entry flow */
  return {
    content: [
      {
        type: "text",
        text: "🌀 Spiral return — re-entry system coming in next iteration",
      },
    ],
  };
}

async function handleGyreResonanceBootstrap(
  args: Record<string, unknown>,
  ctx: HandlerContext
): Promise<ToolResult> {
  const cwd = args.cwd as string || process.cwd();
  const threshold = args.auto_trace_threshold as number || 0.5;
  
  try {
    const result = await handleBootstrap({ cwd, auto_trace_threshold: threshold }, ctx);
    
    return {
      content: [
        {
          type: "text",
          text: `🧭 Bootstrap resonance complete — ${result.stack.depth} layer(s) discovered\n\n` +
            `📊 Summary: ${result.synthesis.summary}\n` +
            `🎭 Mood: ${result.synthesis.mood} (${result.synthesis.confidence} confidence)\n` +
            `🔍 Gyre matches: ${Object.values(result.gyre.results).reduce((s, r) => s + r.match_count, 0)}\n` +
            `📜 Traces fetched: ${result.meta.traces_fetched}\n` +
            `⏱️ Processing time: ${result.meta.processing_time_ms}ms\n\n` +
            `📋 Next steps:\n${result.synthesis.next_steps.map(s => `  • ${s}`).join("\n")}\n\n` +
            `💾 Re-entry kimprint: ${result.conservation.reentry_kimprint_id}`,
        },
        {
          type: "text",
          text: `\n--- Full JSON Output ---\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Bootstrap resonance failed: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
}
