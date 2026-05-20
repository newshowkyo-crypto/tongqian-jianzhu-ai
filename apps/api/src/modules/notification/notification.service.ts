import { Inject, Injectable } from '@nestjs/common';
import type { NotificationChannel, NotificationLevel, NotificationPreferenceView, NotificationSendResult, NotificationTemplateView, NotificationView } from '@tongqian/types';

import { NotificationDispatcherService } from './dispatcher.service.js';
import { NotificationThrottleService } from './throttle.service.js';

const DEFAULT_TEMPLATES: NotificationTemplateView[] = [
  'subscription_renew',
  'qualification_expiring',
  'risk_red_light',
  'agent_dispatch',
  'score_reminder',
  'monthly_report',
  'growth_battle_report',
  'policy_flash',
  'tender_deadline',
  'onboarding_welcome',
].map((scenario, index) => ({
  id: `template-${scenario}`,
  isActive: true,
  level: index < 2 ? 'critical' : index < 5 ? 'high' : 'normal',
  scenario,
  templates: {
    desktop: `notification.${scenario}.desktop`,
    email: `notification.${scenario}.email`,
    inbox: `notification.${scenario}.inbox`,
    sms: `notification.${scenario}.sms`,
    wechat_mp: `notification.${scenario}.wechatMp`,
    work_wechat: `notification.${scenario}.workWechat`,
  },
}));

@Injectable()
export class NotificationService {
  private readonly sentHashes = new Set<string>();
  private readonly notifications = new Map<string, NotificationView>();
  private readonly preferences = new Map<string, NotificationPreferenceView>();
  private readonly templates = new Map(DEFAULT_TEMPLATES.map((template) => [template.scenario, template]));
  private readonly userDaily = new Map<string, string[]>();
  private readonly urgencyDaily = new Map<string, string[]>();
  private readonly scoreOrder = new Set<string>();

  constructor(
    @Inject(NotificationDispatcherService) private readonly dispatcher: NotificationDispatcherService,
    @Inject(NotificationThrottleService) private readonly throttle: NotificationThrottleService,
  ) {}

  send(input: { channels?: NotificationChannel[]; eventId: string; payload: Record<string, unknown>; role?: 'GOV_USER' | 'USER'; scenario: string; userId: string }): NotificationSendResult {
    const template = this.templates.get(input.scenario) ?? this.seedTemplate(input.scenario, 'normal');
    const eventHash = this.hash(`${input.userId}:${input.scenario}:${input.eventId}`);
    if (this.sentHashes.has(eventHash)) return { deduped: true, downgraded: false, notifications: [], throttled: false };
    const throttle = this.checkThrottle(input.userId, input.scenario, input.eventId, eventHash);
    if (throttle.throttled) return { deduped: false, downgraded: false, notifications: [], throttled: true };
    const preference = this.getPreference(input.userId);
    const channels = this.resolveChannels(template.level, input.channels, preference, input.role);
    const traceId = crypto.randomUUID();
    const dispatched = this.dispatcher.dispatch({ channels, content: input.payload, eventHash, scenario: input.scenario, traceId, userId: input.userId });
    const notifications = dispatched.notifications;
    notifications.forEach((item) => this.notifications.set(item.id, item));
    this.sentHashes.add(eventHash);
    this.throttle.commit(eventHash);
    return { deduped: false, downgraded: dispatched.downgraded || channels.length < this.fallbackChain(template.level).length, notifications, throttled: false };
  }

