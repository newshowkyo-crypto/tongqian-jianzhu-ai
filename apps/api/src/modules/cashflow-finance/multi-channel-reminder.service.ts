import { Inject, Injectable } from '@nestjs/common';
import type { NotificationChannel } from '@tongqian/types';

import { NotificationDispatcherService } from '../notification/dispatcher.service.js';

type ReminderInput = {
  amountCny: number;
  debtorName: string;
  receivableId: string;
  tenantId: string;
};

@Injectable()
export class MultiChannelReminderService {
  constructor(@Inject(NotificationDispatcherService) private readonly dispatcher: NotificationDispatcherService) {}

  send(input: ReminderInput): { channels: NotificationChannel[]; downgraded: boolean; reminderId: string; sent: number } {
    const channels: NotificationChannel[] = ['inbox', 'work_wechat', 'email'];
    const result = this.dispatcher.dispatch({
      channels,
      content: {
        amountCny: input.amountCny,
        body: `${input.debtorName} 应收款已进入重点催收，请按合同节点跟进。`,
        title: '工程款催收提醒',
      },
      eventHash: `cashflow-reminder:${input.tenantId}:${input.receivableId}`,
      scenario: 'cashflow-reminder',
      traceId: crypto.randomUUID(),
      userId: 'cashflow-owner',
    });
    return { channels, downgraded: result.downgraded, reminderId: crypto.randomUUID(), sent: result.notifications.length };
  }
}
