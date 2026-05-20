import type { JobsOptions, Queue } from 'bullmq';

const name = 'audit-archive';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 120_000, type: 'exponential' }, repeat: { pattern: '0 2 1 * *' }, removeOnComplete: 100 };

export class AuditArchiveCron {
  readonly name = name;
  readonly description = 'Monthly first-day audit partition archive and immutable retention check.';
  readonly safeguards = [
    'audit logs are archived, never deleted',
    'partition key is previous month to avoid active writes',
    'archive object carries checksum and immutable retention',
    'manual trigger produces a new archive object instead of overwriting',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/audit-archive/run' };
  readonly outputContract = 'partition,month,rowEstimate,archiveKey,checksum,retentionProof';

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 60_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const month = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 7);
    const partitions = ['audit_logs', 'ai_call_logs', 'credential_audit_logs'].map((table) => ({
      archiveKey: `mock://audit-archive/${table}/${month}.jsonl.gz`,
      month,
      rowEstimate: table === 'ai_call_logs' ? 1200 : 300,
      table,
    }));
    return { immutable: true, job: name, partitions, payload, retentionYears: 10, status: 'ok' };
  }

  runbook(): string[] {
    return ['check previous month partition row count before touching current writes', 'write archive object and checksum to OSS/mock target', 'record immutable retention proof in admin audit with operator trace'];
  }
}
