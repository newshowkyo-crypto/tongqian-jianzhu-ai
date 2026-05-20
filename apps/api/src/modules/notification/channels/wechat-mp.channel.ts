import { Injectable, Logger } from '@nestjs/common';
import type { NotificationView } from '@tongqian/types';

import type { NotificationChannelDriver, NotificationDeliveryInput, NotificationOutboxEntry } from '../notification-channel.types.js';

@Injectable()
export class WechatMpChannel implements NotificationChannelDriver {
  readonly channel = 'wechat_mp' as const;
  private readonly auditLog: Array<Record<string, unknown>> = [];
  private readonly logger = new Logger(WechatMpChannel.name);
  private readonly outbox: NotificationOutboxEntry[] = [];

  send(input: NotificationDeliveryInput): NotificationView {
    const mock = !this.hasRealCredential();
    const now = new Date().toISOString();
    const externalId = `${mock ? 'mock' : 'wxmp'}-${crypto.randomUUID()}`;
    const payload = this.buildTemplatePayload(input, mock);
    this.outbox.push({ channel: this.channel, createdAt: now, externalId, id: crypto.randomUUID(), payload, status: mock ? 'mock_sent' : 'real_sent', traceId: input.traceId });
    this.audit('notification.wechat_mp.sent', { externalId, mock, scenario: input.scenario, userId: input.userId });
    this.logger.log(`notification.wechat_mp.${mock ? 'mock' : 'real'} user=${input.userId} trace=${input.traceId}`);
    return {
      channel: this.channel,
      content: payload,
      createdAt: now,
      eventHash: input.eventHash,
      externalId,
      id: crypto.randomUUID(),
      scenario: input.scenario,
      sentAt: now,
      status: 'sent',
      traceId: input.traceId,
      userId: input.userId,
    };
  }

  preview(input: NotificationDeliveryInput): Record<string, unknown> {
    return this.buildTemplatePayload(input, !this.hasRealCredential());
  }

  listOutbox(): NotificationOutboxEntry[] {
    return [...this.outbox];
  }

  listAudit(): Array<Record<string, unknown>> {
    return [...this.auditLog];
  }

  private buildTemplatePayload(input: NotificationDeliveryInput, mock: boolean): Record<string, unknown> {
    return {
      appId: this.mask(process.env.WECHAT_MP_APP_ID),
      first: String(input.content.title ?? `notification.${input.scenario}.title`),
      keyword1: input.scenario,
      keyword2: new Date().toISOString(),
      keyword3: String(input.content.summary ?? input.content.message ?? 'notification.wechatMp.summary'),
      mockProvider: mock,
      openId: String(input.content.openId ?? `mock-openid-${input.userId}`),
      remark: 'notification.wechatMp.remark',
      templateId: String(input.content.templateId ?? process.env.WECHAT_MP_TEMPLATE_ID ?? 'MOCK_TEMPLATE'),
      url: input.content.url ?? 'https://tongqian.example.com/h5/reports/contract-review',
    };
  }

  private hasRealCredential(): boolean {
    return ['WECHAT_MP_APP_ID', 'WECHAT_MP_APP_SECRET'].every((key) => {
      const value = process.env[key];
      return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('REPLACE'));
    });
  }

  private mask(value?: string): string {
    if (!value || value.includes('PLACEHOLDER')) return 'MOCK';
    return `${value.slice(0, 4)}***${value.slice(-4)}`;
  }

  private audit(action: string, detail: Record<string, unknown>): void {
    this.auditLog.push({ action, at: new Date().toISOString(), detail, id: crypto.randomUUID() });
  }
}
