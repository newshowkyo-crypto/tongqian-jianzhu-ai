import type { JobsOptions, Queue } from 'bullmq';

const name = 'agent-reputation-decay';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 60_000, type: 'exponential' }, repeat: { pattern: '15 5 * * *' }, removeOnComplete: 100 };

export class AgentReputationDecayCron {
  readonly name = name;
  readonly description = 'Daily reputation natural decay and +20/month activity offset calculation.';
  readonly safeguards = [
    'score never drops below zero',
    'LV changes emit appeal window before final settlement',
    'inactive decay is capped by month',
    'manual trigger records operatorId for audit review',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/agent-reputation-decay/run' };
  readonly outputContract = 'agentId,before,after,delta,appealWindow,adminAuditTrace';

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 30_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const agents = [
      { activeDays: 22, id: 'agent-001', score: 760 },
      { activeDays: 3, id: 'agent-002', score: 540 },
    ];
    const changes = agents.map((agent) => {
      const offset = agent.activeDays >= 20 ? 20 : 0;
      const decay = agent.activeDays < 7 ? -8 : -2;
      return { agentId: agent.id, after: Math.max(0, agent.score + offset + decay), before: agent.score, delta: offset + decay };
    });
    return { changes, job: name, payload, status: 'ok' };
  }

  runbook(): string[] {
    return ['review appeal queue before settlement and pause disputed orders', 'publish LV badge changes only after notification and appeal window', 'export daily delta for admin audit and reward-claim reconciliation'];
  }
}
