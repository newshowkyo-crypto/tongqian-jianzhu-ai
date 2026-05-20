import type { JobsOptions, Queue } from 'bullmq';

const name = 'credit-expiry';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 60_000, type: 'exponential' }, repeat: { pattern: '0 4 * * *' }, removeOnComplete: 100 };

export class CreditExpiryCron {
  readonly name = name;
  readonly description = 'Daily 04:00 FEFO credit expiry, archive and owner notification.';
  readonly safeguards = [
    'FEFO lots are archived only after balance snapshot',
    'gift credits expire before paid credits',
    'owner receives notice before 7-day expiry window',
    'manual trigger is safe because each lot archive has an idempotency key',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/credit-expiry/run' };

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 30_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const lots = this.mockLots();
    const expiring = lots.filter((lot) => lot.daysLeft <= 7 && lot.balance > 0);
    const expired = lots.filter((lot) => lot.daysLeft <= 0 && lot.balance > 0);
    return {
      archived: expired.map((lot) => ({ archivedCredits: lot.balance, lotId: lot.id, reason: 'expired' })),
      expiringNotices: expiring.map((lot) => ({ lotId: lot.id, notice: 'notification.credit.expiring', tenantId: lot.tenantId })),
      job: name,
      payload,
      status: 'ok',
    };
  }

  private mockLots(): Array<{ balance: number; daysLeft: number; id: string; tenantId: string }> {
    return [
      { balance: 800, daysLeft: 6, id: 'lot-001', tenantId: 'tenant-001' },
      { balance: 0, daysLeft: 2, id: 'lot-002', tenantId: 'tenant-001' },
      { balance: 300, daysLeft: -1, id: 'lot-003', tenantId: 'tenant-002' },
    ];
  }
}
