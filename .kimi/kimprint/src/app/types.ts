/**
 * APP (Action Plan Package) Types
 */

import { z } from "zod";

/**
 * Skill integration points for APP execution.
 */
export const SkillIntegrationSchema = z.object({
  skill: z.string(),
  phase: z.string(),
  purpose: z.string(),
});

export type SkillIntegration = z.infer<typeof SkillIntegrationSchema>;

export const AppPhaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedMinutes: z.number(),
  steps: z.array(z.object({
    description: z.string(),
    completed: z.boolean().default(false),
  })),
  checkpoints: z.array(z.string()),
});

export type AppPhase = z.infer<typeof AppPhaseSchema>;

export const AppPackageSchema = z.object({
  metadata: z.object({
    name: z.string(),
    description: z.string(),
    version: z.string(),
    createdAt: z.date(),
    template: z.string(),
    isMeta: z.boolean().default(false),
  }),
  
  skills: z.array(SkillIntegrationSchema),
  
  execution: z.object({
    phases: z.array(AppPhaseSchema),
  }),
  
  architecture: z.object({
    overview: z.string(),
    patterns: z.array(z.object({
      name: z.string(),
      description: z.string(),
      rationale: z.string(),
    })),
    extensionPoints: z.array(z.string()),
  }),
  
  failureModes: z.object({
    risks: z.array(z.object({
      scenario: z.string(),
      probability: z.enum(["low", "medium", "high"]),
      impact: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    })),
  }),
  
  readme: z.object({
    originStory: z.string(),
    quickStart: z.string(),
    metaNote: z.string().optional(),
  }),
});

export type AppPackage = z.infer<typeof AppPackageSchema>;

export const AppTemplateTypeSchema = z.enum([
  "mcp-server",
  "rust-crate",
  "typescript-package",
  "skill",
  "custom",
]);

export type AppTemplateType = z.infer<typeof AppTemplateTypeSchema>;

export const AppGenerationConfigSchema = z.object({
  projectName: z.string(),
  description: z.string(),
  template: AppTemplateTypeSchema,
  language: z.enum(["typescript", "rust", "python"]),
  skills: z.array(z.string()),
  isMeta: z.boolean().default(false),
});

export type AppGenerationConfig = z.infer<typeof AppGenerationConfigSchema>;
