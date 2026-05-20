import { createHmac } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';

interface WebhookJob {
  attempts: number;
  body: Record<string, unknown>;
  createdAt: string;
  id: string;
  status: 'dead' | 'delivered' | 'queued' | 'retrying';
  targetUrl: string;
}

@Injectable()
export class WebhookEmitterService {
  private readonly deadLetter: WebhookJob[] = [];
  private readonly logger = new Logger(WebhookEmitterService.name);
  private readonly queue: WebhookJob[] = [];

  enqueue(input: { body: Record<string, unknown>; targetUrl?: string }): WebhookJob {
    const job: WebhookJob = {
      attempts: 0,
      body: input.body,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      status: 'queued',
      targetUrl: input.targetUrl ?? 'mock://webhook-outbound',
    };
    this.queue.push(job);
    this.logger.log(`webhook.emit.queued id=${job.id} target=${job.targetUrl}`);
    return job;
  }

  async flush(): Promise<{ dead: number; delivered: number; queued: number }> {
    for (const job of this.queue.filter((item) => item.status === 'queued' || item.status === 'retrying')) {
      await this.deliverWithRetry(job);
    }
    return {
      dead: this.deadLetter.length,
      delivered: this.queue.filter((item) => item.status === 'delivered').length,
      queued: this.queue.filter((item) => item.status === 'queued' || item.status === 'retrying').length,
    };
  }

  signPayload(body: Record<string, unknown>, secret = process.env.WEBHOOK_EMIT_SECRET ?? 'mock-webhook-secret'): string {
    return createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
  }

  listDeadLetter(): WebhookJob[] {
    return [...this.deadLetter];
  }

  listQueue(): WebhookJob[] {
    return [...this.queue];
  }

  private async deliverWithRetry(job: WebhookJob): Promise<void> {
    while (job.attempts < 3 && job.status !== 'delivered') {
      job.attempts += 1;
      try {
        await this.deliver(job);
        job.status = 'delivered';
      } catch (error) {
        job.status = 'retrying';
        this.logger.warn(`webhook.emit.retry id=${job.id} attempt=${job.attempts} reason=${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (job.status !== 'delivered') {
      job.status = 'dead';
      this.deadLetter.push(job);
    }
  }

  private async deliver(job: WebhookJob): Promise<void> {
    if (job.targetUrl.startsWith('mock://')) return;
    const signature = this.signPayload(job.body);
    const response = await fetch(job.targetUrl, {
      body: JSON.stringify(job.body),
      headers: { 'content-type': 'application/json', 'x-tq-signature': signature },
      method: 'POST',
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
  }
}
