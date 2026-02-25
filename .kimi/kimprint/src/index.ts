#!/usr/bin/env node

/**
 * kimprint - Conservation packets for Kimi CLI sessions
 * 
 * Usage:
 *   kimprint server          # Start MCP server (stdio)
 *   kimprint capture "msg"   # Capture a moment
 *   kimprint session         # Generate session packet
 *   kimprint list            # List all packets
 *   kimprint search "query"  # Search packets
 *   kimprint reenter         # Show re-entry packet
 *   kimprint watch           # Start session watcher
 *   kimprint --help          # Show help
 */

import { startServer } from "./server.js";
import { runCLI, createCLI } from "./cli.js";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  /* Server mode: MCP protocol */
  if (command === "server") {
    await startServer();
    return;
  }
  
  /* Watch mode: File watcher */
  if (command === "watch") {
    /* TODO Phase 5: Start watcher actor */
    console.error("kimprint: Watcher mode not yet implemented (Phase 5)");
    process.exit(1);
  }
  
  /* CLI mode: Use Commander for all other commands */
  const cliCommands = [
    "capture",
    "session", 
    "list",
    "search",
    "reenter",
    "app:create",
    "app:templates",
    "app:validate",
    "app:list",
    "semantic:query",
    "semantic:density",
    "semantic:match",
    "search:semantic",
    "project:vibe",
    "project:clusters",
    "meta:clusters",
  ];
  
  if (cliCommands.includes(command)) {
    await runCLI();
    return;
  }
  
  /* Help or unknown command */
  const cli = createCLI();
  await cli.parseAsync(process.argv);
}

main().catch((err) => {
  console.error("kimprint: Fatal error:", err);
  process.exit(1);
});
