import { Injectable, Logger } from '@nestjs/common';
import type { NotificationView } from '@tongqian/types';

import type { NotificationChannelDriver, NotificationDeliveryInput, NotificationOutboxEntry } from '../notification-channel.types.js';

@Injectable()
export class DesktopChannel implements NotificationChannelDriver {
  readonly channel = 'desktop' as const;
  private readonly auditLog: Array<Record<string, unknown>> = [];
  private readonly deviceTokens = new Map<string, { lastSeenAt: string; token: string }[]>();
  private readonly logger = new Logger(DesktopChannel.name);
  private readonly outbox: NotificationOutboxEntry[] = [];

  send(input: NotificationDeliveryInput): NotificationView {
    const mock = !this.hasRealBridge(input.userId);
    const now = new Date().toISOString();
    const externalId = `${mock ? 'mock-desktop' : 'tauri'}-${crypto.randomUUID()}`;
    const payload = this.buildDesktopPayload(input, mock);
    this.outbox.push({ channel: this.channel, createdAt: now, externalId, id: crypto.randomUUID(), payload, status: mock ? 'mock_sent' : 'real_sent', traceId: input.traceId });
    this.audit('notification.desktop.sent', { deviceCount: payload.deviceCount, externalId, mock, scenario: input.scenario, userId: input.userId });
    this.logger.log(`notification.desktop.${mock ? 'mock' : 'real'} user=${input.userId} trace=${input.traceId}`);
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

  registerDevice(userId: string, token: string): { deviceCount: number; userId: string } {
    const devices = this.deviceTokens.get(userId) ?? [];
    this.deviceTokens.set(userId, [...devices.filter((device) => device.token !== token), { lastSeenAt: new Date().toISOString(), token }].slice(-5));
    this.audit('notification.desktop.device.register', { tokenMasked: `${token.slice(0, 4)}***`, userId });
    return { deviceCount: this.deviceTokens.get(userId)?.length ?? 0, userId };
  }

  listOutbox(): NotificationOutboxEntry[] {
    return [...this.outbox];
  }

  listAudit(): Array<Record<string, unknown>> {
    return [...this.auditLog];
  }

  private buildDesktopPayload(input: NotificationDeliveryInput, mock: boolean): Record<string, unknown> {
    const devices = this.deviceTokens.get(input.userId) ?? [];
    return {
      body: String(input.content.body ?? input.content.message ?? `notification.${input.scenario}.desktop.body`),
      deepLink: input.content.deepLink ?? 'tongqian://notifications',
      deviceCount: devices.length,
      mockProvider: mock,
      requireInteraction: input.scenario.includes('risk') || input.scenario.includes('approval'),
      silent: false,
      tauriEvent: 'tongqian-notification',
      title: String(input.content.title ?? `notification.${input.scenario}.desktop.title`),
      traceId: input.traceId,
    };
  }

  private hasRealBridge(userId: string): boolean {
    return (this.deviceTokens.get(userId)?.length ?? 0) > 0 && process.env.TAURI_PUSH_ENABLED === 'true';
  }

  private audit(action: string, detail: Record<string, unknown>): void {
    this.auditLog.push({ action, at: new Date().toISOString(), detail, id: crypto.randomUUID() });
  }
}
