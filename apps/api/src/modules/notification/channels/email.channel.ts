import { Injectable, Logger } from '@nestjs/common';
import type { NotificationView } from '@tongqian/types';

import type { NotificationChannelDriver, NotificationDeliveryInput, NotificationOutboxEntry } from '../notification-channel.types.js';

@Injectable()
export class EmailChannel implements NotificationChannelDriver {
  readonly channel = 'email' as const;
  private readonly auditLog: Array<Record<string, unknown>> = [];
  private readonly logger = new Logger(EmailChannel.name);
  private readonly outbox: NotificationOutboxEntry[] = [];

  send(input: NotificationDeliveryInput): NotificationView {
    const mock = !this.hasRealCredential();
    const now = new Date().toISOString();
    const externalId = `${mock ? 'mock-email' : 'smtp'}-${crypto.randomUUID()}`;
    const payload = this.buildMail(input, mock);
    this.outbox.push({ channel: this.channel, createdAt: now, externalId, id: crypto.randomUUID(), payload, status: mock ? 'mock_sent' : 'real_sent', traceId: input.traceId });
    this.audit('notification.email.sent', { externalId, mock, scenario: input.scenario, toMasked: payload.toMasked, userId: input.userId });
    this.logger.log(`notification.email.${mock ? 'mock' : 'real'} user=${input.userId} trace=${input.traceId}`);
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

  renderPreview(input: NotificationDeliveryInput): { html: string; subject: string; text: string } {
    const payload = this.buildMail(input, !this.hasRealCredential());
    return { html: String(payload.html), subject: String(payload.subject), text: String(payload.text) };
  }

  listOutbox(): NotificationOutboxEntry[] {
    return [...this.outbox];
  }

  listAudit(): Array<Record<string, unknown>> {
    return [...this.auditLog];
  }

  private buildMail(input: NotificationDeliveryInput, mock: boolean): Record<string, unknown> {
    const to = String(input.content.email ?? 'demo@tongqian.example.com');
    const subject = String(input.content.subject ?? `notification.${input.scenario}.subject`);
    const text = String(input.content.emailText ?? input.content.message ?? `notification.${input.scenario}.email`);
    const html = `<main><h1>${this.escape(subject)}</h1><p>${this.escape(text)}</p><small>trace: ${input.traceId}</small></main>`;
    return {
      from: process.env.SMTP_FROM ?? 'noreply@tongqian.example.com',
      html,
      mockProvider: mock,
      smtpHost: this.mask(process.env.SMTP_HOST),
      subject,
      text,
      toMasked: this.maskEmail(to),
    };
  }

  private hasRealCredential(): boolean {
    return ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'].every((key) => {
      const value = process.env[key];
      return Boolean(value && !value.includes('PLACEHOLDER') && !value.includes('REPLACE'));
    });
  }

  private escape(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }

  private mask(value?: string): string {
    if (!value || value.includes('PLACEHOLDER')) return 'MOCK';
    return `${value.slice(0, 3)}***`;
  }

  private maskEmail(email: string): string {
    const [name = 'user', domain] = email.split('@');
    return `${name.slice(0, 2)}***@${domain ?? 'example.com'}`;
  }

  private audit(action: string, detail: Record<string, unknown>): void {
    this.auditLog.push({ action, at: new Date().toISOString(), detail, id: crypto.randomUUID() });
  }
}
