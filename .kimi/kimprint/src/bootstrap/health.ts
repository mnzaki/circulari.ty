/**
 * Bootstrap Health Checking
 * 
 * Compares declared bootstrap state with observed reality,
 * detects staleness, generates maintenance guidance.
 */

import { readdirSync, statSync } from "fs";
import { join } from "path";
import type { Bootstrap, BootstrapHealth } from "./schemas/types.js";
import { MAINTENANCE_GUIDANCE } from "./schemas/types.js";

// ============================================================================
// Health Check Result
// ============================================================================

export interface BootstrapHealthCheck {
  /** Bootstrap file path */
  path: string;
  
  /** Bootstrap kind */
  kind: Bootstrap["kind"];
  
  /** Stream name */
  stream: string;
  
  /** Current health metadata from bootstrap */
  current_health: BootstrapHealth;
  
  /** Calculated health status */
  calculated: {
    confidence: number;
    staleness: "fresh" | "aging" | "stale";
    days_since_update: number;
  };
  
  /** Maintenance guidance for this kind */
  maintenance_guidance: string;
  
  /** Warnings about mismatches */
  warnings: string[];
  
  /** TODOs for maintenance */
  todos: string[];
  
  /** Specific mismatches found */
  observed_mismatches: Array<{
    field: string;
    declared: unknown;
    observed: unknown;
    suggested_action: string;
  }>;
}

// ============================================================================
// Health Check Functions
// ============================================================================

/**
 * Check health of all discovered bootstraps
 */
export function checkBootstrapHealth(
  bootstrapPath: string,
  bootstrap: Bootstrap,
  observed: ObservedState
): BootstrapHealthCheck {
  const now = new Date();
  
  // Handle legacy bootstraps without _health field
  const health = bootstrap._health || {
    last_updated: new Date(0).toISOString(), // Epoch = very stale
    update_frequency: "monthly",
    confidence: 0.5,
    staleness: "stale" as const,
  };
  
  const lastUpdated = new Date(health.last_updated);
  const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate staleness based on kind and time (default to "structure" for legacy)
  const kind = bootstrap.kind || "structure";
  const staleness = calculateStaleness(kind, daysSinceUpdate);
  
  // Detect mismatches between declared and observed
  const mismatches = detectMismatches(bootstrap, observed, kind);
  
  // Generate warnings from mismatches
  const warnings = mismatches.map(m => 
    `${m.field}: declared "${m.declared}", observed "${m.observed}"`
  );
  
  // Generate todos from mismatches
  const todos = mismatches.map(m => m.suggested_action);
  
  // Calculate confidence based on staleness and mismatches
  let confidence = health.confidence;
  if (staleness === "stale") confidence -= 0.3;
  if (staleness === "aging") confidence -= 0.1;
  confidence -= mismatches.length * 0.1;
  confidence = Math.max(0, Math.min(1, confidence));
  
  return {
    path: bootstrapPath,
    kind,
    stream: bootstrap.stream,
    current_health: health,
    calculated: {
      confidence: Math.round(confidence * 100) / 100,
      staleness,
      days_since_update: Math.round(daysSinceUpdate * 10) / 10,
    },
    maintenance_guidance: MAINTENANCE_GUIDANCE[kind],
    warnings: warnings.length > 0 ? warnings : [],
    todos: todos.length > 0 ? todos : [],
    observed_mismatches: mismatches,
  };
}

/**
 * Calculate staleness based on kind and days since update
 */
function calculateStaleness(
  kind: Bootstrap["kind"],
  daysSinceUpdate: number
): "fresh" | "aging" | "stale" {
  switch (kind) {
    case "ethos":
      if (daysSinceUpdate > 90) return "stale";
      if (daysSinceUpdate > 30) return "aging";
      return "fresh";
    
    case "structure":
      if (daysSinceUpdate > 30) return "stale";
      if (daysSinceUpdate > 7) return "aging";
      return "fresh";
    
    case "state":
      if (daysSinceUpdate > 3) return "stale";
      if (daysSinceUpdate > 0) return "aging";
      return "fresh";
    
    default:
      return "fresh";
  }
}

/**
 * Detect mismatches between declared and observed state
 */
