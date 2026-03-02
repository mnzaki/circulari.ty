/**
 * Energy Registry
 * 
 * Filesystem-based energy discovery and management.
 * Loads energies from ~/.kimi/energies/
 */

import * as fs from "fs/promises";
import * as path from "path";
import { homedir } from "os";

const ENERGY_REGISTRY_PATH = path.join(homedir(), ".kimi", "energies");

// ============================================================================
// Types
// ============================================================================

export interface EnergyDefinition {
  fqed: string;
  name: string;
  description: string;
  characteristics: {
    intensity_range: [number, number];
    typical_duration?: string;
    emotional_valence?: string;
    social?: boolean;
  };
  related_energies: string[];
  indicators: string[];
}

export interface EnergyEntry {
  fqed: string;
  domain: string;
  name: string;
  definition: EnergyDefinition;
  semanticSignatures: string[];  // Unicode encodings
  synonyms: string[];
  path: string;
  isSymlink: boolean;
  targetDomain?: string;  // If symlink, where it points
}

export interface EnergyRegistry {
  generatedAt: string;
  version: string;
  domains: string[];
  energyCount: number;
  fqedToPath: Record<string, string>;
  crossDomainMap: Record<string, string[]>;
  entries: EnergyEntry[];
}

// ============================================================================
// Discovery
// ============================================================================

/**
 * Discover all energies from the filesystem registry.
 */
export async function discoverEnergies(): Promise<EnergyRegistry> {
  const entries: EnergyEntry[] = [];
  const fqedToPath: Record<string, string> = {};
  const crossDomainMap: Record<string, string[]> = {};
  const domains: string[] = [];
  
  try {
    const domainDirs = await fs.readdir(ENERGY_REGISTRY_PATH);
    
    for (const domain of domainDirs) {
      if (domain.startsWith(".") || domain === "__index__.json") continue;
      // Allow _common but filter other underscore-prefixed files
      
      const domainPath = path.join(ENERGY_REGISTRY_PATH, domain);
      const stat = await fs.stat(domainPath);
      if (!stat.isDirectory()) continue;
      
      domains.push(domain);
      
      const energyDirs = await fs.readdir(domainPath);
      
      for (const energyName of energyDirs) {
        const energyPath = path.join(domainPath, energyName);
        const energyStat = await fs.lstat(energyPath);
        
        if (!energyStat.isDirectory() && !energyStat.isSymbolicLink()) continue;
        
        const isSymlink = energyStat.isSymbolicLink();
        let targetDomain: string | undefined;
        
        if (isSymlink) {
          const target = await fs.readlink(energyPath);
          // Extract target domain from path like "../_common/exploring"
          const match = target.match(/\.\.\/(\w+)\/\w+/);
          if (match) targetDomain = match[1];
        }
        
        // Load definition
        const definition = await loadEnergyDefinition(energyPath);
        if (!definition) continue;
        
        // Load semantic signatures
        const signatures = await loadSemanticSignatures(energyPath);
        
        // Load synonyms
        const synonyms = await loadSynonyms(energyPath);
        
        const entry: EnergyEntry = {
          fqed: definition.fqed,
          domain,
          name: energyName,
          definition,
          semanticSignatures: signatures,
          synonyms,
          path: energyPath,
          isSymlink,
          targetDomain,
        };
        
        entries.push(entry);
        fqedToPath[definition.fqed] = isSymlink 
          ? `${targetDomain}/${energyName}` 
          : `${domain}/${energyName}`;
        
        // Build cross-domain map
        if (isSymlink && targetDomain) {
          const targetFQED = `${targetDomain}:${energyName}`;
          if (!crossDomainMap[targetFQED]) {
            crossDomainMap[targetFQED] = [];
          }
          crossDomainMap[targetFQED].push(definition.fqed);
        }
      }
    }
  } catch (error) {
    console.error("Failed to discover energies:", error);
  }
  
  return {
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
    domains,
    energyCount: entries.length,
    fqedToPath,
    crossDomainMap,
    entries,
  };
}

/**
 * Load energy definition from definition.json
 */
async function loadEnergyDefinition(energyPath: string): Promise<EnergyDefinition | null> {
  try {
    const defPath = path.join(energyPath, "definition.json");
    const content = await fs.readFile(defPath, "utf-8");
    return JSON.parse(content) as EnergyDefinition;
  } catch {
    return null;
  }
}

/**
 * Load semantic signatures from semantic_signature.txt
 */
