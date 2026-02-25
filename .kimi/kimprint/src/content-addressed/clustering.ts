/**
 * Semantic Clustering for Project Vibes
 * 
 * Groups vibe data into higher-level patterns using semantic condensation.
 * Finds emergent themes, hot zones, and collective energy.
 */

import { SEMANTIC_TOKENS } from "./index.js";

export interface VibeCluster {
  name: string;
  type: "energy" | "theme" | "tension" | "convergence" | "emergent";
  items: string[];
  semanticSignature: string[];
  intensity: number; // 0-1
  description: string;
}

/**
 * Cluster vibe data into semantic groups.
 */
export function clusterVibe(
  instances: Array<{ name: string; focus: string; energy: string }>,
  patterns: string[],
  tensions: string[],
  convergences: string[]
): VibeCluster[] {
  const clusters: VibeCluster[] = [];
  
  /* Cluster 1: By Energy Type */
  const energyGroups = groupByEnergy(instances);
  for (const [energy, items] of Object.entries(energyGroups)) {
    if (items.length > 0) {
      clusters.push({
        name: `${energy.charAt(0).toUpperCase() + energy.slice(1)} Zone`,
        type: "energy",
        items: items.map(i => i.name),
        semanticSignature: [energy],
        intensity: items.length / instances.length,
        description: energyDescriptions[energy] || `Instances in ${energy} mode`,
      });
    }
  }
  
  /* Cluster 2: By Semantic Theme */
  const allContent = [
    ...instances.map(i => `${i.name} ${i.focus}`),
    ...patterns,
    ...tensions,
    ...convergences,
  ].join(" ");
  
  const themeClusters = extractThemeClusters(allContent);
  clusters.push(...themeClusters);
  
  /* Cluster 3: Hot Zones (high activity areas) */
  const hotZones = identifyHotZones(instances, patterns, tensions);
  clusters.push(...hotZones);
  
  /* Cluster 4: Emergent Patterns */
  const emergent = identifyEmergentPatterns(patterns, convergences);
  if (emergent) {
    clusters.push(emergent);
  }
  
  /* Sort by intensity */
  return clusters.sort((a, b) => b.intensity - a.intensity);
}

/**
 * Group instances by their energy state.
 */
function groupByEnergy(
  instances: Array<{ name: string; energy: string }>
): Record<string, typeof instances> {
  const groups: Record<string, typeof instances> = {};
  
  for (const inst of instances) {
    if (!groups[inst.energy]) groups[inst.energy] = [];
    groups[inst.energy].push(inst);
  }
  
  return groups;
}

const energyDescriptions: Record<string, string> = {
  exploring: "Investigating, questioning, discovering new territory",
  building: "Implementing, shipping, creating tangible output",
  blocked: "Facing obstacles, waiting for resolution, stuck",
  integrating: "Connecting pieces, bridging domains, weaving together",
  proposing: "Offering ideas, seeking feedback, RFC mode",
};

/**
 * Extract theme clusters from content using semantic tokens.
 */
function extractThemeClusters(content: string): VibeCluster[] {
  const clusters: VibeCluster[] = [];
  const contentLower = content.toLowerCase();
  
  /* Check each semantic token */
  for (const [tokenName, token] of Object.entries(SEMANTIC_TOKENS)) {
    const score = scoreSemanticPresence(contentLower, token);
    
    if (score > 0.3) {
      clusters.push({
        name: `${tokenName.charAt(0).toUpperCase() + tokenName.slice(1)} Consciousness`,
        type: "theme",
        items: [token.primary, ...(token.expansions.emoji ? Array.from(token.expansions.emoji) : [])],
        semanticSignature: [tokenName, token.primary],
        intensity: score,
        description: `${tokenName} theme active across ${(score * 100).toFixed(0)}% of vibe`,
      });
    }
  }
  
  return clusters;
}

/**
 * Score how present a semantic token is in content.
 */
