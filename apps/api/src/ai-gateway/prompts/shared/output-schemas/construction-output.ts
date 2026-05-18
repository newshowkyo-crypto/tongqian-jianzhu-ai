import { RequiredElementsSchema } from '@tongqian/types';
import { z } from 'zod';

export const ConstructionPromptInputSchema = z.object({
  companyProfile: z.string().min(1).max(8000).optional(),
  context: z.string().min(1).max(12000).optional(),
  documentText: z.string().min(1).max(50000).optional(),
  projectInfo: z.string().min(1).max(12000).optional(),
  request: z.string().min(1).max(8000),
  role: z.enum(['owner', 'agent', 'gov', 'employee']).default('owner'),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const ConstructionPromptOutputSchema = RequiredElementsSchema.extend({
  title: z.string().min(1),
  summary: z.string().min(1),
  executiveSummary: z.string().min(1),
  keyFindings: z.array(z.object({
    finding: z.string().min(1),
    impact: z.string().min(1),
    suggestedAction: z.string().min(1),
    riskColor: z.enum(['green', 'yellow', 'red']),
  })).min(1).max(8),
  actionPlan: z.array(z.object({
    owner: z.string().min(1),
    step: z.string().min(1),
    timing: z.string().min(1),
    evidenceNeeded: z.array(z.string().min(1)).min(1).max(6),
  })).min(1).max(8),
  evidenceGaps: z.array(z.string().min(1)).max(8),
  valueDensitySelfCheck: z.object({
    creditCostWorthIt: z.literal('yes'),
    outsideAlternativeCostOver10x: z.literal('yes'),
    userFeelsWorthIt: z.literal('yes'),
    freeHookValueEnough: z.literal('yes'),
    dryContentOver70Percent: z.literal('yes'),
    platformDataNecessary: z.literal('yes'),
  }),
});

export type ConstructionPromptInput = z.infer<typeof ConstructionPromptInputSchema>;
export type ConstructionPromptOutput = z.infer<typeof ConstructionPromptOutputSchema>;
