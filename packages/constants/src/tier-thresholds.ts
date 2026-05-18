export const DEFAULT_TIER_THRESHOLDS = {
  contractProjectAmount: {
    tier1MaxCny: 10000000,
    tier2MaxCny: 50000000,
  },
  tenderProjectAmount: {
    tier2MinCny: 10000000,
    tier3MinCny: 50000000,
  },
  receivableAmount: {
    tier1MaxCny: 5000000,
    tier2MaxCny: 20000000,
  },
  financingCreditAmount: {
    tier2MaxCny: 50000000,
  },
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'ai.tier_thresholds.default',
      value: DEFAULT_TIER_THRESHOLDS,
      description: 'Default AI output tier thresholds.',
      isOverridable: true,
    },
  ] as const;
}
