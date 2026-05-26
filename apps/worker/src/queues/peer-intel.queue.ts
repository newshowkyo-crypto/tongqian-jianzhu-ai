export const PEER_INTEL_WEEKLY_CRON = '0 6 * * 1';

export function enqueuePeerIntelWeek(week: string): { jobName: string; week: string } {
  return { jobName: 'peer-intel-weekly', week };
}
