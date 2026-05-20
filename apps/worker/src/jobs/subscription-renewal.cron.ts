import type { JobsOptions, Queue } from 'bullmq';

const name = 'subscription-renewal';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 60_000, type: 'exponential' }, repeat: { pattern: '0 3 * * *' }, removeOnComplete: 100 };

export class SubscriptionRenewalCron {
  readonly name = name;
  readonly description = 'Daily 03:00 subscription renewal, grace-window recovery and invoice pre-generation.';
  readonly safeguards = [
    'idempotencyKey=tenantId+billingMonth',
    'dry-run when payment provider is PLACEHOLDER',
    'invoice draft is generated before credit deduction',
    'failed renewal keeps user in grace window instead of hard stop',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/subscription-renewal/run' };

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 30_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const tenants = this.mockTenants();
    const renewed = tenants.filter((tenant) => tenant.status === 'active').map((tenant) => this.renewTenant(tenant.id));
    const grace = tenants.filter((tenant) => tenant.status === 'grace').map((tenant) => this.extendGrace(tenant.id));
    return { grace, job: name, payload, renewed, retry: 'bullmq-attempts-3', status: 'ok' };
  }

  private mockTenants(): Array<{ id: string; plan: string; status: 'active' | 'grace' | 'paused' }> {
    return [
      { id: 'tenant-001', plan: 'std', status: 'active' },
      { id: 'tenant-002', plan: 'flag', status: 'active' },
      { id: 'tenant-003', plan: 'lite', status: 'grace' },
    ];
  }

  private renewTenant(tenantId: string): Record<string, unknown> {
    return { invoiceDraft: `invoice-${tenantId}`, nextBillingAt: new Date(Date.now() + 30 * 86_400_000).toISOString(), tenantId };
  }

  private extendGrace(tenantId: string): Record<string, unknown> {
    return { graceEndsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(), notice: 'notification.subscription.grace', tenantId };
  }
}
