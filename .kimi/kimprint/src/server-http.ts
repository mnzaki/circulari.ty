/**
 * kimprint MCP HTTP Server
 * 
 * HTTP/SSE transport for MCP protocol using official SDK transports.
 * Allows running as a background daemon with proper lifecycle management.
 * 
 * Key feature: Creates new MCP Server instance for each connection
 * because each Server can only be connected to one transport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

import { getToolDefinitions, handleTool } from "./mcp/handlers.js";
import { FileStorage } from "./storage/index.js";
import type { ImprintStorage } from "./types.js";

// ============================================================================
// Configuration
// ============================================================================

const SERVER_VERSION = "0.2.0";
const PID_FILE_PATH = join(homedir(), ".kimi", "kimprint", "server.pid");

interface ServerConfig {
  port: number;
  host: string;
  transport: "sse" | "http";
}

const DEFAULT_CONFIG: ServerConfig = {
  port: 31415,  // π ≈ 3.1415 - spiral-related, memorable, unique!
  host: "127.0.0.1",
  transport: "sse",
};

// ============================================================================
// PID File Management
// ============================================================================

// PID file is just the raw number, traditional Unix style
// Metadata is stored separately in server.json
const SERVER_INFO_PATH = join(homedir(), ".kimi", "kimprint", "server.json");

interface ServerInfo {
  pid: number;
  startedAt: string;
  version: string;
  port?: number;
}

function readPidFile(): number | null {
  try {
    if (!existsSync(PID_FILE_PATH)) return null;
    const content = readFileSync(PID_FILE_PATH, "utf-8").trim();
    const pid = parseInt(content, 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

function writePidFile(port: number): void {
  const dir = PID_FILE_PATH.substring(0, PID_FILE_PATH.lastIndexOf('/'));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Write raw PID to PID file (traditional)
  writeFileSync(PID_FILE_PATH, process.pid.toString(), "utf-8");
  
  // Write metadata to separate JSON file
  const info: ServerInfo = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    version: SERVER_VERSION,
    port,
  };
  writeFileSync(SERVER_INFO_PATH, JSON.stringify(info, null, 2), "utf-8");
}

function removePidFile(): void {
  try {
    if (existsSync(PID_FILE_PATH)) {
      unlinkSync(PID_FILE_PATH);
    }
    if (existsSync(SERVER_INFO_PATH)) {
      unlinkSync(SERVER_INFO_PATH);
    }
  } catch {
    // Ignore errors on cleanup
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function checkExistingServer(): { running: boolean; pid?: number; port?: number } {
  const pid = readPidFile();
  if (!pid) return { running: false };

  if (isProcessRunning(pid)) {
    // Read port from info file if available
    let port: number | undefined;
    try {
      const info = JSON.parse(readFileSync(SERVER_INFO_PATH, "utf-8")) as ServerInfo;
      port = info.port;
    } catch {
      // Ignore errors reading info file
    }
    return { running: true, pid, port };
  }

  // Stale PID file
  removePidFile();
  return { running: false };
}

// ============================================================================
// Hot-Reload Support
// ============================================================================

// Module references for hot-reload (module-level so they're shared across connections)
let currentGetToolDefinitions = getToolDefinitions;
let currentHandleTool = handleTool;

// Hot-reload function (module-level so SIGHUP can access it)
async function reloadHandlers(): Promise<boolean> {
  try {
    console.log("🔄 Hot-reloading handlers...");
    
    // Force re-import by adding cache-busting query parameter
    const modulePath = "./mcp/handlers.js";
    const cacheBuster = `?reload=${Date.now()}`;
    const { getToolDefinitions: newGetToolDefinitions, handleTool: newHandleTool } = 
      await import(modulePath + cacheBuster);
    
    // Validate the new handlers work
    if (typeof newGetToolDefinitions !== "function") {
      throw new Error("getToolDefinitions is not a function");
    }
    if (typeof newHandleTool !== "function") {
      throw new Error("handleTool is not a function");
    }
    
    // Test call to make sure it doesn't throw
    const testTools = newGetToolDefinitions();
    if (!Array.isArray(testTools)) {
      throw new Error("getToolDefinitions did not return an array");
    }
    
    // Update references - new connections will use these
    currentGetToolDefinitions = newGetToolDefinitions;
    currentHandleTool = newHandleTool;
    
    console.log(`✅ Hot-reload successful (${testTools.length} tools loaded)`);
    console.log("   New connections will use updated handlers");
    console.log("   Existing connections continue with old handlers");
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Hot-reload failed:", message);
    console.error("   Server continues with existing handlers");
    console.error("   Fix the error and try again");
    return false;
  }
}

// ============================================================================
// HTTP Server with MCP
// ============================================================================

export async function startHTTPServer(config: Partial<ServerConfig> = {}): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check for existing server
  const existing = checkExistingServer();
  if (existing.running) {
    console.error(`❌ Server already running (PID ${existing.pid}, port ${existing.port})`);
    process.exit(1);
  }

  // Initialize storage (shared across all connections)
  const storage: ImprintStorage = new FileStorage();

  // Store active SSE transports by session ID
  const transports: Map<string, SSEServerTransport> = new Map();

  // Factory function to create a new MCP Server for each connection
  // (Each Server can only be connected to one transport)
  function createMcpServer(): Server {
    const server = new Server(
      {
        name: "kimprint",
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Set up tool handlers (using current module references for hot-reload)
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: currentGetToolDefinitions() };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      
      try {
        const result = await currentHandleTool(name, args, {
          storage,
          startTime: new Date(),
          version: SERVER_VERSION,
        });
        // Return in the format MCP SDK expects
        return {
          content: result.content,
          isError: result.isError,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    });

    return server;
  }

  // Create HTTP server
  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const parsed = parse(req.url || "", true);
    const pathname = parsed.pathname || "";

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Mcp-Session-Id");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // Health check
    if (pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "ok",
        version: SERVER_VERSION,
        uptime: process.uptime(),
      }));
      return;
    }

    // SSE endpoint - Create new MCP Server for each connection
    if (pathname === "/sse" && req.method === "GET") {
      const transport = new SSEServerTransport("/message", res);
      const sessionIdShort = transport.sessionId.slice(0, 8);
      
      // Store transport for message routing
      transports.set(transport.sessionId, transport);
      
      const mcpServer = createMcpServer();
      await mcpServer.connect(transport);
      
      // Log connection (only if not too frequent)
      const now = Date.now();
      const lastLog = (httpServer as any)._lastConnectionLog || 0;
      if (now - lastLog > 5000) { // Only log every 5 seconds max
        console.log(`📡 SSE client ${sessionIdShort}... connected (${transports.size} total)`);
        (httpServer as any)._lastConnectionLog = now;
      }
      
      req.on("close", () => {
        transports.delete(transport.sessionId);
        // Silent disconnect to reduce spam
      });
      
      return;
    }

    // Message endpoint for SSE clients - route to correct transport
    if (pathname === "/message" && req.method === "POST") {
      const sessionId = parsed.query.sessionId as string;
      
      if (!sessionId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing sessionId" }));
        return;
      }
      
      const transport = transports.get(sessionId);
      if (!transport) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Session not found" }));
        return;
      }
      
      // Handle the POST message
      await transport.handlePostMessage(req, res);
      return;
    }

    // HTTP streamable transport endpoint - Create new MCP Server for each connection
    if (pathname === "/mcp" && req.method === "POST") {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
      });
      
      const mcpServer = createMcpServer();
      await mcpServer.connect(transport);
      
      // Handle the request
      let body = "";
      req.on("data", (chunk) => body += chunk);
      req.on("end", async () => {
        try {
          const message = JSON.parse(body);
          // Process through transport
          await transport.handleRequest(req, res, message);
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    // Default: serve simple info page
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>kimprint MCP Server</title></head>
        <body>
          <h1>🌀 kimprint MCP Server v${SERVER_VERSION}</h1>
          <p>Status: <strong>Running</strong></p>
          <p>Uptime: ${Math.floor(process.uptime())}s</p>
          <h2>Endpoints:</h2>
          <ul>
            <li><a href="/health">/health</a> - Health check</li>
            <li>/sse - SSE transport endpoint</li>
            <li>/mcp - HTTP transport endpoint</li>
          </ul>
        </body>
      </html>
    `);
  });

  // Start listening
  return new Promise((resolve, reject) => {
    httpServer.listen(finalConfig.port, finalConfig.host, () => {
      // Write PID file
      writePidFile(finalConfig.port);

      console.log(`🌀 kimprint MCP Server v${SERVER_VERSION}`);
      console.log(`   PID: ${process.pid}`);
      console.log(`   PID file: ${PID_FILE_PATH}`);
      console.log(`   Transport: HTTP/${finalConfig.transport.toUpperCase()}`);
      console.log(`   URL: http://${finalConfig.host}:${finalConfig.port}`);
      console.log(`   SSE: http://${finalConfig.host}:${finalConfig.port}/sse`);
      console.log(`   MCP: http://${finalConfig.host}:${finalConfig.port}/mcp`);
      console.log(`✅ Server ready`);

      // Set up signal handlers
      setupSignalHandlers(httpServer);

      resolve();
    });

    httpServer.on("error", (err) => {
      console.error("❌ Failed to start server:", err);
      removePidFile();
      reject(err);
    });
  });
}

function setupSignalHandlers(httpServer: ReturnType<typeof createServer>): void {
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);

    removePidFile();

    httpServer.close(() => {
      console.log("👋 Goodbye");
      process.exit(0);
    });

    // Force exit after 5 seconds
    setTimeout(() => {
      console.log("⚠️  Forced shutdown");
      process.exit(1);
    }, 5000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // SIGHUP for hot-reload
  process.on("SIGHUP", async () => {
    console.log("\n🔄 SIGHUP received");
    await reloadHandlers();
  });

  process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught exception:", err);
    removePidFile();
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled rejection:", reason);
    removePidFile();
    process.exit(1);
  });
}

// Start if run directly
if (import.meta.url === new URL(process.argv[1], "file:").href) {
  const port = parseInt(process.env.KIMPRINT_PORT || "3001", 10);
  const host = process.env.KIMPRINT_HOST || "127.0.0.1";
  
  startHTTPServer({ port, host }).catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
