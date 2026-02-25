/**
 * APP Validator
 * 
 * Validates Action Plan Packages for correctness and completeness.
 */

import * as fs from "fs/promises";
import * as path from "path";

/* import type { AppPackage } from "./types.js"; */

export interface ValidationResult {
  valid: boolean;
  name?: string;
  version?: string;
  phaseCount?: number;
  isMeta?: boolean;
  errors: string[];
}

/**
 * Validate an APP at the given path.
 */
export async function validateApp(appPath: string): Promise<ValidationResult> {
  const errors: string[] = [];
  
  /* Check required files exist */
  const requiredFiles = ["APP.md", "ARCHITECTURE.md", "FAILURE_MODES.md", "README.md"];
  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(appPath, file));
    } catch {
      errors.push(`Missing required file: ${file}`);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  /* Try to parse APP.md as structured data */
  try {
    const appMd = await fs.readFile(path.join(appPath, "APP.md"), "utf-8");
    
    /* Extract metadata from markdown */
    const nameMatch = appMd.match(/^# (.+?): Action Plan Package/);
    const name = nameMatch ? nameMatch[1] : "unknown";
    
    /* Check for phases */
    const phaseMatches = appMd.match(/### Phase \d+:/g);
    const phaseCount = phaseMatches ? phaseMatches.length : 0;
    
    /* Check for meta-spiral marker */
    const isMeta = appMd.includes("META-NOTE") || appMd.includes("generates APPs");
    
    /* Check for required sections */
    if (!appMd.includes("## Before You Start")) {
      errors.push("Missing 'Before You Start' section");
    }
    if (!appMd.includes("## Execution Plan")) {
      errors.push("Missing 'Execution Plan' section");
    }
    if (!appMd.includes("## Completion Checklist")) {
      errors.push("Missing 'Completion Checklist' section");
    }
    
    return {
      valid: errors.length === 0,
      name,
      version: "0.1.0",
      phaseCount,
      isMeta,
      errors,
    };
  } catch (err) {
    errors.push(`Failed to read APP.md: ${err}`);
    return { valid: false, errors };
  }
}

/**
 * List all APPs in a directory.
 */
export async function listApps(searchPath: string): Promise<Array<{
  path: string;
  name: string;
  valid: boolean;
}>> {
  const apps: Array<{ path: string; name: string; valid: boolean }> = [];
  
  try {
    const entries = await fs.readdir(searchPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const appPath = path.join(searchPath, entry.name);
        const result = await validateApp(appPath);
        apps.push({
          path: appPath,
          name: result.name || entry.name,
          valid: result.valid,
        });
      }
    }
  } catch {
    /* Directory doesn't exist or can't be read */
  }
  
  return apps;
}
