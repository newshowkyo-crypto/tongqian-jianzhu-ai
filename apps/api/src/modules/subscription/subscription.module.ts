import { Module } from '@nestjs/common';

import { AutoRenewalWorker } from './auto-renewal.worker.js';
import { ConciergeService } from './concierge.service.js';
import { DiscountRebateService } from './discount-rebate.service.js';
import { InvoiceController } from './invoice.controller.js';
import { InvoiceService } from './invoice.service.js';
import { LadderService } from './ladder.service.js';
import { PlanService } from './plans/plan.service.js';
import { SubscriptionController } from './subscription.controller.js';
import { SubscriptionService } from './subscription.service.js';

@Module({
  controllers: [InvoiceController, SubscriptionController],
  providers: [AutoRenewalWorker, ConciergeService, DiscountRebateService, InvoiceService, LadderService, PlanService, SubscriptionService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SubscriptionModule {}
