export const COST_FLOOR = {
  targetAiCostPerCreditCny: 0.03,
  baselineAiCostPerCreditCny: 0.05,
  redLineAiCostPerCreditCny: 0.07,
  minGrossMarginRate: 0.7,
  dailyUserAiCostAutoDowngradeCny: 10,
  monthlyUserAiCostReviewCny: 300,
  monthlyTenantAiCostFreezeCny: 1000,
} as const;
