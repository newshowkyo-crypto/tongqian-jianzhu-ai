import { Injectable, Logger } from '@nestjs/common';
import type { NotificationView } from '@tongqian/types';

import type { NotificationChannelDriver, NotificationDeliveryInput, NotificationOutboxEntry } from '../notification-channel.types.js';

@Injectable()
export class InboxChannel implements NotificationChannelDriver {
  readonly channel = 'inbox' as const;
  private readonly auditLog: Array<Record<string, unknown>> = [];
  private readonly logger = new Logger(InboxChannel.name);
  private readonly outbox: NotificationOutboxEntry[] = [];
  private readonly websocketSessions = new Map<string, { connectedAt: string; lastSeenAt: string; sessionId: string }[]>();

  send(input: NotificationDeliveryInput): NotificationView {
    const now = new Date().toISOString();
    const externalId = `inbox-${crypto.randomUUID()}`;
    const delivery: NotificationView = {
      channel: this.channel,
      content: {
        ...input.content,
        deliveryMode: 'inbox-websocket',
        mockProvider: false,
        websocketFanout: this.websocketSessions.get(input.userId)?.length ?? 0,
      },
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
    this.outbox.push({ channel: this.channel, createdAt: now, externalId, id: crypto.randomUUID(), payload: delivery.content, status: 'real_sent', traceId: input.traceId });
    this.audit('notification.inbox.sent', { externalId, scenario: input.scenario, userId: input.userId });
    this.logger.log(`notification.inbox.sent user=${input.userId} trace=${input.traceId}`);
    return delivery;
  }

  attachSession(userId: string, sessionId: string): { sessionCount: number; userId: string } {
    const sessions = this.websocketSessions.get(userId) ?? [];
    const now = new Date().toISOString();
    this.websocketSessions.set(userId, [...sessions.filter((item) => item.sessionId !== sessionId), { connectedAt: now, lastSeenAt: now, sessionId }]);
    this.audit('notification.inbox.ws.attach', { sessionId, userId });
    return { sessionCount: this.websocketSessions.get(userId)?.length ?? 0, userId };
  }

  detachSession(userId: string, sessionId: string): { sessionCount: number; userId: string } {
    const sessions = (this.websocketSessions.get(userId) ?? []).filter((item) => item.sessionId !== sessionId);
    this.websocketSessions.set(userId, sessions);
    this.audit('notification.inbox.ws.detach', { sessionId, userId });
    return { sessionCount: sessions.length, userId };
  }

  listOutbox(): NotificationOutboxEntry[] {
    return [...this.outbox];
  }

  listAudit(): Array<Record<string, unknown>> {
    return [...this.auditLog];
  }

  private audit(action: string, detail: Record<string, unknown>): void {
    this.auditLog.push({ action, at: new Date().toISOString(), detail, id: crypto.randomUUID() });
  }
}
