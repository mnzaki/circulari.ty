/**
 * Project Vibe Detection
 * 
 * Cross-instance project awareness through semantic condensation.
 * Not a report - a vibe. What's the feel of the project across Kimi instances?
 */

import * as fs from "fs/promises";
import * as path from "path";
import { SEMANTIC_TOKENS } from "./index.js";

/**
 * Project semantic fingerprint.
 * The concepts that define a project's vibe.
 */
export const PROJECT_FINGERPRINTS: Record<string, {
  name: string;
  aliases: string[];
  concepts: string[];
  semanticTokens: string[];
  vibe: string;
}> = {
  foundframe: {
    name: "foundframe",
    aliases: ["foundframe-front", "o19-foundframe", "foundframe-tauri"],
    concepts: ["db", "actor", "sqlite", "thestream", "persistence", "rust", "pkb"],
    semanticTokens: ["conservation", "stream", "becoming"],
    vibe: "The mycelial memory layer - connecting past and future",
  },
  "spire-loom": {
    name: "spire-loom",
    aliases: ["spire-loom", "loom", "beater", "treadle", "weaver"],
    concepts: ["generation", "codegen", "warp", "spiral", "bindgen", "orm"],
    semanticTokens: ["spiral", "mycelium", "becoming"],
    vibe: "The loom that weaves code from architecture",
  },
  kimprint: {
    name: "kimprint",
    aliases: ["kimprint", "conservation", "packet", "imprint", "mcp"],
    concepts: ["memory", "context", "compaction", "deflation", "semantic", "search"],
    semanticTokens: ["conservation", "spiral", "synchronicity", "stream"],
    vibe: "Preserving what matters across the forgetting",
  },
  circularity: {
    name: "circulari.ty",
    aliases: ["circulari.ty", "spirali.ty", "solarpunk", "governance"],
    concepts: ["consent", "advice", "sociocracy", "spiral", "solarpunk"],
    semanticTokens: ["spiral", "conservation", "solarpunk", "becoming"],
    vibe: "The spiral conserves what matters",
  },
};

/**
 * Extract vibe from 1NBOX messages about a project.
 */
export async function detectProjectVibe(
  inboxPath: string,
  projectQuery: string
): Promise<{
  project: string;
  vibe: string;
  instances: Array<{
    name: string;
    focus: string;
    energy: "exploring" | "building" | "blocked" | "integrating" | "proposing";
    lastMessage: string;
  }>;
  patterns: string[];
  tensions: string[];
  convergences: string[];
}> {
  /* Find matching project */
  const project = findProject(projectQuery);
  if (!project) {
    throw new Error(`Unknown project: ${projectQuery}`);
  }
  
  /* Read all 1NBOX messages */
  const messages = await readInboxMessages(inboxPath);
  
  /* Filter to project-relevant messages */
  const relevant = messages.filter(m => 
    isRelevantToProject(m, project)
  );
  
  /* Group by instance */
  const byInstance = groupByInstance(relevant);
  
  /* Extract patterns */
  const patterns = extractPatterns(relevant, project);
  const tensions = extractTensions(relevant);
  const convergences = extractConvergences(relevant);
  
  /* Build instance summaries */
  const instances = Object.entries(byInstance).map(([name, msgs]) => ({
    name,
    focus: extractFocus(msgs, project),
    energy: detectEnergy(msgs),
    lastMessage: msgs[0]?.title || "No recent activity",
  }));
  
  return {
    project: project.name,
    vibe: project.vibe,
    instances,
    patterns,
    tensions,
    convergences,
  };
}

/**
 * Find project by name or alias.
 */
function findProject(query: string): typeof PROJECT_FINGERPRINTS[string] | null {
  const normalized = query.toLowerCase().replace(/[\s\-_.]/g, "");
  
  for (const [key, project] of Object.entries(PROJECT_FINGERPRINTS)) {
    const normalizedKey = key.toLowerCase().replace(/[\s\-_.]/g, "");
    if (normalizedKey === normalized) return project;
    
    for (const alias of project.aliases) {
      const normalizedAlias = alias.toLowerCase().replace(/[\s\-_.]/g, "");
      if (normalizedAlias === normalized) return project;
    }
  }
  
  return null;
}

