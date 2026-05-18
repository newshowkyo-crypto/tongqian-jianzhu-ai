import { z } from 'zod';

import { AiAudienceRole, AiConfidenceLevel, AiNextStepAction } from '../ai-task/output.js';
import { AiOutputTier } from '../ai-task/tier.js';

export enum ReportNextStepHint {
  USE_DIRECTLY = 'use-directly',
  APPLY_HUMAN_REVIEW = 'apply-human-review',
  APPLY_TONGQIAN_CONSULT = 'apply-tongqian-consult',
  MANDATORY_HUMAN_TAKEOVER = 'mandatory-human-takeover',
}

export const AiNextStepButtonSchema = z.object({
  action: z.nativeEnum(AiNextStepAction),
  i18nKey: z.string().min(1),
  role: z.nativeEnum(AiAudienceRole),
  tierMin: z.nativeEnum(AiOutputTier).optional(),
  tierMax: z.nativeEnum(AiOutputTier).optional(),
});

export const ExecutionDifficultyRadarSchema = z.object({
  professional: z.number().int().min(0).max(100),
  time: z.number().int().min(0).max(100),
  risk: z.number().int().min(0).max(100),
  cost: z.number().int().min(0).max(100),
});

export const RequiredElementsSchema = z.object({
  disclaimer: z.string().min(1),
  tier: z.nativeEnum(AiOutputTier),
  confidence: z.nativeEnum(AiConfidenceLevel),
  dataSourceStatement: z.string().min(1),
  traceId: z.string().min(1),
  nextStepHint: z.nativeEnum(ReportNextStepHint),
  nextStepButtons: z.array(AiNextStepButtonSchema).min(1),
  executionDifficultyRadar: ExecutionDifficultyRadarSchema.optional(),
});

export const ReportOutputBaseSchema = RequiredElementsSchema.extend({
  title: z.string().min(1),
  summary: z.string().min(1),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      content: z.unknown(),
    }),
  ),
});

export type AiNextStepButtonDto = z.infer<typeof AiNextStepButtonSchema>;
export type ExecutionDifficultyRadar = z.infer<typeof ExecutionDifficultyRadarSchema>;
export type RequiredElements = z.infer<typeof RequiredElementsSchema>;
export type ReportOutputBase = z.infer<typeof ReportOutputBaseSchema>;
export type ReportNextStepHintValue = `${ReportNextStepHint}`;

export const REPORT_NEXT_STEP_HINT_VALUES = Object.values(ReportNextStepHint);
