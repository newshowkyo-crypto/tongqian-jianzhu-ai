export const DEFAULT_TAKEOVER_TRIGGERS = {
  tier3OrTier4: true,
  projectAmountAtLeastCny: 50000000,
  ownedAgentNoResponseHours: 24,
  quoteMultiplierAtLeast: 2,
  averageRatingBelow: 3,
  complexDebtOrCapitalMarket: true,
  customerManualRequest: true,
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'dispatch.takeover_triggers',
      value: DEFAULT_TAKEOVER_TRIGGERS,
      description: 'Default Tongqian consulting takeover triggers.',
      isOverridable: true,
    },
  ] as const;
}
