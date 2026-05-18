export const AGENT_ACTIVITY_THRESHOLDS = {
  dormantAfterDays: 60,
  dormantMonthlyActiveRateBelow: 0.3,
  disposalAfterDays: 90,
  disposalMonthlyActiveRateBelow: 0.1,
  lowRatingSuspendBelow: 3,
  lowRatingSuspendDays: 30,
  lowRatingDisposeConsecutiveMonths: 3,
} as const;
