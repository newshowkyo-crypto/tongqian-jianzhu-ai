export const AGENT_FOLLOWUP_SCAN_CRON = ['0 9 * * *', '0 14 * * *'];

export const followupScenarios = [
  'inquiry_no_order',
  'free_quota',
  'renewal',
  'payment_failed',
  'report_unread',
] as const;

export function scanAgentFollowups(now = new Date()): Array<{ dueAt: string; scenario: string }> {
  return followupScenarios.map((scenario, index) => ({
    dueAt: new Date(now.getTime() + index * 60_000).toISOString(),
    scenario,
  }));
}