function detectMismatches(
  bootstrap: Bootstrap,
  observed: ObservedState,
  kind: Bootstrap["kind"]
): Array<{ field: string; declared: unknown; observed: unknown; suggested_action: string }> {
  const mismatches: Array<{ field: string; declared: unknown; observed: unknown; suggested_action: string }> = [];
  
  // Check current_app mismatch (STATE only)
  if (kind === "state") {
    const stateBootstrap = bootstrap as { current_work?: { active_app?: { id: string } } };
    const declaredApp = stateBootstrap.current_work?.active_app?.id;
    const observedApp = observed.most_recent_app;
    
    if (declaredApp && observedApp && declaredApp !== observedApp) {
      mismatches.push({
        field: "current_work.active_app.id",
        declared: declaredApp,
        observed: observedApp,
        suggested_action: `Update current_app from ${declaredApp} to ${observedApp}`,
      });
    }
  }
  
  // Check for apps in 1NBOX not listed in bootstrap
  if (kind === "state") {
    const stateBootstrap = bootstrap as { current_work?: { active_app?: { id: string }; in_flight?: Array<{ id: string }> } };
    const inFlightApps = stateBootstrap.current_work?.in_flight?.map(a => a.id) || [];
    const unlistedApps = observed.apps_in_1nbox.filter(
      app => !inFlightApps.includes(app) && app !== stateBootstrap.current_work?.active_app?.id
    );
    
    if (unlistedApps.length > 0) {
      mismatches.push({
        field: "current_work.in_flight",
        declared: inFlightApps,
        observed: observed.apps_in_1nbox,
        suggested_action: `Add to in_flight: ${unlistedApps.join(", ")}`,
      });
    }
  }
  
  // Check for recent 1NBOX files not in urgencies (STATE only)
  if (kind === "state") {
    const stateBootstrap = bootstrap as { urgencies?: Array<{ source?: string }> };
    const urgencySources = stateBootstrap.urgencies?.map(u => u.source) || [];
    const unlistedFiles = observed.recent_1nbox_files.filter(
      file => !urgencySources.some(source => source?.includes(file))
    );
    
    if (unlistedFiles.length > 0) {
      mismatches.push({
        field: "urgencies",
        declared: `${stateBootstrap.urgencies?.length || 0} items`,
        observed: `${stateBootstrap.urgencies?.length || 0 + unlistedFiles.length} items (${unlistedFiles.length} new)`,
        suggested_action: `Review and add urgencies from: ${unlistedFiles.slice(0, 3).join(", ")}${unlistedFiles.length > 3 ? "..." : ""}`,
      });
    }
  }
  
  return mismatches;
}

// ============================================================================
// Observed State
// ============================================================================

export interface ObservedState {
  /** Most recent APP ID found in 1NBOX */
  most_recent_app: string | null;
  
  /** All APP IDs found in 1NBOX */
  apps_in_1nbox: string[];
  
  /** Recent files in 1NBOX (last 7 days) */
  recent_1nbox_files: string[];
  
  /** All files in 1NBOX */
  all_1nbox_files: string[];
}

/**
 * Gather observed state from filesystem
 */
export function gatherObservedState(cwd: string): ObservedState {
  const inboxPath = join(cwd, ".kimprint", "1NBOX");
  
  try {
    const files = readdirSync(inboxPath);
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    // Find APP files
    const appFiles = files.filter(f => f.startsWith("APP-") && f.endsWith(".md"));
    const appsIn1nbox = appFiles
      .map(f => {
        const match = f.match(/APP-(\d+|[a-z-]+)/i);
        return match ? match[0] : null;
      })
      .filter((app): app is string => app !== null);
    
    // Get recent files
    const recentFiles = files.filter(f => {
      try {
        const stat = statSync(join(inboxPath, f));
        return (now - stat.mtime.getTime()) < oneWeek;
      } catch {
        return false;
      }
    });
    
    // Most recent APP (by file modification time)
    let mostRecentApp: string | null = null;
    let mostRecentTime = 0;
    
    for (const appFile of appFiles) {
      try {
        const stat = statSync(join(inboxPath, appFile));
        if (stat.mtime.getTime() > mostRecentTime) {
          mostRecentTime = stat.mtime.getTime();
          const match = appFile.match(/APP-(\d+|[a-z-]+)/i);
          mostRecentApp = match ? match[0] : null;
        }
      } catch {
        // Skip files we can't stat
      }
    }
    
    return {
      most_recent_app: mostRecentApp,
      apps_in_1nbox: appsIn1nbox,
      recent_1nbox_files: recentFiles,
      all_1nbox_files: files,
    };
  } catch {
    // If we can't read 1NBOX, return empty state
    return {
      most_recent_app: null,
      apps_in_1nbox: [],
      recent_1nbox_files: [],
      all_1nbox_files: [],
    };
  }
}
