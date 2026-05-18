export const DEFAULT_AI_RATE_LIMITS = {
  trialDailyTasks: 10,
  liteDailyTasks: 30,
  standardDailyTasks: 100,
  enterpriseDailyTasks: 300,
  flagshipDailyTasks: 1000,
  perUserConcurrentTasks: 3,
  perTenantConcurrentTasks: 20,
} as const;
