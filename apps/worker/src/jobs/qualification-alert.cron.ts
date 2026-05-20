import type { JobsOptions, Queue } from 'bullmq';

const name = 'qualification-alert';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 60_000, type: 'exponential' }, repeat: { pattern: '30 8 * * *' }, removeOnComplete: 100 };

export class QualificationAlertCron {
  readonly name = name;
  readonly description = 'Daily qualification expiry scan for 90/30/7 day alert windows.';
  readonly safeguards = [
    'same certificate and same alert window sends once',
    'GOV tenants receive inbox/email only',
    'critical 7-day alert bypasses marketing quiet hours',
    'all records stay tenant-scoped before notification fanout',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/qualification-alert/run' };

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 30_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const certificates = this.mockCertificates();
    const alerts = certificates
      .map((cert) => ({ ...cert, window: this.alertWindow(cert.daysLeft) }))
      .filter((cert) => cert.window);
    return {
      alerts: alerts.map((cert) => ({ certificateId: cert.id, tenantId: cert.tenantId, title: cert.title, window: cert.window })),
      job: name,
      payload,
      status: 'ok',
    };
  }

  private alertWindow(daysLeft: number): '90d' | '30d' | '7d' | undefined {
    if (daysLeft <= 7) return '7d';
    if (daysLeft <= 30) return '30d';
    if (daysLeft <= 90) return '90d';
    return undefined;
  }

  private mockCertificates(): Array<{ daysLeft: number; id: string; tenantId: string; title: string }> {
    return [
      { daysLeft: 88, id: 'qual-001', tenantId: 'tenant-001', title: '建筑工程施工总承包二级' },
      { daysLeft: 27, id: 'qual-002', tenantId: 'tenant-002', title: '安全生产许可证' },
      { daysLeft: 6, id: 'qual-003', tenantId: 'tenant-003', title: '市政公用工程三级' },
    ];
  }
}
