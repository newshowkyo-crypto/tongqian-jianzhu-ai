import type { JobsOptions, Queue } from 'bullmq';

const name = 'ai-cost-monitor';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 30_000, type: 'exponential' }, repeat: { pattern: '0 * * * *' }, removeOnComplete: 200 };

export class AiCostMonitorCron {
  readonly name = name;
  readonly description = 'Hourly BR-901/BR-903 red-line monitor for AI spend and customer margin.';
  readonly safeguards = [
    'BR-901 flags tenant AI cost above margin threshold',
    'BR-903 flags refund risk and repeated failed output',
    'no automatic model disable without platform-owner approval',
    'DeepSeek remains primary route while other providers lack balance',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/ai-cost-monitor/run' };

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 30_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const tenants = this.mockCostRows();
    const alerts = tenants.filter((row) => row.costCny > row.revenueCny * 0.35 || row.refundRisk > 0.2);
    return {
      alerts: alerts.map((row) => ({ code: row.costCny > row.revenueCny * 0.35 ? 'BR-901' : 'BR-903', tenantId: row.tenantId })),
      job: name,
      payload,
      status: 'ok',
      totalCostCny: tenants.reduce((sum, row) => sum + row.costCny, 0),
    };
  }

  private mockCostRows(): Array<{ costCny: number; refundRisk: number; revenueCny: number; tenantId: string }> {
    return [
      { costCny: 36, refundRisk: 0.04, revenueCny: 199, tenantId: 'tenant-001' },
      { costCny: 180, refundRisk: 0.25, revenueCny: 499, tenantId: 'tenant-002' },
    ];
  }

  runbook(): string[] {
    return ['send platform-owner alert for red-line rows', 'attach token and cost snapshot', 'keep provider route unchanged until approval'];
  }
}
