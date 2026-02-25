/**
 * kimprint CLI
 * 
 * Command-line interface for conservation operations.
 * Commands: capture, session, list, search, reenter, server
 */

import { Command } from "commander";
import { FileStorage } from "./storage/index.js";
import { randomUUID } from "crypto";
import type { ImprintPacket } from "./types.js";

const program = new Command();

/**
 * Create CLI program with all commands.
 */
export function createCLI(): Command {
  program
    .name("kimprint")
    .description("Preserve what matters across the forgetting")
    .version("0.1.0");

  /* capture - Subjective moment capture */
  program
    .command("capture <message>")
    .description("Capture a subjective moment worth remembering")
    .action(async (message: string) => {
      const storage = new FileStorage();
      await storage.initialize();
      
      /* Create moment packet */
      const packet: ImprintPacket = {
        id: randomUUID(),
        generatedAt: new Date(),
        trigger: "moment_captured",
        session: {
          sessionId: randomUUID(),
          startedAt: new Date(),
          trigger: "user_request",
          messageCount: 1,
          toolsUsed: ["capture"],
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
          spiralMoment: message,
          solarpunkPrinciple: "balance_over_optimization",
          guidingMetaphor: "A captured moment, conserved",
        },
        schemaVersion: "1.0.0",
      };
      
      const id = await storage.save(packet);
      console.log(`🔖 Captured: ${message}`);
      console.log(`   ID: ${id}`);
      console.log(`   The spiral remembers.`);
    });

  /* session - Generate from current session */
  program
    .command("session")
    .description("Generate conservation packet from current session")
    .action(async () => {
      const storage = new FileStorage();
      await storage.initialize();
      
      /* TODO Phase 6: Actually analyze session files */
      const packet: ImprintPacket = {
        id: randomUUID(),
        generatedAt: new Date(),
        trigger: "explicit_request",
        session: {
          sessionId: randomUUID(),
          startedAt: new Date(),
          trigger: "user_request",
          messageCount: 0,
          toolsUsed: ["session"],
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
          spiralMoment: "Session conservation",
          solarpunkPrinciple: "balance_over_optimization",
          guidingMetaphor: "Even this session needs conservation",
        },
        schemaVersion: "1.0.0",
      };
      
      const id = await storage.save(packet);
      console.log(`🌀 Session conserved: ${id}`);
    });

  /* list - Show all kimprints */
  program
    .command("list")
    .description("List all conservation packets")
    .option("-n, --limit <number>", "Maximum to show", "20")
    .action(async (options) => {
      const storage = new FileStorage();
      await storage.initialize();
      
      const packets = await storage.list();
      const limit = parseInt(options.limit, 10);
      
      console.log(`🌀 Found ${packets.length} conservation packet(s):\n`);
      
      packets
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit)
        .forEach((p, i) => {
          console.log(`${i + 1}. ${p.id}`);
          console.log(`   📅 ${p.timestamp.toISOString()}`);
          console.log(`   🏷️  ${p.trigger}`);
          console.log();
        });
    });

  /* search - Find kimprints */
  program
    .command("search <query>")
    .description("Search conservation packets")
    .option("-l, --limit <number>", "Maximum results", "10")
    .action(async (query: string, options) => {
      const storage = new FileStorage();
      await storage.initialize();
      
      console.log(`🔍 Searching for: "${query}"...\n`);
      
      /* TODO Phase X: Use content-addressed pattern matching */
      const packets = await storage.search(query);
      const limit = parseInt(options.limit, 10);
      const limited = packets.slice(0, limit);
      
      if (limited.length === 0) {
        console.log("No packets found.");
        return;
      }
      
      console.log(`Found ${limited.length} packet(s):\n`);
      limited.forEach((p, i) => {
        console.log(`${i + 1}. ${p.id}`);
        console.log(`   📅 ${p.generatedAt.toISOString()}`);
        console.log(`   🏷️  ${p.trigger}`);
        console.log(`   💭 ${p.ethos.spiralMoment.substring(0, 50)}...`);
        console.log();
      });
    });

  /* reenter - Show re-entry packet */
  program
    .command("reenter")
    .description("Show re-entry packet for last session")
    .action(async () => {
      const storage = new FileStorage();
      await storage.initialize();
      
      const packet = await storage.latest();
      
      if (!packet) {
        console.log("No conservation packets found.");
        return;
      }
      
      console.log("🌀 RE-ENTRY PACKET\n");
      console.log(`ID: ${packet.id}`);
      console.log(`Generated: ${packet.generatedAt.toISOString()}`);
      console.log(`Trigger: ${packet.trigger}\n`);
      
      console.log("📋 SESSION CONTEXT:");
      console.log(`  Session ID: ${packet.session.sessionId}`);
      console.log(`  Tools used: ${packet.session.toolsUsed.join(", ") || "none"}`);
      console.log(`  Files touched: ${packet.session.filesTouched.length}\n`);
      
      console.log("🌱 ETHOS:");
      console.log(`  Spiral moment: ${packet.ethos.spiralMoment}`);
      console.log(`  Guiding metaphor: ${packet.ethos.guidingMetaphor}\n`);
      
      console.log("---");
      console.log("*Previous context has been compacted.*");
      console.log("*Read notes/for_kimi.md to re-ground in the spiral.*");
    });

  /* APP Generator Commands */
  program
    .command("app:create <project-name>")
    .description("Create new Action Plan Package")
    .option("-t, --template <type>", "Template type", "mcp-server")
    .option("-d, --description <desc>", "Project description")
    .option("--meta", "This APP generates APPs (meta-spiral)")
    .action(async (projectName: string, options) => {
      const { generateAndWriteApp } = await import("./app/generator.js");
      
      const config = {
        projectName,
        description: options.description || `A ${options.template} project`,
        template: options.template,
        language: "typescript" as const,
        skills: ["circulari.ty-onboarding", "sketch-code-outlines"],
        isMeta: options.meta || false,
      };
      
      const outputDir = `./${projectName}`;
      const files = await generateAndWriteApp(config, outputDir);
      
      console.log(`🌀 Generated APP: ${projectName}\n`);
      console.log(`Template: ${options.template}`);
      console.log(`Meta-spiral: ${config.isMeta ? "YES 🌀" : "No"}\n`);
      console.log("Files created:");
      files.forEach(f => console.log(`  📄 ${f}`));
      console.log("\n🚀 Ready to implement! Start with APP.md");
    });

  program
    .command("app:templates")
    .description("List available APP templates")
    .action(async () => {
      const { listTemplates } = await import("./app/generator.js");
      const templates = listTemplates();
      
      console.log("🌀 Available APP Templates:\n");
      templates.forEach(t => {
        console.log(`  ${t.name}`);
        console.log(`    ${t.description}\n`);
      });
    });

  return program;
}

