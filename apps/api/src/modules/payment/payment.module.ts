import { Module } from '@nestjs/common';

import { ApprovalModule } from '../approval/approval.module.js';

import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';

@Module({
  controllers: [PaymentController],
  exports: [PaymentService],
  imports: [ApprovalModule],
  providers: [PaymentService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PaymentModule {}
