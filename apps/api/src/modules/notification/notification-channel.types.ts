import type { NotificationChannel, NotificationView } from '@tongqian/types';

export interface NotificationDeliveryInput {
  channel: NotificationChannel;
  content: Record<string, unknown>;
  eventHash: string;
  scenario: string;
  traceId: string;
  userId: string;
}

export interface NotificationChannelDriver {
  readonly channel: NotificationChannel;
  send(input: NotificationDeliveryInput): NotificationView;
}

export interface NotificationOutboxEntry {
  channel: NotificationChannel;
  createdAt: string;
  externalId: string;
  id: string;
  payload: Record<string, unknown>;
  status: 'mock_sent' | 'real_sent' | 'queued';
  traceId: string;
}