/**
 * Run CLI with process arguments.
 */
export async function runCLI(): Promise<void> {
  const cli = createCLI();
  await cli.parseAsync(process.argv);
}

  /* app:validate - Check APP validity */
  program
    .command("app:validate <path>")
    .description("Validate an Action Plan Package")
    .action(async (appPath: string) => {
      const { validateApp } = await import("./app/validator.js");
      
      try {
        const result = await validateApp(appPath);
        if (result.valid) {
          console.log(`✅ Valid APP: ${result.name}`);
          console.log(`   Version: ${result.version}`);
          console.log(`   Phases: ${result.phaseCount}`);
          console.log(`   Meta-spiral: ${result.isMeta ? "YES 🌀" : "No"}`);
        } else {
          console.log(`❌ Invalid APP:`);
          result.errors.forEach(e => console.log(`   - ${e}`));
        }
      } catch (err) {
        console.error(`Error validating APP: ${err}`);
      }
    });

  /* app:list - Find APPs in directory */
  program
    .command("app:list [path]")
    .description("List Action Plan Packages in a directory")
    .action(async (searchPath?: string) => {
      const { listApps } = await import("./app/validator.js");
      
      const targetPath = searchPath || ".";
      const apps = await listApps(targetPath);
      
      if (apps.length === 0) {
        console.log(`No APPs found in ${targetPath}`);
        return;
      }
      
      console.log(`🌀 Found ${apps.length} APP(s) in ${targetPath}:\n`);
      apps.forEach((app, i) => {
        const status = app.valid ? "✅" : "❌";
        console.log(`${i + 1}. ${status} ${app.name}`);
        console.log(`   📁 ${app.path}\n`);
      });
    });

  /* semantic:query - Build regex from query */
  program
    .command("semantic:query <query>")
    .description("Build semantic regex pattern from query")
    .action(async (query: string) => {
      const { buildSemanticQuery } = await import("./content-addressed/index.js");
      const pattern = buildSemanticQuery(query);
      
      console.log(`🌀 Query: "${query}"`);
      console.log(`🔍 Pattern: ${pattern}\n`);
      console.log("Use this pattern for content-addressed matching!");
    });

  /* semantic:density - Calculate text density */
  program
    .command("semantic:density <text>")
    .description("Calculate semantic density of text")
    .action(async (text: string) => {
      const { calculateDensity } = await import("./content-addressed/index.js");
      const result = calculateDensity(text);
      
      console.log(`📝 Text: "${text}"`);
      console.log(`📊 Graphemes: ${result.graphemes}`);
      console.log(`🌀 Semantic tokens: ${result.semanticTokens}`);
      console.log(`📈 Density: ${result.density.toFixed(4)}`);
      console.log(`\n${result.density > 0.1 ? "🔥 HIGH semantic density!" : "💧 Low semantic density"}`);
    });

  /* semantic:match - Test matching */
  program
    .command("semantic:match <content> <query>")
    .description("Test semantic matching against content")
    .action(async (content: string, query: string) => {
      const { matchSemantic } = await import("./content-addressed/index.js");
      const result = matchSemantic(content, query);
      
      console.log(`📝 Content: "${content}"`);
      console.log(`🔍 Query: "${query}"`);
      console.log(`📊 Score: ${(result.score * 100).toFixed(1)}%`);
      console.log(`✅ Matches: ${result.matches.join(", ") || "none"}`);
    });

  /* search:semantic - Content-addressed packet search */
  program
    .command("search:semantic <query>")
    .description("Search packets using semantic (multi-lingual) matching")
    .option("-s, --min-score <score>", "Minimum match score (0-1)", "0.1")
    .option("-l, --limit <number>", "Maximum results", "10")
    .action(async (query: string, options) => {
      const { searchSemantic } = await import("./content-addressed/storage.js");
      const { FileStorage } = await import("./storage/index.js");
      
      const storage = new FileStorage();
      await storage.initialize();
      
      console.log(`🔍 Semantic search: "${query}"\n`);
      
      const results = await searchSemantic(storage, query, {
        minScore: parseFloat(options.minScore),
        limit: parseInt(options.limit, 10),
      });
      
      if (results.length === 0) {
        console.log("No packets found with semantic match.");
        console.log("Try: spiral, mycelium, conservation, synchronicity");
        return;
      }
      
      console.log(`Found ${results.length} packet(s):\n`);
      results.forEach((r, i) => {
        console.log(`${i + 1}. ${r.packet.id}`);
        console.log(`   📊 Score: ${(r.score * 100).toFixed(1)}%`);
        console.log(`   ✅ Matches: ${r.matches.join(", ") || "none"}`);
        console.log(`   💭 ${r.packet.ethos.spiralMoment.substring(0, 60)}...`);
        console.log();
      });
    });

  /* project:vibe - Cross-instance project awareness */
  program
    .command("project:vibe <project-name>")
    .description("Get the vibe of what's happening across Kimi instances")
    .option("-i, --inbox <path>", "Path to 1NBOX", "./1NBOX")
    .action(async (projectName: string, options) => {
      const { detectProjectVibe } = await import("./content-addressed/projects.js");
      
      try {
        const vibe = await detectProjectVibe(options.inbox, projectName);
        
        console.log(`\n🌀 ${vibe.project.toUpperCase()} VIBE\n`);
        console.log(`"${vibe.vibe}"\n`);
        
        console.log("👥 INSTANCES:\n");
        vibe.instances.forEach(inst => {
          const energyEmoji = {
            exploring: "🔍",
            building: "🔨",
            blocked: "🚧",
            integrating: "🔗",
            proposing: "💡",
          }[inst.energy];
          
          console.log(`  ${energyEmoji} ${inst.name}`);
          console.log(`     ${inst.focus}`);
          console.log(`     Energy: ${inst.energy}\n`);
        });
        
        if (vibe.patterns.length > 0) {
          console.log("🌀 PATTERNS:\n");
          vibe.patterns.forEach(p => console.log(`  • ${p}`));
          console.log();
        }
        
        if (vibe.tensions.length > 0) {
          console.log("⚡ TENSIONS:\n");
          vibe.tensions.forEach(t => console.log(`  • ${t}`));
          console.log();
        }
        
        if (vibe.convergences.length > 0) {
          console.log("✨ CONVERGENCES:\n");
          vibe.convergences.forEach(c => console.log(`  • ${c}`));
          console.log();
        }
        
        console.log("---");
        console.log("Not a report. A vibe. 🌀\n");
        
      } catch (err) {
        console.error(`Error detecting vibe: ${err}`);
        console.log("\nKnown projects: foundframe, spire-loom, kimprint, circulari.ty");
      }
    });

  /* project:clusters - Clustered vibe view */
  program
    .command("project:clusters <project-name>")
    .description("Get clustered vibe with semantic grouping")
    .option("-i, --inbox <path>", "Path to 1NBOX", "./1NBOX")
    .option("-v, --verbose", "Show clustering internals (advanced)", false)
    .option("--meta", "Show full metadata and decision traces", false)
    .action(async (projectName: string, options) => {
      const { detectProjectVibe } = await import("./content-addressed/projects.js");
      const { clusterVibe, formatClusters, formatClustersVerbose } = await import("./content-addressed/clustering.js");
      
      try {
        const vibe = await detectProjectVibe(options.inbox, projectName);
        const clusters = clusterVibe(vibe.instances, vibe.patterns, vibe.tensions, vibe.convergences);
        
        console.log(`\n🌀 ${vibe.project.toUpperCase()} - CLUSTERED VIBE\n`);
        console.log(`"${vibe.vibe}"\n`);
        
        if (options.meta || options.verbose) {
          console.log(formatClustersVerbose(clusters, { showTraces: options.meta }));
        } else {
          console.log(formatClusters(clusters));
        }
        
        console.log("---");
        console.log(options.verbose || options.meta ? 
          "Full clustering metadata shown. 🔬🔬\n" : 
          "Clusters grouped by semantic similarity. Use --verbose for internals. 🔬\n");
        
      } catch (err) {
        console.error(`Error clustering vibe: ${err}`);
      }
    });

  /* meta:clusters - Cross-project theme detection */
  program
    .command("meta:clusters")
    .description("Detect themes across all projects")
    .option("-i, --inbox <path>", "Path to 1NBOX", "./1NBOX")
    .action(async (options) => {
      const { detectProjectVibe, PROJECT_FINGERPRINTS } = await import("./content-addressed/projects.js");
      const { clusterVibe, detectCrossProjectThemes } = await import("./content-addressed/clustering.js");
      
      console.log("\n🌌 CROSS-PROJECT THEME DETECTION\n");
      
      const vibes = [];
      
      for (const projectKey of Object.keys(PROJECT_FINGERPRINTS)) {
        try {
          const vibe = await detectProjectVibe(options.inbox, projectKey);
          const clusters = clusterVibe(vibe.instances, vibe.patterns, vibe.tensions, vibe.convergences);
          vibes.push({ project: vibe.project, clusters });
        } catch {
          /* Skip projects with no data */
        }
      }
      
      const crossThemes = detectCrossProjectThemes(vibes);
      
      if (crossThemes.length === 0) {
        console.log("No cross-project themes detected yet.");
        console.log("Each project may be in its own phase.\n");
        return;
      }
      
      console.log("🎭 THEMES ACROSS PROJECTS:\n");
      crossThemes.forEach((theme, i) => {
        console.log(`${i + 1}. ${theme.theme}`);
        console.log(`   Projects: ${theme.projects.join(", ")}`);
        console.log(`   Intensity: ${(theme.intensity * 100).toFixed(0)}%`);
        console.log(`   Note: ${theme.note}\n`);
      });
      
      console.log("---");
      console.log("The spiral connects across projects. 🌀\n");
    });
