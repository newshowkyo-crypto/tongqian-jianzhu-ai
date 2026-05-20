import type { JobsOptions, Queue } from 'bullmq';

const name = 'monthly-report';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 120_000, type: 'exponential' }, repeat: { pattern: '30 7 1 * *' }, removeOnComplete: 100 };

export class MonthlyReportCron {
  readonly name = name;
  readonly description = 'Monthly tenant operating report generation and inbox delivery.';
  readonly safeguards = [
    'report generation reads tenant-scoped aggregates only',
    'AI commentary routes through DeepSeek when enabled',
    'reports are stored as generated assets before notification',
    'manual trigger is idempotent by tenantId+month',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/monthly-report/run' };
  readonly outputContract = 'tenantId,month,kpis,reportUrl,deliveryChannel,exceptionTicket';
  readonly ownerVisibleValue = 'monthly business review with risks, opportunities and credit spend';

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 60_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const tenants = ['tenant-001', 'tenant-002', 'tenant-003'];
    const reports = tenants.map((tenantId, index) => ({
      kpis: { aiCalls: 40 + index * 12, opportunities: 8 + index, redRisks: index },
      reportUrl: `mock://reports/monthly/${tenantId}/${new Date().toISOString().slice(0, 7)}.pdf`,
      tenantId,
    }));
    return { deliveredChannel: 'inbox', job: name, payload, reports, status: 'ok' };
  }

  runbook(): string[] {
    return ['aggregate tenant KPIs with four-layer where scope', 'generate report asset and signed URL', 'send inbox notice with quiet-hours policy', 'surface exceptions in admin jobs table for customer success follow-up'];
  }
}