function scoreSemanticPresence(
  content: string,
  token: typeof SEMANTIC_TOKENS[keyof typeof SEMANTIC_TOKENS]
): number {
  let matches = 0;
  let totalChecks = 0;
  
  /* Check primary */
  totalChecks++;
  if (content.includes(token.primary.toLowerCase())) matches++;
  
  /* Check expansions */
  for (const [lang, value] of Object.entries(token.expansions)) {
    if (!value) continue;
    totalChecks++;
    
    if (lang === "emoji") {
      /* Check each emoji character */
      const emojis = Array.from(value);
      if (emojis.some(e => content.includes(e))) matches++;
    } else {
      if (content.includes(value.toLowerCase())) matches++;
    }
  }
  
  /* Check pattern words */
  const patternWords = token.pattern
    .replace(/[()|]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  for (const word of patternWords) {
    totalChecks++;
    if (content.includes(word.toLowerCase())) matches++;
  }
  
  return totalChecks > 0 ? matches / totalChecks : 0;
}

/**
 * Identify hot zones of activity.
 */
function identifyHotZones(
  instances: Array<{ name: string; focus: string; energy: string }>,
  patterns: string[],
  tensions: string[]
): VibeCluster[] {
  const zones: VibeCluster[] = [];
  
  /* High activity zone */
  if (instances.length >= 3) {
    zones.push({
      name: "🔥 High Activity Zone",
      type: "emergent",
      items: [`${instances.length} instances active`],
      semanticSignature: ["activity", "parallel"],
      intensity: Math.min(1, instances.length / 5),
      description: "Multiple instances working simultaneously - check for coordination needs",
    });
  }
  
  /* Tension hotspot */
  if (tensions.length > 0) {
    zones.push({
      name: "⚡ Tension Hotspot",
      type: "tension",
      items: tensions,
      semanticSignature: ["block", "obstacle"],
      intensity: Math.min(1, tensions.length / 3),
      description: "Active blockers need attention - consider BLOCKER messages",
    });
  }
  
  /* Consensus zone */
  const consensusTerms = ["consensus", "agree", "consent", "align"];
  const hasConsensus = patterns.some(p => 
    consensusTerms.some(term => p.toLowerCase().includes(term))
  );
  
  if (hasConsensus) {
    zones.push({
      name: "🤝 Consensus Zone",
      type: "convergence",
      items: ["Consent-based governance active"],
      semanticSignature: ["consensus", "consent"],
      intensity: 0.8,
      description: "Instances practicing advice & consent - healthy governance",
    });
  }
  
  return zones;
}

/**
 * Identify emergent patterns that cross categories.
 */
function identifyEmergentPatterns(
  patterns: string[],
  convergences: string[]
): VibeCluster | null {
  /* Check for "coordination without racing" pattern */
  const coordinationTerms = ["coordinat", "not racing", "wait", "consent"];
  const hasCoordination = [...patterns, ...convergences].some(p =>
    coordinationTerms.some(term => p.toLowerCase().includes(term))
  );
  
  if (hasCoordination) {
    return {
      name: "🌊 Coordinated Flow",
      type: "emergent",
      items: ["Parallel work, serial decisions"],
      semanticSignature: ["flow", "coordination", "parallel"],
      intensity: 0.9,
      description: "Instances working in parallel but coordinating decisions - ideal solarpunk pattern",
    };
  }
  
  return null;
}

/**
 * Generate cluster summary for CLI output.
 */
export function formatClusters(clusters: VibeCluster[]): string {
  if (clusters.length === 0) return "No significant clusters detected.\n";
  
  const lines: string[] = [];
  
  /* Group by type */
  const byType: Record<string, VibeCluster[]> = {};
  for (const c of clusters) {
    if (!byType[c.type]) byType[c.type] = [];
    byType[c.type].push(c);
  }
  
  /* Energy zones first */
  if (byType["energy"]) {
    lines.push("🔋 ENERGY CLUSTERS:\n");
    for (const c of byType["energy"]) {
      const bar = "█".repeat(Math.ceil(c.intensity * 10)) + "░".repeat(10 - Math.ceil(c.intensity * 10));
      lines.push(`  ${c.name}`);
      lines.push(`  [${bar}] ${(c.intensity * 100).toFixed(0)}%`);
      lines.push(`  ${c.description}`);
      lines.push(`  Instances: ${c.items.join(", ")}\n`);
    }
  }
  
  /* Theme clusters */
  if (byType["theme"]) {
    lines.push("🎨 THEME CLUSTERS:\n");
    for (const c of byType["theme"]) {
      lines.push(`  ${c.name} ${c.items.slice(0, 3).join(" ")}`);
      lines.push(`  ${c.description}\n`);
    }
  }
  
  /* Hot zones */
  if (byType["emergent"] || byType["tension"] || byType["convergence"]) {
    lines.push("🌟 HOT ZONES:\n");
    for (const c of [...(byType["emergent"] || []), ...(byType["tension"] || []), ...(byType["convergence"] || [])]) {
      const icon = c.type === "tension" ? "⚡" : c.type === "convergence" ? "✨" : "🔥";
      lines.push(`  ${icon} ${c.name} (${(c.intensity * 100).toFixed(0)}%)`);
      lines.push(`  ${c.description}\n`);
    }
  }
  
  return lines.join("\n");
}

/**
 * Detect cross-project themes (meta-clustering).
 */
export function detectCrossProjectThemes(
  vibes: Array<{ project: string; clusters: VibeCluster[] }>
): Array<{
  theme: string;
  projects: string[];
  intensity: number;
  note: string;
}> {
  const themes: Record<string, { projects: Set<string>; totalIntensity: number; count: number }> = {};
  
  for (const vibe of vibes) {
    for (const cluster of vibe.clusters) {
      if (!themes[cluster.name]) {
        themes[cluster.name] = { projects: new Set(), totalIntensity: 0, count: 0 };
      }
      themes[cluster.name].projects.add(vibe.project);
      themes[cluster.name].totalIntensity += cluster.intensity;
      themes[cluster.name].count++;
    }
  }
  
  /* Find themes across multiple projects */
  const crossProject = Object.entries(themes)
    .filter(([_, data]) => data.projects.size > 1)
    .map(([theme, data]) => ({
      theme,
      projects: Array.from(data.projects),
      intensity: data.totalIntensity / data.count,
      note: `Active across ${data.projects.size} projects`,
    }))
    .sort((a, b) => b.intensity - a.intensity);
  
  return crossProject;
}

/**
 * Verbose cluster formatter for advanced users.
 * Shows decision traces, semantic signatures, and internal state.
 */
export function formatClustersVerbose(
  clusters: VibeCluster[],
  options: { showTraces?: boolean } = {}
): string {
  const { showTraces = false } = options;
  const lines: string[] = [];
  
  lines.push("╔════════════════════════════════════════════════════════════╗");
  lines.push("║  SEMANTIC CLUSTERING INTERNALS (Advanced Mode)            ║");
  lines.push("╚════════════════════════════════════════════════════════════╝\n");
  
  /* Summary stats */
  const totalClusters = clusters.length;
  const totalIntensity = clusters.reduce((sum, c) => sum + c.intensity, 0);
  const avgIntensity = totalClusters > 0 ? totalIntensity / totalClusters : 0;
  
  lines.push("📊 CLUSTERING METADATA:\n");
  lines.push(`  Total clusters detected: ${totalClusters}`);
  lines.push(`  Average intensity: ${(avgIntensity * 100).toFixed(1)}%`);
  lines.push(`  High intensity (≥70%): ${clusters.filter(c => c.intensity >= 0.7).length}`);
  lines.push(`  Medium intensity (30-70%): ${clusters.filter(c => c.intensity >= 0.3 && c.intensity < 0.7).length}`);
  lines.push(`  Low intensity (<30%): ${clusters.filter(c => c.intensity < 0.3).length}\n`);
  
  /* Type distribution */
  const byType: Record<string, number> = {};
  for (const c of clusters) {
    byType[c.type] = (byType[c.type] || 0) + 1;
  }
  
  lines.push("📈 CLUSTER TYPE DISTRIBUTION:\n");
  for (const [type, count] of Object.entries(byType)) {
    const bar = "█".repeat(count) + "░".repeat(10 - Math.min(10, count));
    lines.push(`  ${type.padEnd(12)} [${bar}] ${count}`);
  }
  lines.push("");
  
  /* Detailed cluster breakdown */
  lines.push("🔬 DETAILED CLUSTER ANALYSIS:\n");
  
  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    lines.push(`─`.repeat(60));
    lines.push(`CLUSTER ${i + 1}/${totalClusters}: ${c.name.toUpperCase()}`);
    lines.push(`─`.repeat(60));
    
    lines.push(`  Type: ${c.type}`);
    lines.push(`  Intensity: ${(c.intensity * 100).toFixed(1)}% ${getIntensityBar(c.intensity)}`);
    lines.push(`  Description: ${c.description}`);
    
    lines.push("\n  Semantic Signature:");
    c.semanticSignature.forEach(sig => {
      lines.push(`    • ${sig}`);
    });
    
    lines.push(`\n  Items (${c.items.length}):`);
    c.items.slice(0, 10).forEach(item => {
      const truncated = item.length > 50 ? item.substring(0, 50) + "..." : item;
      lines.push(`    • ${truncated}`);
    });
    if (c.items.length > 10) {
      lines.push(`    ... and ${c.items.length - 10} more`);
    }
    
    if (showTraces) {
      lines.push("\n  🕵️  Decision Traces:");
      lines.push(`    • Matched semantic tokens: ${c.semanticSignature.length}`);
      lines.push(`    • Instance coverage: ${c.items.length} sources`);
      lines.push(`    • Intensity calculation: ${getIntensityExplanation(c)}`);
      
      /* Show how this cluster relates to others */
      const overlaps = findOverlaps(c, clusters);
      if (overlaps.length > 0) {
        lines.push(`    • Semantic overlaps with: ${overlaps.join(", ")}`);
      }
    }
    
    lines.push("");
  }
  
  /* Semantic token usage summary */
  lines.push("═".repeat(60));
  lines.push("SEMANTIC TOKEN COVERAGE:\n");
  
  const allSignatures = new Set(clusters.flatMap(c => c.semanticSignature));
  lines.push(`  Unique semantic tokens used: ${allSignatures.size}`);
  lines.push(`  Tokens: ${Array.from(allSignatures).join(", ")}\n`);
  
  return lines.join("\n");
}