async function loadSemanticSignatures(energyPath: string): Promise<string[]> {
  try {
    const sigPath = path.join(energyPath, "semantic_signature.txt");
    const content = await fs.readFile(sigPath, "utf-8");
    return content.split("\n").filter(line => line.trim());
  } catch {
    return [];
  }
}

/**
 * Load synonyms from synonyms.txt
 */
async function loadSynonyms(energyPath: string): Promise<string[]> {
  try {
    const synPath = path.join(energyPath, "synonyms.txt");
    const content = await fs.readFile(synPath, "utf-8");
    return content.split("\n").filter(line => line.trim());
  } catch {
    return [];
  }
}

// ============================================================================
// Lookup
// ============================================================================

/**
 * Get energy entry by FQED
 */
export async function getEnergy(fqed: string): Promise<EnergyEntry | null> {
  const registry = await discoverEnergies();
  return registry.entries.find(e => e.fqed === fqed) ?? null;
}

/**
 * Get all energies in a domain
 */
export async function getEnergiesByDomain(domain: string): Promise<EnergyEntry[]> {
  const registry = await discoverEnergies();
  return registry.entries.filter(e => e.domain === domain);
}

/**
 * Get semantic signatures for an energy
 */
export async function getEnergySignatures(fqed: string): Promise<string[]> {
  const energy = await getEnergy(fqed);
  return energy?.semanticSignatures ?? [];
}

/**
 * Find energies by semantic signature
 */
export async function findEnergiesBySignature(signature: string): Promise<EnergyEntry[]> {
  const registry = await discoverEnergies();
  return registry.entries.filter(e => 
    e.semanticSignatures.includes(signature)
  );
}

// ============================================================================
// Generation
// ============================================================================

/**
 * Generate TypeScript constants from energy registry
 */
export async function generateTypeScriptConstants(): Promise<string> {
  const registry = await discoverEnergies();
  
  const lines: string[] = [
    "/**",
    " * Auto-generated energy constants",
    " * Generated at: " + registry.generatedAt,
    " * Do not edit manually — update ~/.kimi/energies/ instead",
    " */",
    "",
  ];
  
  // Generate per-domain constants
  for (const domain of registry.domains) {
    if (domain === "_common") continue;  // Skip _common, it's special
    
    const energies = registry.entries.filter(e => e.domain === domain && !e.isSymlink);
    
    if (energies.length === 0) continue;
    
    const interfaceName = `${domain.charAt(0).toUpperCase() + domain.slice(1)}Energies`;
    
    lines.push(`export interface ${interfaceName} {`);
    for (const energy of energies) {
      const constName = energy.name.toUpperCase().replace(/-/g, "_");
      lines.push(`  /** ${energy.definition.description} */`);
      lines.push(`  ${constName}: "${energy.fqed}";`);
    }
    lines.push("}");
    lines.push("");
    
    lines.push(`export const ${interfaceName}: ${interfaceName} = {`);
    for (const energy of energies) {
      const constName = energy.name.toUpperCase().replace(/-/g, "_");
      lines.push(`  ${constName}: "${energy.fqed}",`);
    }
    lines.push("} as const;");
    lines.push("");
  }
  
  // Generate all energies combined
  lines.push("export const AllEnergies = {");
  for (const entry of registry.entries) {
    if (entry.isSymlink) continue;  // Skip symlinks in combined
    const constName = entry.name.toUpperCase().replace(/-/g, "_");
    lines.push(`  ${constName}: "${entry.fqed}",`);
  }
  lines.push("} as const;");
  lines.push("");
  
  // Generate signature map
  lines.push("export const EnergySignatures: Record<string, string[]> = {");
  for (const entry of registry.entries) {
    if (entry.semanticSignatures.length === 0) continue;
    lines.push(`  "${entry.fqed}": [${entry.semanticSignatures.map(s => `"${s}"`).join(", ")}],`);
  }
  lines.push("};");
  
  return lines.join("\n");
}

/**
 * Save registry index to __index__.json
 */
export async function saveRegistryIndex(registry: EnergyRegistry): Promise<void> {
  const indexPath = path.join(ENERGY_REGISTRY_PATH, "__index__.json");
  const indexData = {
    generated_at: registry.generatedAt,
    version: registry.version,
    domains: registry.domains,
    energy_count: registry.energyCount,
    fqed_to_path: registry.fqedToPath,
    cross_domain_map: registry.crossDomainMap,
  };
  
  await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2), "utf-8");
}
