import { Module } from '@nestjs/common';

import { WebhookEmitterService } from './webhook-emitter.service.js';
import { WebhookReceiverController } from './webhook-receiver.controller.js';

@Module({
  controllers: [WebhookReceiverController],
  exports: [WebhookEmitterService],
  providers: [WebhookEmitterService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class WebhookModule {}
