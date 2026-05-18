export const DEFAULT_PREMIUM_SERVICES = [
  { code: 'annual_strategy', minPriceCny: 300000, maxPriceCny: 500000, referralRateMin: 0.1, referralRateMax: 0.15 },
  { code: 'debt_resolution', minPriceCny: 500000, referralRateMin: 0.1, referralRateMax: 0.15 },
  { code: 'abs_abn_reits', minPriceCny: 1000000, referralRateMin: 0.1, referralRateMax: 0.15 },
  { code: 'mixed_reform_mna_spv', minPriceCny: 800000, referralRateMin: 0.1, referralRateMax: 0.15 },
  { code: 'soe_financing_plan', minPriceCny: 300000, maxPriceCny: 1000000, referralRateMin: 0.1, referralRateMax: 0.15 },
  { code: 'major_project_tender', minPriceCny: 100000, maxPriceCny: 300000, referralRateMin: 0.15, referralRateMax: 0.2 },
  { code: 'top_qualification_upgrade', minPriceCny: 150000, maxPriceCny: 300000, referralRateMin: 0.15, referralRateMax: 0.15 },
  { code: 'special_bond_planning', minPriceCny: 300000, referralRateMin: 0.1, referralRateMax: 0.15 },
] as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'premium.services',
      value: DEFAULT_PREMIUM_SERVICES,
      description: 'Default premium consulting service shelf.',
      isOverridable: true,
    },
  ] as const;
}
