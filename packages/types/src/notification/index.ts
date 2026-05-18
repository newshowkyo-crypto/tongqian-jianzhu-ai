export type NotificationChannel = 'desktop' | 'email' | 'inbox' | 'sms' | 'wechat_mp' | 'work_wechat';

export type NotificationLevel = 'critical' | 'high' | 'low' | 'normal';

export type NotificationStatus = 'delivered' | 'failed' | 'queued' | 'read' | 'sent';

export interface NotificationPreferenceView {
  desktopEnabled: boolean;
  emailEnabled: boolean;
  inboxEnabled: boolean;
  smsEnabled: boolean;
  userId: string;
  wechatMpEnabled: boolean;
  workWechatEnabled: boolean;
}

export interface NotificationTemplateView {
  id: string;
  isActive: boolean;
  level: NotificationLevel;
  scenario: string;
  templates: Partial<Record<NotificationChannel, string>>;
}

export interface NotificationView {
  channel: NotificationChannel;
  content: Record<string, unknown>;
  createdAt: string;
  eventHash: string;
  externalId?: string;
  failureReason?: string;
  id: string;
  readAt?: string;
  scenario: string;
  sentAt?: string;
  status: NotificationStatus;
  traceId: string;
  userId: string;
}

export interface NotificationSendResult {
  deduped: boolean;
  downgraded: boolean;
  notifications: NotificationView[];
  throttled: boolean;
}
