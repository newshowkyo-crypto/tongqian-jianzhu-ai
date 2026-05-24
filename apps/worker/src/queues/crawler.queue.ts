import type { Queue } from 'bullmq';

import { CebpubserviceFetcher } from '../crawlers/cebpubservice.fetcher.js';
import { CreditchinaFetcher } from '../crawlers/creditchina.fetcher.js';
import { MofFetcher } from '../crawlers/mof.fetcher.js';
import { MohurdFetcher } from '../crawlers/mohurd.fetcher.js';
import { NdrcFetcher } from '../crawlers/ndrc.fetcher.js';
import { WenshuFetcher } from '../crawlers/wenshu.fetcher.js';

export const crawlerJobs = [
  { cron: '0 4 * * *', fetcher: new CebpubserviceFetcher(), name: 'crawler.cebpubservice' },
  { cron: '0 3 * * 0', fetcher: new WenshuFetcher(), name: 'crawler.wenshu' },
  { cron: '0 5 * * 3', fetcher: new CreditchinaFetcher(), name: 'crawler.creditchina' },
  { cron: '0 6 * * *', fetcher: new MohurdFetcher(), name: 'crawler.mohurd' },
  { cron: '30 6 * * *', fetcher: new MofFetcher(), name: 'crawler.mof' },
  { cron: '0 7 * * *', fetcher: new NdrcFetcher(), name: 'crawler.ndrc' },
] as const;

export async function registerCrawlerSchedules(queue: Queue): Promise<void> {
  for (const job of crawlerJobs) {
    await queue.add(job.name, { sourceName: job.fetcher.sourceName }, {
      attempts: 3,
      backoff: { delay: 60_000, type: 'exponential' },
      repeat: { pattern: job.cron },
      removeOnComplete: 100,
      removeOnFail: 200,
    });
  }
}

export async function runCrawlerJob(name: string): Promise<unknown> {
  const job = crawlerJobs.find((item) => item.name === name);
  if (!job) return { name, skipped: true };
  const result = await job.fetcher.run();
  return { ...result, event: 'crawler.completed', sourceName: job.fetcher.sourceName };
}
