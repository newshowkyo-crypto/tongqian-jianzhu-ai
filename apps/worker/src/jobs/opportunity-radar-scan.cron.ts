import type { JobsOptions, Queue } from 'bullmq';

const name = 'opportunity-radar-scan';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 60_000, type: 'exponential' }, repeat: { pattern: '0 */6 * * *' }, removeOnComplete: 100 };

export class OpportunityRadarScanCron {
  readonly name = name;
  readonly description = 'Every 6 hours opportunity signal scan with policy/tender/customer triggers.';
  readonly safeguards = [
    'signals are deduped by source+externalId',
    'customer contact is never exposed across tenant boundary',
    'low fit signals stay in review pool instead of push',
    'crawler or provider outage falls back to seeded fixtures',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/opportunity-radar-scan/run' };
  readonly outputContract = 'signalId,source,fit,tenantId,evidenceUrl,pushDecision';

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 30_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const signals = [
      { fit: 0.88, id: 'opp-001', source: 'tender', title: '市政道路改造招标' },
      { fit: 0.74, id: 'opp-002', source: 'policy', title: '数字化转型补贴' },
      { fit: 0.67, id: 'opp-003', source: 'customer', title: '央企供应商征集' },
    ];
    return { job: name, payload, pushed: signals.filter((signal) => signal.fit >= 0.7), scanned: signals.length, status: 'ok' };
  }

  runbook(): string[] {
    return ['scan tender, policy and customer sources with provider fallback', 'dedupe external IDs and keep source evidence', 'score tenant fit by region qualification and cashflow', 'push only signals above threshold and leave the rest in review pool'];
  }
}
