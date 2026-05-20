import { Module } from '@nestjs/common';

import { DesktopChannel } from './channels/desktop.channel.js';
import { EmailChannel } from './channels/email.channel.js';
import { InboxChannel } from './channels/inbox.channel.js';
import { SmsChannel } from './channels/sms.channel.js';
import { WechatMpChannel } from './channels/wechat-mp.channel.js';
import { WechatWorkChannel } from './channels/wechat-work.channel.js';
import { NotificationDispatcherService } from './dispatcher.service.js';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import { NotificationThrottleService } from './throttle.service.js';

@Module({
  controllers: [NotificationController],
  exports: [NotificationDispatcherService, NotificationService, NotificationThrottleService],
  providers: [
    DesktopChannel,
    EmailChannel,
    InboxChannel,
    NotificationDispatcherService,
    NotificationService,
    NotificationThrottleService,
    SmsChannel,
    WechatMpChannel,
    WechatWorkChannel,
  ],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NotificationModule {}
