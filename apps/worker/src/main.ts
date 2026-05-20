import 'reflect-metadata';

import { createServer } from 'node:http';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

import { AgentReputationDecayCron } from './jobs/agent-reputation-decay.cron.js';
import { AiCostMonitorCron } from './jobs/ai-cost-monitor.cron.js';
import { AuditArchiveCron } from './jobs/audit-archive.cron.js';
import { BackupCron } from './jobs/backup.cron.js';
import { CreditExpiryCron } from './jobs/credit-expiry.cron.js';
import { MonthlyReportCron } from './jobs/monthly-report.cron.js';
import { MorningBriefingCron } from './jobs/morning-briefing.cron.js';
import { OpportunityRadarScanCron } from './jobs/opportunity-radar-scan.cron.js';
import { QualificationAlertCron } from './jobs/qualification-alert.cron.js';
import { SubscriptionRenewalCron } from './jobs/subscription-renewal.cron.js';

const cronJobs = [
  new SubscriptionRenewalCron(),
  new CreditExpiryCron(),
  new QualificationAlertCron(),
  new BackupCron(),
  new AuditArchiveCron(),
  new MonthlyReportCron(),
  new MorningBriefingCron(),
  new AiCostMonitorCron(),
  new AgentReputationDecayCron(),
  new OpportunityRadarScanCron(),
];

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class WorkerModule {}

async function bootstrap(): Promise<void> {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  const queueName = 'tongqian-cron';
  const queue = new Queue(queueName, { connection });
  for (const cron of cronJobs) {
    await cron.register(queue);
  }
  const worker = new Worker(queueName, async (job) => {
    const cron = cronJobs.find((item) => item.name === job.name);
    if (!cron) return { id: job.id, name: job.name, skipped: true };
    return cron.run(job.data as Record<string, unknown>);
  }, {
    connection,
  });

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  });

  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ jobs: cronJobs.map((job) => ({ description: job.description, name: job.name })), status: 'ok', service: 'worker' }));
  });

  const port = Number(process.env.PORT ?? 4100);
  server.listen(port, '0.0.0.0');

  const shutdown = async (): Promise<void> => {
    server.close();
    await worker.close();
    await queue.close();
    await connection.quit();
    await app.close();
  };

  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

void bootstrap();
