import { Inject, Injectable, Logger } from '@nestjs/common';
import type { NotificationChannel, NotificationView } from '@tongqian/types';

import { DesktopChannel } from './channels/desktop.channel.js';
import { EmailChannel } from './channels/email.channel.js';
import { InboxChannel } from './channels/inbox.channel.js';
import { SmsChannel } from './channels/sms.channel.js';
import { WechatMpChannel } from './channels/wechat-mp.channel.js';
import { WechatWorkChannel } from './channels/wechat-work.channel.js';
import type { NotificationChannelDriver, NotificationDeliveryInput, NotificationOutboxEntry } from './notification-channel.types.js';

@Injectable()
export class NotificationDispatcherService {
  private readonly failures: Array<Record<string, unknown>> = [];
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    @Inject(DesktopChannel) private readonly desktop: DesktopChannel,
    @Inject(EmailChannel) private readonly email: EmailChannel,
    @Inject(InboxChannel) private readonly inbox: InboxChannel,
    @Inject(SmsChannel) private readonly sms: SmsChannel,
    @Inject(WechatMpChannel) private readonly wechatMp: WechatMpChannel,
    @Inject(WechatWorkChannel) private readonly wechatWork: WechatWorkChannel,
  ) {}

  dispatch(input: Omit<NotificationDeliveryInput, 'channel'> & { channels: NotificationChannel[] }): { downgraded: boolean; notifications: NotificationView[] } {
    const delivered: NotificationView[] = [];
    for (const channel of input.channels) {
      try {
        delivered.push(this.driver(channel).send({ ...input, channel }));
      } catch (error) {
        this.failures.push({ channel, error: error instanceof Error ? error.message : String(error), eventHash: input.eventHash, at: new Date().toISOString() });
        this.logger.warn(`notification.dispatch.failed channel=${channel} trace=${input.traceId}`);
        const fallback = this.fallback(channel, input.channels);
        if (fallback && !delivered.some((item) => item.channel === fallback)) {
          delivered.push(this.driver(fallback).send({ ...input, channel: fallback, content: { ...input.content, fallbackFrom: channel } }));
        }
      }
    }
    return { downgraded: delivered.length < input.channels.length || delivered.some((item) => Boolean(item.content.fallbackFrom)), notifications: delivered };
  }

  channelHealth(): Record<NotificationChannel, { mode: 'mock-ready' | 'real-ready'; outbox: number }> {
    return {
      desktop: { mode: 'mock-ready', outbox: this.desktop.listOutbox().length },
      email: { mode: 'mock-ready', outbox: this.email.listOutbox().length },
      inbox: { mode: 'real-ready', outbox: this.inbox.listOutbox().length },
      sms: { mode: 'mock-ready', outbox: this.sms.listOutbox().length },
      wechat_mp: { mode: 'mock-ready', outbox: this.wechatMp.listOutbox().length },
      work_wechat: { mode: 'mock-ready', outbox: this.wechatWork.listOutbox().length },
    };
  }

  outbox(): NotificationOutboxEntry[] {
    return [
      ...this.desktop.listOutbox(),
      ...this.email.listOutbox(),
      ...this.inbox.listOutbox(),
      ...this.sms.listOutbox(),
      ...this.wechatMp.listOutbox(),
      ...this.wechatWork.listOutbox(),
    ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  failureLog(): Array<Record<string, unknown>> {
    return [...this.failures];
  }

  private driver(channel: NotificationChannel): NotificationChannelDriver {
    return {
      desktop: this.desktop,
      email: this.email,
      inbox: this.inbox,
      sms: this.sms,
      wechat_mp: this.wechatMp,
      work_wechat: this.wechatWork,
    }[channel];
  }

  private fallback(channel: NotificationChannel, requested: NotificationChannel[]): NotificationChannel | undefined {
    const chain: NotificationChannel[] = channel === 'sms' ? ['inbox', 'email'] : channel === 'wechat_mp' || channel === 'work_wechat' ? ['inbox', 'desktop'] : ['inbox'];
    return chain.find((candidate) => requested.includes(candidate) || candidate === 'inbox');
  }
}
