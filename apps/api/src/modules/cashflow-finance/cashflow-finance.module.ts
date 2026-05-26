import { Module } from '@nestjs/common';

import { NotificationModule } from '../notification/notification.module.js';

import { CashflowFinanceController } from './cashflow-finance.controller.js';
import { CashflowFinanceService } from './cashflow-finance.service.js';
import { MultiChannelReminderService } from './multi-channel-reminder.service.js';

@Module({
  controllers: [CashflowFinanceController],
  exports: [CashflowFinanceService, MultiChannelReminderService],
  imports: [NotificationModule],
  providers: [CashflowFinanceService, MultiChannelReminderService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CashflowFinanceModule {}
