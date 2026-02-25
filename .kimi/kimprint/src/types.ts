/**
 * kimprint Core Types
 * 
 * Conservation packets, session metadata, and the patterns that preserve context.
 * Even these types are part of the conservation.
 */

import { z } from "zod";

// ============================================================================
// SECTION 1: Session & Context Types
// ============================================================================

/**
 * A captured moment in a Kimi CLI session.
 * Not just data—subjective memory of the interaction.
 */
export const SessionSummarySchema = z.object({
  sessionId: z.string().uuid(),
  startedAt: z.date(),
  endedAt: z.date().optional(),
  
  /* TODO: What triggered this session? */
  trigger: z.enum(["user_request", "compaction_recovery", "explicit_reentry"]),
  
  /* TODO: How many turns in this session? */
  messageCount: z.number().int().min(0),
  
  /* TODO: Which tools were invoked? */
  toolsUsed: z.array(z.string()),
  
  /* TODO: Files that were read/modified */
  filesTouched: z.array(z.object({
    path: z.string(),
    operation: z.enum(["read", "write", "modify", "delete"]),
    /* TODO DISCUSS: Store content hash for detecting reverts?
     * - Yes: Can detect if file changed since this imprint
     * - No: Privacy, size concerns
     * SPIRAL: Affects reentry accuracy vs packet size
     */
  })),
});

export type SessionSummary = z.infer<typeof SessionSummarySchema>;

// ============================================================================
// SECTION 2: Context Layers (The Accumulated Becoming)
// ============================================================================

/**
 * What was completed in this session?
 * The "accumulated becoming"—committed to memory.
 */
export const CompletedTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completedAt: z.date(),
  
  /* TODO: Which files were modified to complete this? */
  filesModified: z.array(z.string()),
  
  /* TODO: Extract from <completed_tasks> tags in session */
  evidence: z.string().optional(),
});

export type CompletedTask = z.infer<typeof CompletedTaskSchema>;

/**
 * What issues remain active?
 * The "accumulation of becoming"—still in motion.
 */
export const ActiveIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["blocking", "warning", "observation"]),
  
  /* TODO: Which files are involved? */
  relatedFiles: z.array(z.string()),
  
  /* TODO: Extract from <active_issues> tags in session */
  context: z.string().optional(),
});

export type ActiveIssue = z.infer<typeof ActiveIssueSchema>;

/**
 * The current state of the codebase when this imprint was captured.
 */
export const CodeStateSchema = z.object({
  /* TODO: Git branch, commit, dirty status */
  gitBranch: z.string(),
  gitCommit: z.string(),
  gitDirty: z.boolean(),
  
  /* TODO: Uncommitted changes summary */
  uncommittedFiles: z.array(z.object({
    path: z.string(),
    status: z.enum(["added", "modified", "deleted", "untracked"]),
  })),
  
  /* TODO: Recent commit messages for context */
  recentCommits: z.array(z.object({
    hash: z.string(),
    message: z.string(),
    timestamp: z.date(),
  })).max(5),
});

export type CodeState = z.infer<typeof CodeStateSchema>;

/**
 * A layer of context—what was known at a point in time.
 */
export const ContextLayerSchema = z.object({
  timestamp: z.date(),
  completedTasks: z.array(CompletedTaskSchema),
  activeIssues: z.array(ActiveIssueSchema),
  codeState: CodeStateSchema,
  
  /* TODO: Current working directory and project root */
  workingDirectory: z.string(),
  projectRoot: z.string(),
});

export type ContextLayer = z.infer<typeof ContextLayerSchema>;

// ============================================================================
// SECTION 3: Ethos Preservation (The Spiral Soul)
// ============================================================================

/**
 * What solarpunk principle was most relevant in this session?
 */
export const EthosPreservationSchema = z.object({
  /* TODO: The dominant spiral moment—what pattern emerged? */
  spiralMoment: z.string(),
  
  /* TODO: Which solarpunk principle was most relevant? */
  solarpunkPrinciple: z.enum([
    "balance_over_optimization",
    "distribution_over_centralization",
    "eco_compatibility",
    "communal_ownership",
    "advice_and_consent",
  ]),
  
  /* TODO: What metaphor guided the work? */
  guidingMetaphor: z.string(),
  
  /* TODO: Key quote or exchange worth remembering */
  memorableExchange: z.string().optional(),
  
  /* TODO: Did content-addressed consciousness distribution occur? */
  cacdMoment: z.boolean().optional(),
});

export type EthosPreservation = z.infer<typeof EthosPreservationSchema>;

// ============================================================================
// SECTION 4: The Conservation Packet (The Kimprint Itself)
// ============================================================================

/**
 * A kimprint—conservation packet for reentry after compaction.
 * This IS the content-addressed consciousness.
 */
