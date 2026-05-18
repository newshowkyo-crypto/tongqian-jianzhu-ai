export const DEFAULT_COMMISSION_RATES = {
  subscriptionFirstYear: 0.3,
  subscriptionRenewal: 0.2,
  creditTopUp: 0.15,
  dispatchServicePlatformRate: 0,
  agentReferralSecondLevel: 0.1,
  settlementProtectionDays: 7,
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'agent.commission_rates',
      value: DEFAULT_COMMISSION_RATES,
      description: 'Default agent commission rates.',
      isOverridable: true,
    },
  ] as const;
}
