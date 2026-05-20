import { Injectable, Logger } from '@nestjs/common';
import type { NotificationView } from '@tongqian/types';

import type { NotificationChannelDriver, NotificationDeliveryInput, NotificationOutboxEntry } from '../notification-channel.types.js';

@Injectable()
export class WechatWorkChannel implements NotificationChannelDriver {
  readonly channel = 'work_wechat' as const;
  private readonly auditLog: Array<Record<string, unknown>> = [];
  private readonly logger = new Logger(WechatWorkChannel.name);
  private readonly outbox: NotificationOutboxEntry[] = [];

  send(input: NotificationDeliveryInput): NotificationView {
    const mock = !this.hasRealCredential();
    const now = new Date().toISOString();
    const externalId = `${mock ? 'mock-work-wechat' : 'work-wechat'}-${crypto.randomUUID()}`;
    const payload = this.buildMessage(input, mock);
    this.outbox.push({ channel: this.channel, createdAt: now, externalId, id: crypto.randomUUID(), payload, status: mock ? 'mock_sent' : 'real_sent', traceId: input.traceId });
    this.audit('notification.work_wechat.sent', { externalId, mock, scenario: input.scenario, userId: input.userId });
    this.logger.log(`notification.work_wechat.${mock ? 'mock' : 'real'} user=${input.userId} trace=${input.traceId}`);
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

  buildRobotCard(input: NotificationDeliveryInput): Record<string, unknown> {
    return this.buildMessage(input, !this.hasRealCredential());
  }

  listOutbox(): NotificationOutboxEntry[] {
    return [...this.outbox];
  }

  listAudit(): Array<Record<string, unknown>> {
    return [...this.auditLog];
  }

  private buildMessage(input: NotificationDeliveryInput, mock: boolean): Record<string, unknown> {
    const title = String(input.content.title ?? `notification.${input.scenario}.title`);
    const summary = String(input.content.summary ?? input.content.message ?? 'notification.workWechat.summary');
    return {
      agentId: this.mask(process.env.WECHAT_WORK_AGENT_ID),
      corpId: this.mask(process.env.WECHAT_WORK_CORP_ID),
      markdown: `**${title}**\n\n${summary}\n\n> trace: ${input.traceId}`,
      mockProvider: mock,
      msgtype: 'markdown',
      safe: 1,
      toUser: String(input.content.workWechatUserId ?? input.userId),
      url: input.content.url ?? 'https://tongqian.example.com/admin/notifications',
    };
  }

  private hasRealCredential(): boolean {
    return ['WECHAT_WORK_CORP_ID', 'WECHAT_WORK_SECRET', 'WECHAT_WORK_AGENT_ID'].every((key) => {
      const value = process.env[key];
      return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('REPLACE'));
    });
  }

  private mask(value?: string): string {
    if (!value || value.includes('PLACEHOLDER')) return 'MOCK';
    return `${value.slice(0, 4)}***${value.slice(-3)}`;
  }

  private audit(action: string, detail: Record<string, unknown>): void {
    this.auditLog.push({ action, at: new Date().toISOString(), detail, id: crypto.randomUUID() });
  }
}