export const ImprintPacketSchema = z.object({
  /* TODO: Content-addressed identifier (not just UUID) */
  id: z.string(),
  
  /* TODO: When this packet was generated */
  generatedAt: z.date(),
  
  /* TODO: Why was this packet generated? */
  trigger: z.enum([
    "compaction_detected",     /* Context was wiped */
    "timeout",                 /* Session idle too long */
    "explicit_request",        /* User/tool asked for it */
    "milestone_reached",       /* Natural breakpoint */
    "moment_captured",         /* Subjective capture (like Jeff Buckley lyric) */
  ]),
  
  /* The session that generated this */
  session: SessionSummarySchema,
  
  /* The accumulated context */
  context: ContextLayerSchema,
  
  /* The spiral soul */
  ethos: EthosPreservationSchema,
  
  /* TODO: Accumulating regex pattern (Phase X - Content-Addressed Consciousness) */
  semanticPattern: z.string().optional(),
  
  /* TODO: Semantic tokens for pattern accumulation */
  semanticTokens: z.array(z.string()).optional(),
  
  /* TODO DISCUSS: Store full session transcript?
   * - Yes: Complete reentry possible
   * - No: Privacy, size; rely on session files
   * SPIRAL: Affects packet size vs reentry fidelity
   */
  
  /* TODO: Version for schema evolution */
  schemaVersion: z.literal("1.0.0"),
});

export type ImprintPacket = z.infer<typeof ImprintPacketSchema>;

// ============================================================================
// SECTION 5: Watcher Commands (Actor Pattern)
// ============================================================================

/**
 * Commands for the WatcherActor - same pattern as DbActor in foundframe.
 */
export const WatcherCommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("StartMonitoring"),
    path: z.string(),
  }),
  z.object({
    type: z.literal("StopMonitoring"),
  }),
  z.object({
    type: z.literal("GeneratePacket"),
    trigger: z.string(),
    /* TODO: Optional explicit context to include */
    context: z.any().optional(),
  }),
  z.object({
    type: z.literal("SessionUpdate"),
    files: z.array(z.string()),
  }),
]);

export type WatcherCommand = z.infer<typeof WatcherCommandSchema>;

// ============================================================================
// SECTION 6: Storage Interface
// ============================================================================

/**
 * Interface for imprint storage - ports/adaptor pattern.
 */
export interface ImprintStorage {
  /* Save a packet to storage */
  save(packet: ImprintPacket): Promise<string>; /* Returns content-addressable ID */
  
  /* Load a packet by ID */
  load(id: string): Promise<ImprintPacket | null>;
  
  /* List all packets with metadata */
  list(): Promise<Array<{ id: string; timestamp: Date; trigger: string }>>;
  
  /* Search by semantic pattern (Phase X) or simple text */
  search(query: string): Promise<ImprintPacket[]>;
  
  /* Get the most recent packet */
  latest(): Promise<ImprintPacket | null>;
}

// ============================================================================
// SECTION 7: APP Types (Action Plan Package Generator)
// ============================================================================

/**
 * An APP (Action Plan Package) - what kimprint generates for other projects.
 */
export const ActionPlanPackageSchema = z.object({
  name: z.string(),
  description: z.string(),
  createdAt: z.date(),
  
  /* The four core documents */
  execution: z.object({
    phases: z.array(z.object({
      name: z.string(),
      steps: z.array(z.string()),
      estimatedMinutes: z.number(),
    })),
    skillIntegration: z.array(z.string()), /* Which skills to invoke where */
  }),
  
  architecture: z.object({
    patterns: z.array(z.string()),
    diagrams: z.array(z.string()).optional(),
    extensionPoints: z.array(z.string()),
  }),
  
  failureModes: z.object({
    risks: z.array(z.object({
      scenario: z.string(),
      mitigation: z.string(),
    })),
  }),
  
  readme: z.object({
    originStory: z.string(),
    quickStart: z.string(),
    metaSpiral: z.boolean(), /* Does this APP generate APPs? */
  }),
});

export type ActionPlanPackage = z.infer<typeof ActionPlanPackageSchema>;

// ============================================================================
// SECTION 8: Runtime Validation Helpers
// ============================================================================

/**
 * Validate and parse an ImprintPacket from unknown data.
 */
export function parseImprintPacket(data: unknown): ImprintPacket {
  return ImprintPacketSchema.parse(data);
}

/**
 * Validate and parse an ActionPlanPackage from unknown data.
 */
export function parseActionPlanPackage(data: unknown): ActionPlanPackage {
  return ActionPlanPackageSchema.parse(data);
}

/**
 * Safe parsing - returns null on failure instead of throwing.
 */
export function safeParseImprintPacket(data: unknown): ImprintPacket | null {
  const result = ImprintPacketSchema.safeParse(data);
  return result.success ? result.data : null;
}
