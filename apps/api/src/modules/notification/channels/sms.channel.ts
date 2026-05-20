import { Injectable, Logger } from '@nestjs/common';
import type { NotificationView } from '@tongqian/types';

import type { NotificationChannelDriver, NotificationDeliveryInput, NotificationOutboxEntry } from '../notification-channel.types.js';

@Injectable()
export class SmsChannel implements NotificationChannelDriver {
  readonly channel = 'sms' as const;
  private readonly auditLog: Array<Record<string, unknown>> = [];
  private readonly logger = new Logger(SmsChannel.name);
  private readonly outbox: NotificationOutboxEntry[] = [];

  send(input: NotificationDeliveryInput): NotificationView {
    const mock = !this.hasRealCredential();
    const now = new Date().toISOString();
    const externalId = `${mock ? 'mock-sms' : 'aliyun-sms'}-${crypto.randomUUID()}`;
    const payload = this.buildSms(input, mock);
    this.outbox.push({ channel: this.channel, createdAt: now, externalId, id: crypto.randomUUID(), payload, status: mock ? 'mock_sent' : 'real_sent', traceId: input.traceId });
    this.audit('notification.sms.sent', { externalId, mock, phoneMasked: payload.phoneMasked, scenario: input.scenario, userId: input.userId });
    this.logger.log(`notification.sms.${mock ? 'mock' : 'real'} user=${input.userId} trace=${input.traceId}`);
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

  estimateCost(input: NotificationDeliveryInput): { segments: number; yuan: number } {
    const text = this.renderText(input);
    const segments = Math.max(1, Math.ceil(text.length / 67));
    return { segments, yuan: Number((segments * 0.045).toFixed(3)) };
  }

  listOutbox(): NotificationOutboxEntry[] {
    return [...this.outbox];
  }

  listAudit(): Array<Record<string, unknown>> {
    return [...this.auditLog];
  }

  private buildSms(input: NotificationDeliveryInput, mock: boolean): Record<string, unknown> {
    const phone = String(input.content.phone ?? '13800000000');
    const text = this.renderText(input);
    const cost = this.estimateCost(input);
    return {
      mockProvider: mock,
      phoneMasked: `${phone.slice(0, 3)}****${phone.slice(-4)}`,
      signName: process.env.ALIYUN_SMS_SIGN_NAME ?? '同乾方略',
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE ?? 'MOCK_SMS_TEMPLATE',
      templateParam: { scenario: input.scenario, summary: text.slice(0, 48), traceId: input.traceId },
      text,
      ...cost,
    };
  }

  private renderText(input: NotificationDeliveryInput): string {
    return String(input.content.smsText ?? input.content.message ?? `notification.${input.scenario}.sms`);
  }

  private hasRealCredential(): boolean {
    return ['ALIYUN_SMS_ACCESS_KEY_ID', 'ALIYUN_SMS_ACCESS_KEY_SECRET'].every((key) => {
      const value = process.env[key];
      return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('REPLACE'));
    });
  }

  private audit(action: string, detail: Record<string, unknown>): void {
    this.auditLog.push({ action, at: new Date().toISOString(), detail, id: crypto.randomUUID() });
  }
}
