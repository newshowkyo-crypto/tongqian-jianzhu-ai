export const DEFAULT_RED_LINES = {
  monthlyChurnRateMax: 0.12,
  aiCostPerCreditCnyMax: 0.07,
  agentMonthlyActiveRateMin: 0.3,
  consultingConversionRateMin: 0.02,
  singleChannelShareMax: 0.6,
  p95AiLatencyMsMax: 120000,
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'ops.red_lines',
      value: DEFAULT_RED_LINES,
      description: 'Default operations red-line thresholds.',
      isOverridable: true,
    },
  ] as const;
}
