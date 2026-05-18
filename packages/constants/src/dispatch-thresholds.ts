export const DEFAULT_DISPATCH_THRESHOLDS = {
  qualServiceFeeMaxCny: 100000,
  tenderServiceFeeMaxCny: 30000,
  tenderProjectAmountMaxCny: 50000000,
  loanCreditMaxCny: 50000000,
  factoringAmountMaxCny: 20000000,
  takeoverProjectAmountMinCny: 50000000,
  quoteTakeoverMultiplier: 2,
  ownedAgentResponseHours: 24,
  crossPoolResponseHours: 1,
  publicPoolResponseHours: 1,
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'dispatch.thresholds',
      value: DEFAULT_DISPATCH_THRESHOLDS,
      description: 'Default A/B/C dispatch classification thresholds.',
      isOverridable: true,
    },
  ] as const;
}
