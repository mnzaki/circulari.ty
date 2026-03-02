/**
 * kimprint CLI - Server Management Commands
 * 
 * Start, stop, restart, and manage the kimprint MCP server.
 */

import { Command } from "commander";
import { readFileSync, existsSync, unlinkSync, openSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { spawn, execSync } from "child_process";
import { fileURLToPath } from "url";

// Get the project root directory (where this file is located)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

// Default HTTP port (π ≈ 3.1415 - because spirals are circular!)
const DEFAULT_HTTP_PORT = 31415;

const PID_FILE_PATH = join(homedir(), ".kimi", "kimprint", "server.pid");
const SERVER_INFO_PATH = join(homedir(), ".kimi", "kimprint", "server.json");
const LOG_FILE_PATH = join(homedir(), ".kimi", "kimprint", "server.log");

interface ServerInfo {
  pid: number;
  startedAt: string;
  version: string;
  port?: number;
}

function readPid(): number | null {
  try {
    if (!existsSync(PID_FILE_PATH)) return null;
    const content = readFileSync(PID_FILE_PATH, "utf-8").trim();
    const pid = parseInt(content, 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

function readServerInfo(): ServerInfo | null {
  try {
    if (!existsSync(SERVER_INFO_PATH)) return null;
    const content = readFileSync(SERVER_INFO_PATH, "utf-8");
    return JSON.parse(content) as ServerInfo;
  } catch {
    return null;
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

function getServerStatus(): { running: boolean; pid?: number; since?: string; version?: string; port?: number } {
  const pid = readPid();
  if (!pid) return { running: false };
  
  if (isProcessRunning(pid)) {
    const info = readServerInfo();
    return {
      running: true,
      pid,
      since: info?.startedAt,
      version: info?.version,
      port: info?.port,
    };
  }
  
  // Stale PID file - clean up
  try { unlinkSync(PID_FILE_PATH); } catch {}
  try { unlinkSync(SERVER_INFO_PATH); } catch {}
  return { running: false };
}

/**
 * Add server management commands to the CLI program.
 */
export function addServerCommands(program: Command): void {
  const serverCmd = program
    .command("server")
    .description("Manage the kimprint MCP server");

  /* server status - Check if running */
  serverCmd
    .command("status")
    .description("Check server status")
    .action(() => {
      const status = getServerStatus();
      
      if (status.running) {
        console.log("🌀 kimprint MCP Server is RUNNING");
        console.log(`   PID: ${status.pid}`);
        console.log(`   Version: ${status.version}`);
        console.log(`   Started: ${status.since}`);
        if (status.port) {
          console.log(`   URL: http://127.0.0.1:${status.port}`);
          console.log(`   Health: http://127.0.0.1:${status.port}/health`);
        }
        console.log(`   PID file: ${PID_FILE_PATH}`);
      } else {
        console.log("💤 kimprint MCP Server is STOPPED");
        console.log(`   PID file: ${PID_FILE_PATH}`);
        console.log("\n   Start with: kimprint server start");
      }
    });

  /* server start - Start the server */
  serverCmd
    .command("start")
    .description("Start the MCP server (HTTP mode)")
    .option("-f, --foreground", "Run in foreground (don't daemonize)")
    .option("-p, --port <port>", "HTTP port", `${DEFAULT_HTTP_PORT}`)
    .option("--stdio", "Use stdio transport (for MCP clients)")
    .action(async (options) => {
      const status = getServerStatus();
      
      if (status.running) {
        console.log("❌ Server is already running!");
        console.log(`   PID: ${status.pid}`);
        console.log(`   Port: ${status.port}`);
        console.log("\n   Restart with: kimprint server restart");
        return;
      }

      const port = parseInt(options.port, 10);

      if (options.foreground || options.stdio) {
        if (options.stdio) {
          console.log("🌀 Starting kimprint MCP Server (stdio mode)...");
          console.log("   Press Ctrl+C to stop\n");
          
          // Import and start stdio server
          const { startServer } = await import("./server.js");
          await startServer();
        } else {
          console.log("🌀 Starting kimprint MCP Server (HTTP foreground)...");
          console.log(`   Port: ${port}`);
          console.log("   Press Ctrl+C to stop\n");
          
          // Import and start HTTP server
          const { startHTTPServer } = await import("./server-http.js");
          await startHTTPServer({ port });
        }
      } else {
        console.log("🌀 Starting kimprint MCP Server (HTTP background)...");
        console.log(`   Port: ${port}`);
        
        // Spawn detached process for HTTP server
        const out = openSync(LOG_FILE_PATH, "a");
        const err = openSync(LOG_FILE_PATH, "a");
        
        const child = spawn("node", [join(PROJECT_ROOT, "dist", "server-http.js")], {
          detached: true,
          stdio: ["ignore", out, err],
          cwd: PROJECT_ROOT,
          env: { ...process.env, KIMPRINT_PORT: `${port}` },
        });
        
        child.unref();
        
        // Wait for PID file to be written
        await new Promise(r => setTimeout(r, 1000));
        
        const newStatus = getServerStatus();
        if (newStatus.running) {
          console.log(`✅ Server started (PID ${newStatus.pid})`);
          console.log(`   URL: http://127.0.0.1:${newStatus.port}`);
          console.log(`   Log: ${LOG_FILE_PATH}`);
          console.log("\n   View status: kimprint server status");
          console.log("   Stop: kimprint server stop");
          console.log(`   Test: curl http://127.0.0.1:${newStatus.port}/health`);
        } else {
          console.log("❌ Failed to start server");
          console.log(`   Check log: ${LOG_FILE_PATH}`);
        }
      }
    });

  /* server stop - Stop the server */
  serverCmd
    .command("stop")
    .description("Stop the MCP server")
    .option("-f, --force", "Force kill if graceful shutdown fails")
    .action((options) => {
      const status = getServerStatus();
      
      if (!status.running) {
        console.log("💤 Server is not running");
        return;
      }

      console.log(`🛑 Stopping kimprint MCP Server (PID ${status.pid})...`);
      
      try {
        // Try graceful shutdown first
        process.kill(status.pid!, "SIGTERM");
        
        // Wait up to 5 seconds for process to exit
        let waited = 0;
        const checkInterval = setInterval(() => {
          waited += 100;
          if (!isProcessRunning(status.pid!)) {
            clearInterval(checkInterval);
            console.log("✅ Server stopped gracefully");
            return;
          }
          
          if (waited >= 5000) {
            clearInterval(checkInterval);
            
            if (options.force) {
              console.log("   Force killing...");
              try {
                process.kill(status.pid!, "SIGKILL");
                console.log("✅ Server force stopped");
              } catch (err) {
                console.log("❌ Failed to force stop:", err);
              }
            } else {
              console.log("❌ Server did not stop gracefully");
              console.log("   Use --force to kill immediately");
            }
          }
        }, 100);
        
      } catch (err) {
        console.log("❌ Error stopping server:", err);
      }
    });

  /* server restart - Restart the server */
  serverCmd
    .command("restart")
    .description("Restart the MCP server")
    .option("-f, --foreground", "Run in foreground")
    .option("-p, --port <port>", "HTTP port", `${DEFAULT_HTTP_PORT}`)
    .action(async (options) => {
      const status = getServerStatus();
      const port = parseInt(options.port, 10);
      
      if (status.running) {
        console.log("🛑 Stopping current server...");
        try {
          process.kill(status.pid!, "SIGTERM");
          // Wait for it to stop
          await new Promise(r => setTimeout(r, 1000));
        } catch {
          // Ignore errors
        }
      }
      
      // Start server
      console.log("🔄 Starting new server...\n");
      if (options.foreground) {
        console.log("🌀 Starting kimprint MCP Server (HTTP foreground)...");
        console.log(`   Port: ${port}`);
        console.log("   Press Ctrl+C to stop\n");
        const { startHTTPServer } = await import("./server-http.js");
        await startHTTPServer({ port });
      } else {
        console.log("🌀 Starting kimprint MCP Server (HTTP background)...");
        console.log(`   Port: ${port}`);
        
        // Spawn detached process
        const out = openSync(LOG_FILE_PATH, "a");
        const err = openSync(LOG_FILE_PATH, "a");
        
        const child = spawn("node", [join(PROJECT_ROOT, "dist", "server-http.js")], {
          detached: true,
          stdio: ["ignore", out, err],
          cwd: PROJECT_ROOT,
          env: { ...process.env, KIMPRINT_PORT: `${port}` },
        });
        
        child.unref();
        
        // Wait a moment for PID file to be written
        await new Promise(r => setTimeout(r, 1000));
        
        const newStatus = getServerStatus();
        if (newStatus.running) {
          console.log(`✅ Server restarted (PID ${newStatus.pid})`);
          console.log(`   URL: http://127.0.0.1:${newStatus.port}`);
          console.log(`   Log: ${LOG_FILE_PATH}`);
        } else {
          console.log("❌ Failed to restart server");
          console.log(`   Check log: ${LOG_FILE_PATH}`);
        }
      }
    });

  /* server reload - Reload handlers (hot-reload) */
  serverCmd
    .command("reload")
    .alias("refresh")
    .description("Reload server handlers without restarting (hot-reload)")
    .action(() => {
      const status = getServerStatus();
      
      if (!status.running) {
        console.log("💤 Server is not running");
        console.log("   Start with: kimprint server start");
        return;
      }

      console.log(`🔄 Sending SIGHUP to server (PID ${status.pid})...`);
      
      try {
        process.kill(status.pid!, "SIGHUP");
        console.log("✅ Hot-reload signal sent");
        console.log("   Handlers will reload without disconnecting clients");
      } catch (err) {
        console.log("❌ Failed to send reload signal:", err);
      }
    });

  /* server log - View server log */
  serverCmd
    .command("log")
    .description("View server log")
    .option("-f, --follow", "Follow log output (like tail -f)")
    .option("-n, --lines <number>", "Number of lines to show", "50")
    .action((options) => {
      if (!existsSync(LOG_FILE_PATH)) {
        console.log("📭 No log file found");
        console.log(`   Expected: ${LOG_FILE_PATH}`);
        return;
      }

      if (options.follow) {
        console.log(`📋 Following log (Ctrl+C to exit):\n`);
        try {
          execSync(`tail -f "${LOG_FILE_PATH}"`, { stdio: "inherit" });
        } catch {
          // User pressed Ctrl+C
        }
      } else {
        const lines = parseInt(options.lines, 10);
        console.log(`📋 Last ${lines} lines of log:\n`);
        try {
          const output = execSync(`tail -n ${lines} "${LOG_FILE_PATH}"`, { encoding: "utf-8" });
          console.log(output);
        } catch (err) {
          console.log("Error reading log:", err);
        }
      }
    });

  /* server run - Run HTTP server in foreground */
  serverCmd
    .command("run")
    .description("Run HTTP server in foreground")
    .option("-p, --port <port>", "HTTP port", `${DEFAULT_HTTP_PORT}`)
    .action(async (options) => {
      const port = parseInt(options.port, 10);
      
      console.log("🌀 Starting kimprint MCP Server (HTTP foreground)...");
      console.log(`   Port: ${port}`);
      console.log("   Press Ctrl+C to stop\n");
      
      // Import and start HTTP server
      const { startHTTPServer } = await import("./server-http.js");
      await startHTTPServer({ port });
    });
}
