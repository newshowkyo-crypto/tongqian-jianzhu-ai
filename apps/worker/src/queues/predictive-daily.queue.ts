export const PREDICTIVE_DAILY_CRON = '0 7 * * *';

export function enqueueDailyPrediction(tenantId: string, userId: string): { jobName: string; tenantId: string; userId: string } {
  return { jobName: 'predictive-daily-forecast', tenantId, userId };
}
