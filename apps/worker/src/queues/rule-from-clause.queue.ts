import { Queue, Worker } from 'bullmq';

export interface RuleFromClauseJob {
  confidenceThreshold: number;
  corpusId: string;
}

export const ruleFromClauseQueue = new Queue<RuleFromClauseJob>('rule-from-clause', {
  connection: { host: process.env.REDIS_HOST ?? '127.0.0.1', port: Number(process.env.REDIS_PORT ?? 6379) },
});

export function createRuleFromClauseWorker(processor: (job: RuleFromClauseJob) => Promise<unknown>): Worker<RuleFromClauseJob> {
  return new Worker<RuleFromClauseJob>('rule-from-clause', async (job) => processor(job.data), {
    autorun: false,
    connection: { host: process.env.REDIS_HOST ?? '127.0.0.1', port: Number(process.env.REDIS_PORT ?? 6379) },
    concurrency: 1,
  });
}
