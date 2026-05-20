import { createHmac } from 'node:crypto';

import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';

import { WebhookEmitterService } from './webhook-emitter.service.js';

type Provider = 'alipay' | 'wechat-mp' | 'wechat-pay';

@Controller('webhook')
export class WebhookReceiverController {
  private readonly inboundAudit: Array<Record<string, unknown>> = [];
  private readonly processed = new Set<string>();
  private readonly queue: Array<Record<string, unknown>> = [];

  constructor(@Inject(WebhookEmitterService) private readonly emitter: WebhookEmitterService) {}

  @Post('wechat-pay')
  wechatPay(@Body() body: Record<string, unknown>, @Headers('x-wechatpay-signature') signature = 'mock-signature'): unknown {
    return this.receive('wechat-pay', body, signature);
  }

  @Post('alipay')
  alipay(@Body() body: Record<string, unknown>, @Headers('alipay-signature') signature = 'mock-signature'): unknown {
    return this.receive('alipay', body, signature);
  }

  @Post('wechat-mp')
  wechatMp(@Body() body: Record<string, unknown>, @Headers('x-wx-signature') signature = 'mock-signature'): unknown {
    return this.receive('wechat-mp', body, signature);
  }

  @Post('flush')
  async flush(): Promise<unknown> {
    return { code: 'OK', data: await this.emitter.flush(), message: 'Webhook emitter flushed', traceId: crypto.randomUUID() };
  }

  private receive(provider: Provider, body: Record<string, unknown>, signature: string): Record<string, unknown> {
    const traceId = crypto.randomUUID();
    const eventId = this.eventId(provider, body);
    if (this.processed.has(eventId)) {
      return { code: 'OK', data: { deduped: true, eventId, provider }, message: 'Webhook already processed', traceId };
    }
    this.verifySignature(provider, body, signature);
    const job = { body, eventId, id: crypto.randomUUID(), provider, receivedAt: new Date().toISOString(), status: 'queued', traceId };
    this.queue.push(job);
    this.processed.add(eventId);
    this.inboundAudit.push({ action: 'webhook.received', eventId, provider, traceId });
    this.emitter.enqueue({ body: { eventId, provider, receivedAt: job.receivedAt, status: 'accepted' } });
    return { code: 'OK', data: job, message: 'Webhook accepted', traceId };
  }

  private eventId(provider: Provider, body: Record<string, unknown>): string {
    const raw = body.eventId ?? body.out_trade_no ?? body.transaction_id ?? body.msg_id ?? JSON.stringify(body);
    return `${provider}:${String(raw)}`;
  }

  private verifySignature(provider: Provider, body: Record<string, unknown>, signature: string): void {
    const mock = signature === 'mock-signature' || signature === 'MOCK';
    if (mock) return;
    const secret = process.env[provider === 'alipay' ? 'ALIPAY_WEBHOOK_SECRET' : provider === 'wechat-pay' ? 'WECHAT_PAY_WEBHOOK_SECRET' : 'WECHAT_MP_WEBHOOK_SECRET'];
    if (!secret || secret.includes('PLACEHOLDER')) return;
    const expected = createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
    if (expected !== signature) throw new Error('WEBHOOK.SIGNATURE_INVALID');
  }
}