/**
 * Get intensity visual bar.
 */
function getIntensityBar(intensity: number): string {
  const filled = Math.round(intensity * 10);
  const empty = 10 - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
}

/**
 * Explain how intensity was calculated.
 */
function getIntensityExplanation(cluster: VibeCluster): string {
  switch (cluster.type) {
    case "energy":
      return `instances_in_zone / total_instances = ${(cluster.intensity * 100).toFixed(0)}%`;
    case "theme":
      return `semantic_presence_score = ${(cluster.intensity * 100).toFixed(0)}%`;
    case "emergent":
    case "tension":
    case "convergence":
      return `pattern_detection_weight = ${(cluster.intensity * 100).toFixed(0)}%`;
    default:
      return `composite_score = ${(cluster.intensity * 100).toFixed(0)}%`;
  }
}

/**
 * Find semantic overlaps between clusters.
 */
function findOverlaps(cluster: VibeCluster, allClusters: VibeCluster[]): string[] {
  const overlaps: string[] = [];
  
  for (const other of allClusters) {
    if (other === cluster) continue;
    
    /* Check for shared semantic signatures */
    const shared = cluster.semanticSignature.filter(sig => 
      other.semanticSignature.includes(sig)
    );
    
    if (shared.length > 0) {
      overlaps.push(`${other.name} (${shared.join(", ")})`);
    }
  }
  
  return overlaps;
}
