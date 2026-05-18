import { ReputationLevel, type ReputationLevelRule } from '@tongqian/types';

export const DEFAULT_REPUTATION_LEVELS = [
  { level: ReputationLevel.LV1, minScore: 0, maxScore: 499, dispatchWeight: 1, maxReferralRatePercent: 10, withdrawalDelayDays: 30 },
  { level: ReputationLevel.LV2, minScore: 500, maxScore: 699, dispatchWeight: 5, maxReferralRatePercent: 12, withdrawalDelayDays: 15 },
  { level: ReputationLevel.LV3, minScore: 700, maxScore: 849, dispatchWeight: 10, maxReferralRatePercent: 15, withdrawalDelayDays: 7 },
  { level: ReputationLevel.LV4, minScore: 850, maxScore: 949, dispatchWeight: 15, maxReferralRatePercent: 18, withdrawalDelayDays: 3 },
  { level: ReputationLevel.LV5, minScore: 950, maxScore: 1000, dispatchWeight: 20, maxReferralRatePercent: 20, withdrawalDelayDays: 0 },
] as const satisfies readonly ReputationLevelRule[];

export function seedSystemConfigs() {
  return [
    {
      key: 'reputation.levels',
      value: DEFAULT_REPUTATION_LEVELS,
      description: 'Default reputation level thresholds and benefits.',
      isOverridable: true,
    },
  ] as const;
}
