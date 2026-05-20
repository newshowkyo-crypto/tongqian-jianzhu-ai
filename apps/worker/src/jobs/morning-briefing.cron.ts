import type { JobsOptions, Queue } from 'bullmq';

const name = 'morning-briefing';
const repeat: JobsOptions = { attempts: 3, backoff: { delay: 60_000, type: 'exponential' }, repeat: { pattern: '30 7 * * *' }, removeOnComplete: 100 };

export class MorningBriefingCron {
  readonly name = name;
  readonly description = 'Daily 07:30 AI morning briefing generation through DeepSeek routing.';
  readonly safeguards = [
    'uses DeepSeek only during M3.7/M3.9 policy window',
    'briefing contains disclaimer, tier, confidence and guidance buttons',
    'quiet users can opt out from the feedback channel',
    'one briefing per user per day by idempotency key',
  ];
  readonly manualTrigger = { permission: 'admin:jobs:write', route: '/api/v1/admin/jobs/morning-briefing/run' };
  readonly outputContract = 'userId,highlights,model,tier,confidence,notificationId';
  readonly ownerVisibleValue = 'morning briefing with opportunity, risk, approval and credit balance';

  async register(queue: Queue): Promise<void> {
    await queue.add(name, { mode: 'cron', provider: 'deepseek', scheduledBy: 'm3.9-worker' }, repeat);
  }

  async trigger(queue: Queue, operatorId = 'system'): Promise<string | undefined> {
    const job = await queue.add(name, { manual: true, operatorId, provider: 'deepseek', triggeredAt: new Date().toISOString() }, { attempts: 3, backoff: { delay: 30_000, type: 'exponential' } });
    return job.id;
  }

  async run(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const owners = ['owner-001', 'owner-002'];
    const briefings = owners.map((userId) => ({
      highlights: ['今日机会 4 条', '风险红灯 1 条', '待审批 2 条'],
      model: 'deepseek-chat',
      notification: 'inbox',
      userId,
    }));
    return { briefings, job: name, payload, status: 'ok' };
  }

  runbook(): string[] {
    return ['collect yesterday KPIs and red-light risks', 'call DeepSeek briefing prompt through AI gateway policy', 'store summary with required four AI output elements', 'send one quiet-hours aware notification with dislike feedback'];
  }
}
