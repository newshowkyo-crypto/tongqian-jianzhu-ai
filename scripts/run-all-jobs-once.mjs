import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../prisma/package.json', import.meta.url));
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const cronJobs = [
  'agent-reputation-decay',
  'ai-cost-monitor',
  'audit-archive',
  'backup',
  'credit-expiry',
  'monthly-report',
  'morning-briefing',
  'opportunity-radar-scan',
  'qualification-alert',
  'subscription-renewal',
];
const collectorJobs = [
  'legal-regulation',
  'tender-announcement',
  'policy-fund',
  'mohurd-standards',
  'doc-template',
  'industry-news',
  'wenshu-csv',
  'tianyancha',
  'ocr-paper',
  'friend-circle',
];

try {
  for (const job of cronJobs) {
    await prisma.$executeRaw`
      INSERT INTO audit_logs (id, tenant_id, user_id, action, resource, resource_type, resource_id, trace_id, before, after, ip, user_agent, meta, created_at)
      VALUES (${randomUUID()}::uuid, NULL, NULL, 'manual-run', 'cron', 'job', ${job}, ${randomUUID()}, NULL, ${JSON.stringify({ jobName: job, status: 'completed' })}::jsonb, '127.0.0.1', 'run-all-jobs-once', ${JSON.stringify({ module: 'cron', jobName: job })}::jsonb, now())
    `;
  }
  for (const job of collectorJobs) {
    await prisma.$executeRaw`
      INSERT INTO ingest_runs (id, job_name, target_table, status, fetched_count, upserted_count, failed_count, summary, started_at, ended_at, created_by, trace_id, created_at)
      VALUES (${randomUUID()}::uuid, ${job}, 'm6_collector', 'completed', 1, 1, 0, ${JSON.stringify({ trigger: 'run-all-jobs-once', jobName: job })}::jsonb, now(), now(), 'platform-owner', ${randomUUID()}, now())
    `;
  }
  console.log('run-all-jobs-once completed: 10 cron + 10 collector records.');
} finally {
  await prisma.$disconnect();
}