  list(userId: string): NotificationView[] {
    return [...this.notifications.values()].filter((item) => item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  markRead(userId: string, id: string): NotificationView {
    const item = this.notifications.get(id);
    if (!item || item.userId !== userId) throw new Error('NOTIF.CHANNEL.UNAVAILABLE');
    const next = { ...item, readAt: new Date().toISOString(), status: 'read' as const };
    this.notifications.set(id, next);
    return next;
  }

  getPreference(userId: string): NotificationPreferenceView {
    const current = this.preferences.get(userId) ?? {
      desktopEnabled: true,
      emailEnabled: false,
      inboxEnabled: true,
      smsEnabled: true,
      userId,
      wechatMpEnabled: true,
      workWechatEnabled: true,
    };
    this.preferences.set(userId, current);
    return current;
  }

  setPreference(userId: string, preference: Partial<NotificationPreferenceView>, role?: 'GOV_USER' | 'USER'): NotificationPreferenceView {
    const current = this.getPreference(userId);
    const next = { ...current, ...preference, userId };
    if (role === 'GOV_USER') {
      next.wechatMpEnabled = false;
      next.workWechatEnabled = false;
      next.smsEnabled = false;
      next.desktopEnabled = false;
    }
    this.preferences.set(userId, next);
    return next;
  }

  upsertTemplate(input: { level: NotificationLevel; scenario: string; templates: Partial<Record<NotificationChannel, string>> }): NotificationTemplateView {
    const template: NotificationTemplateView = {
      id: this.templates.get(input.scenario)?.id ?? `template-${input.scenario}`,
      isActive: true,
      level: input.level,
      scenario: input.scenario,
      templates: { inbox: `notification.${input.scenario}.inbox`, ...input.templates },
    };
    this.templates.set(input.scenario, template);
    return template;
  }

  stats(): Record<string, unknown> {
    const all = [...this.notifications.values()];
    const sent = all.filter((item) => item.status === 'sent' || item.status === 'read').length;
    const read = all.filter((item) => item.status === 'read').length;
    return {
      channelCounts: all.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.channel]: (acc[item.channel] ?? 0) + 1 }), {}),
      readRate: sent === 0 ? 0 : read / sent,
      sent,
      throttle: this.throttle.stats('mock-user'),
      transport: this.dispatcher.channelHealth(),
      templates: this.templates.size,
      total: all.length,
    };
  }

  outbox(): unknown[] {
    return this.dispatcher.outbox();
  }

  private resolveChannels(level: NotificationLevel, requested: NotificationChannel[] | undefined, preference: NotificationPreferenceView, role?: 'GOV_USER' | 'USER'): NotificationChannel[] {
    const chain = requested ?? this.fallbackChain(level);
    const roleSafe = role === 'GOV_USER' ? chain.filter((channel) => channel === 'inbox' || channel === 'email') : chain;
    return roleSafe.filter((channel) => this.channelEnabled(channel, preference));
  }

  private fallbackChain(level: NotificationLevel): NotificationChannel[] {
    if (level === 'critical') return ['sms', 'inbox', 'desktop', 'email'];
    if (level === 'high') return ['inbox', 'wechat_mp', 'work_wechat', 'desktop', 'email'];
    if (level === 'normal') return ['inbox', 'wechat_mp'];
    return ['inbox'];
  }

  private channelEnabled(channel: NotificationChannel, preference: NotificationPreferenceView): boolean {
    const key = `${channel.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())}Enabled` as keyof NotificationPreferenceView;
    return Boolean(preference[key]);
  }

  private checkThrottle(userId: string, scenario: string, eventId: string, eventHash: string): { throttled: boolean } {
    const global = this.throttle.check({ eventHash, eventId, scenario, userId });
    if (global.throttled) return { throttled: true };
    const today = new Date().toISOString().slice(0, 10);
    const systemKey = `${userId}:${today}`;
    const system = this.userDaily.get(systemKey) ?? [];
    if (system.length >= 50) return { throttled: true };
    this.userDaily.set(systemKey, [...system, scenario]);
    if (scenario.includes('urgency')) {
      const urgency = this.urgencyDaily.get(systemKey) ?? [];
      if (urgency.length >= 3) return { throttled: true };
      this.urgencyDaily.set(systemKey, [...urgency, eventId]);
    }
    if (scenario === 'score_reminder') {
      if (this.scoreOrder.has(eventId)) return { throttled: true };
      this.scoreOrder.add(eventId);
    }
    return { throttled: false };
  }

  private seedTemplate(scenario: string, level: NotificationLevel): NotificationTemplateView {
    return this.upsertTemplate({ level, scenario, templates: { inbox: `notification.${scenario}.inbox` } });
  }

  private hash(value: string): string {
    return [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7).toString(16);
  }
}
