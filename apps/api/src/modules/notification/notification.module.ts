import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';

@Module({
  controllers: [NotificationController],
  exports: [NotificationService],
  providers: [NotificationService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NotificationModule {}
