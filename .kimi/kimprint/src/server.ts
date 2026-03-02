/**
 * kimprint MCP Server
 * 
 * Properly architected server with:
 * - PID file management (prevents multiple instances)
 * - Signal handling (graceful shutdown)
 * - Hot-reload support (SIGHUP reloads handlers)
 * - Decoupled transport and business logic
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

import { FileStorage } from "./storage/index.js";
import type { ImprintStorage } from "./types.js";

// ============================================================================
// Server Configuration
// ============================================================================

const SERVER_VERSION = "0.2.0";
const PID_FILE_PATH = join(homedir(), ".kimi", "kimprint", "server.pid");
const SERVER_NAME = "kimprint";

// ============================================================================
// PID File Management
// ============================================================================

interface PidFile {
  pid: number;
  startedAt: string;
  version: string;
}

function readPidFile(): PidFile | null {
  try {
    if (!existsSync(PID_FILE_PATH)) return null;
    const content = readFileSync(PID_FILE_PATH, "utf-8");
    return JSON.parse(content) as PidFile;
  } catch {
    return null;
  }
}

function writePidFile(): void {
  // Ensure directory exists
  const dir = PID_FILE_PATH.substring(0, PID_FILE_PATH.lastIndexOf('/'));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  const data: PidFile = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    version: SERVER_VERSION,
  };
  writeFileSync(PID_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function removePidFile(): void {
  try {
    if (existsSync(PID_FILE_PATH)) {
      unlinkSync(PID_FILE_PATH);
    }
  } catch {
    // Ignore errors on cleanup
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    // Signal 0 is a special check - doesn't actually send a signal
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function checkExistingServer(): boolean {
  const existing = readPidFile();
  if (!existing) return false;

  if (isProcessRunning(existing.pid)) {
    console.error(`❌ Server already running (PID ${existing.pid})`);
    console.error(`   Started: ${existing.startedAt}`);
    console.error(`   Version: ${existing.version}`);
    console.error(`   PID file: ${PID_FILE_PATH}`);
    console.error(`\n   To restart: kill ${existing.pid} && npm run server`);
    return true;
  }

  // Stale PID file - process is dead
  console.log(`🧹 Cleaning up stale PID file (PID ${existing.pid} not running)`);
  removePidFile();
  return false;
}

// ============================================================================
// Handler Module Management (for hot-reload)
// ============================================================================

interface HandlerModule {
  getToolDefinitions: () => Array<{ name: string; description: string; inputSchema: object }>;
  handleTool: (
    name: string,
    args: Record<string, unknown>,
    ctx: { storage: ImprintStorage; startTime: Date; version: string }
  ) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>;
}

let currentHandlers: HandlerModule;
let handlerLoadTime: Date;

async function loadHandlers(): Promise<HandlerModule> {
  // Force re-import by busting the require cache (for hot-reload)
  const modulePath = "./mcp/handlers.js";
  const fullPath = new URL(modulePath, import.meta.url).href;
  
  // In ESM, we need to add a query parameter to force re-evaluation
  const cacheBuster = `?reload=${Date.now()}`;
  const { getToolDefinitions, handleTool } = await import(fullPath + cacheBuster);
  
  currentHandlers = { getToolDefinitions, handleTool };
  handlerLoadTime = new Date();
  
  console.log(`📦 Handlers loaded at ${handlerLoadTime.toISOString()}`);
  return currentHandlers;
}

function getHandlers(): HandlerModule {
  if (!currentHandlers) {
    throw new Error("Handlers not loaded - server not properly initialized");
  }
  return currentHandlers;
}

// ============================================================================
// Server Lifecycle
// ============================================================================

let server: Server | null = null;
let transport: StdioServerTransport | null = null;
let storage: ImprintStorage | null = null;
const startTime = new Date();

async function createAndStartServer(): Promise<void> {
  // Check for existing server
  if (checkExistingServer()) {
    process.exit(1);
  }

  // Write PID file
  writePidFile();
  console.log(`🌀 kimprint MCP Server v${SERVER_VERSION}`);
  console.log(`   PID: ${process.pid}`);
  console.log(`   PID file: ${PID_FILE_PATH}`);

  // Initialize storage
  storage = new FileStorage();

  // Load handlers
  await loadHandlers();

  // Create MCP server
  server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Set up request handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const handlers = getHandlers();
    return {
      tools: handlers.getToolDefinitions(),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    const handlers = getHandlers();

    try {
      const result = await handlers.handleTool(name, args, {
        storage: storage!,
        startTime,
        version: SERVER_VERSION,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  // Create and connect transport
  transport = new StdioServerTransport();
  await server.connect(transport);

  console.log(`✅ Server ready (stdio transport)`);
}

// ============================================================================
// Signal Handling
// ============================================================================

function setupSignalHandlers(): void {
  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    // Clean up PID file
    removePidFile();
    
    // Close transport if connected
    if (transport) {
      try {
        transport.close();
      } catch {
        // Ignore errors during shutdown
      }
    }
    
    console.log("👋 Goodbye");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Hot reload (SIGHUP)
  process.on("SIGHUP", async () => {
    console.log("\n🔄 SIGHUP received, reloading handlers...");
    try {
      await loadHandlers();
      console.log("✅ Handlers reloaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to reload handlers: ${message}`);
      console.error("   Server continues with current handlers");
    }
  });

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught exception:", error);
    removePidFile();
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled rejection:", reason);
    removePidFile();
    process.exit(1);
  });

  // Cleanup on exit
  process.on("exit", () => {
    removePidFile();
  });
}

// ============================================================================
// Main Entry Point
// ============================================================================

export async function startServer(): Promise<void> {
  setupSignalHandlers();
  await createAndStartServer();
}

// If this file is run directly, start the server
if (import.meta.url === new URL(process.argv[1], "file:").href) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    removePidFile();
    process.exit(1);
  });
}