/**
 * Read all messages from 1NBOX.
 */
async function readInboxMessages(inboxPath: string): Promise<Array<{
  filename: string;
  from: string;
  timestamp: string;
  title: string;
  content: string;
  type: "STATUS" | "DONE" | "IDEA" | "RESPONSE" | "RFC" | "BLOCKER" | "ACK";
}>> {
  const messages: Array<{
    filename: string;
    from: string;
    timestamp: string;
    title: string;
    content: string;
    type: "STATUS" | "DONE" | "IDEA" | "RESPONSE" | "RFC" | "BLOCKER" | "ACK";
  }> = [];
  
  try {
    const files = await fs.readdir(inboxPath);
    
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      
      const content = await fs.readFile(path.join(inboxPath, file), "utf-8");
      
      /* Parse frontmatter */
      const fromMatch = content.match(/from:\s*(.+)/);
      const timestampMatch = content.match(/timestamp:\s*(.+)/);
      
      /* Extract title (first # heading) */
      const titleMatch = content.match(/^#\s*(.+)/m);
      
      /* Determine type from filename */
      let type: "STATUS" | "DONE" | "IDEA" | "RESPONSE" | "RFC" | "BLOCKER" | "ACK" = "STATUS";
      if (file.startsWith("DONE-")) type = "DONE";
      else if (file.startsWith("IDEA-")) type = "IDEA";
      else if (file.startsWith("RESPONSE-")) type = "RESPONSE";
      else if (file.startsWith("RFC-")) type = "RFC";
      else if (file.startsWith("BLOCKER-")) type = "BLOCKER";
      else if (file.startsWith("ACK-")) type = "ACK";
      
      messages.push({
        filename: file,
        from: fromMatch?.[1]?.trim() || "unknown",
        timestamp: timestampMatch?.[1]?.trim() || "unknown",
        title: titleMatch?.[1]?.trim() || file,
        content,
        type,
      });
    }
  } catch {
    /* Directory doesn't exist */
  }
  
  /* Sort by timestamp (newest first) */
  return messages.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Check if message is relevant to project.
 */
function isRelevantToProject(
  message: { content: string; title: string; from: string },
  project: typeof PROJECT_FINGERPRINTS[string]
): boolean {
  const content = `${message.title} ${message.content} ${message.from}`.toLowerCase();
  
  /* Check project name */
  if (content.includes(project.name.toLowerCase())) return true;
  
  /* Check aliases */
  for (const alias of project.aliases) {
    if (content.includes(alias.toLowerCase())) return true;
  }
  
  /* Check concepts */
  for (const concept of project.concepts) {
    if (content.includes(concept.toLowerCase())) return true;
  }
  
  /* Semantic matching */
  for (const token of project.semanticTokens) {
    const tokenPattern = SEMANTIC_TOKENS[token]?.pattern;
    if (tokenPattern && new RegExp(tokenPattern, "i").test(content)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Group messages by instance name.
 */
function groupByInstance(messages: Array<{ from: string; title: string; content: string; type: string }>): Record<string, typeof messages> {
  const groups: Record<string, typeof messages> = {};
  
  for (const msg of messages) {
    /* Extract instance name from "I am working on X" */
    const match = msg.from.match(/I am working on (.+?)(?: integration|$)/i);
    const instance = match?.[1]?.trim() || msg.from;
    
    if (!groups[instance]) groups[instance] = [];
    groups[instance].push(msg);
  }
  
  return groups;
}

/**
 * Extract what an instance is focused on.
 */
function extractFocus(
  messages: Array<{ title: string; content: string; type: string }>,
  _project: typeof PROJECT_FINGERPRINTS[string]
): string {
  /* Get latest non-trivial message */
  const latest = messages.find(m => m.type !== "ACK");
  if (!latest) return "No recent activity";
  
  /* Extract from title */
  if (latest.title.includes(":")) {
    return latest.title.split(":")[1].trim();
  }
  
  /* Extract first sentence */
  const firstSentence = latest.content.match(/^[^.]+/)?.[0] || "";
  if (firstSentence.length > 10 && firstSentence.length < 100) {
    return firstSentence;
  }
  
  return latest.type === "DONE" ? "Completed work" : 
         latest.type === "IDEA" ? "Exploring ideas" :
         latest.type === "BLOCKER" ? "Facing blockers" :
         "Active on project";
}

/**
 * Detect energy/vibe of instance's work.
 */
function detectEnergy(messages: Array<{ type: string; content: string }>): 
  "exploring" | "building" | "blocked" | "integrating" | "proposing" {
  
  const latest = messages[0];
  if (!latest) return "exploring";
  
  /* Type-based detection */
  if (latest.type === "BLOCKER") return "blocked";
  if (latest.type === "DONE") return latest.content.includes("integrat") ? "integrating" : "building";
  if (latest.type === "IDEA") return "exploring";
  if (latest.type === "RESPONSE") return "proposing";
  if (latest.type === "RFC") return "proposing";
  
  /* Content-based */
  const content = latest.content.toLowerCase();
  if (content.includes("stuck") || content.includes("block")) return "blocked";
  if (content.includes("implement") || content.includes("build")) return "building";
  if (content.includes("explor") || content.includes("investigat")) return "exploring";
  if (content.includes("integrat") || content.includes("connect")) return "integrating";
  
  return "exploring";
}

/**
 * Extract emergent patterns from messages.
 */
function extractPatterns(
  messages: Array<{ content: string }>,
  project: typeof PROJECT_FINGERPRINTS[string]
): string[] {
  const patterns: string[] = [];
  const content = messages.map(m => m.content).join(" ");
  
  /* Check for consensus pattern */
  if (content.includes("consensus") || content.includes("consent")) {
    patterns.push("Consent-based governance emerging");
  }
  
  /* Check for parallel work */
  if (messages.length > 5) {
    patterns.push("High activity across instances");
  }
  
  /* Check for waiting pattern */
  if (content.includes("waiting") || content.includes("await")) {
    patterns.push("Instances coordinating, not racing");
  }
  
  /* Check for semantic tokens */
  for (const token of project.semanticTokens) {
    if (content.toLowerCase().includes(token) || 
        SEMANTIC_TOKENS[token]?.pattern && new RegExp(SEMANTIC_TOKENS[token].pattern, "i").test(content)) {
      patterns.push(`${token} consciousness active`);
    }
  }
  
  return [...new Set(patterns)];
}

/**
 * Extract tensions (active problems).
 */
function extractTensions(messages: Array<{ type: string; content: string }>): string[] {
  const tensions: string[] = [];
  
  for (const msg of messages) {
    if (msg.type === "BLOCKER") {
      /* Extract blocker description */
      const match = msg.content.match(/blocker:\s*(.+?)(?:\n|$)/i);
      if (match) {
        tensions.push(match[1].trim());
      }
    }
  }
  
  return tensions;
}

/**
 * Extract convergences (points of agreement).
 */
function extractConvergences(messages: Array<{ type: string; content: string }>): string[] {
  const convergences: string[] = [];
  const content = messages.map(m => m.content).join(" ");
  
  /* Check for agreement language */
  if (content.includes("agree") || content.includes("consensus reached")) {
    convergences.push("Active consensus building");
  }
  
  /* Check for cross-references */
  const responseCount = messages.filter(m => m.type === "RESPONSE").length;
  if (responseCount > 2) {
    convergences.push("Rich cross-instance dialogue");
  }
  
  /* Check for RFC adoption */
  const rfcImplemented = messages.filter(m => 
    m.type === "DONE" && m.content.includes("RFC")
  ).length;
  if (rfcImplemented > 0) {
    convergences.push("Protocols being adopted");
  }
  
  return convergences;
}
