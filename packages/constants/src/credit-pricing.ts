import { AiTaskType } from '@tongqian/types';

export const DEFAULT_CREDIT_PRICING = {
  [AiTaskType.CHAT_SHORT]: 30,
  [AiTaskType.CHAT_LONG]: 80,
  [AiTaskType.CONTRACT_REVIEW_BASIC]: 300,
  [AiTaskType.CONTRACT_REVIEW_PRO]: 800,
  [AiTaskType.TENDER_SUMMARY]: 200,
  [AiTaskType.TENDER_ELIGIBILITY]: 300,
  [AiTaskType.TENDER_FRAMEWORK]: 500,
  [AiTaskType.QUAL_CHECKUP]: 200,
  [AiTaskType.QUAL_UPGRADE_PATH]: 500,
  [AiTaskType.OPP_INVESTABILITY]: 200,
  [AiTaskType.OPP_AUTHENTICITY]: 200,
  [AiTaskType.OPP_PEER_RADAR]: 300,
  [AiTaskType.COST_ROUGH_ESTIMATE]: 800,
  [AiTaskType.COST_CHECKLIST_REVIEW]: 500,
  [AiTaskType.DRAWING_UNDERSTAND]: 300,
  [AiTaskType.DRAWING_ERROR_DETECT]: 800,
  [AiTaskType.DRAWING_QUANTITY_ESTIMATE]: 800,
  [AiTaskType.CASH_AGING_ANALYSIS]: 300,
  [AiTaskType.CASH_CASHFLOW_FORECAST]: 500,
  [AiTaskType.CASH_FINANCING_DIAGNOSIS]: 500,
} as const satisfies Partial<Record<AiTaskType, number>>;

export const CREDIT_EXCHANGE_RATE = {
  creditsPerCny: 100,
  minBillableCredits: 30,
} as const;

export const DEFAULT_CREDIT_PACKAGES = [
  { code: 'small', priceCny: 19, credits: 1500 },
  { code: 'medium', priceCny: 99, credits: 9000 },
  { code: 'large', priceCny: 299, credits: 30000 },
] as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'ai.credit_pricing.default',
      value: DEFAULT_CREDIT_PRICING,
      description: 'Default AI task credit pricing.',
      isOverridable: true,
    },
    {
      key: 'credit.packages',
      value: DEFAULT_CREDIT_PACKAGES,
      description: 'Default credit top-up packages.',
      isOverridable: true,
    },
  ] as const;
}
