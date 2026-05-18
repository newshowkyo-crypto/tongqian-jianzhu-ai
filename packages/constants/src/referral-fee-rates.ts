export const DEFAULT_REFERRAL_FEE_RATES = {
  defaultMinRate: 0.1,
  defaultMaxRate: 0.15,
  majorTenderMinRate: 0.15,
  majorTenderMaxRate: 0.2,
  qualUpgradeRate: 0.15,
  complaintProtectionDays: 7,
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'agent.referral_fee_rates',
      value: DEFAULT_REFERRAL_FEE_RATES,
      description: 'Default high-end consulting referral fee rates.',
      isOverridable: true,
    },
  ] as const;
}
