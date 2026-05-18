import { Module } from '@nestjs/common';

import { CreditController } from './credit.controller.js';
import { CreditService } from './credit.service.js';
import { ExpiryWorker } from './expiry/expiry.worker.js';
import { GiftService } from './gift/gift.service.js';
import { CreditLogService } from './log/credit-log.service.js';
import { LotAllocatorService } from './lot/lot-allocator.service.js';
import { LotService } from './lot/lot.service.js';
import { CommitService } from './preCharge/commit.service.js';
import { PreChargeService } from './preCharge/pre-charge.service.js';
import { RefundService } from './preCharge/refund.service.js';
import { CreditReactivationService } from './reactivation/reactivation.service.js';
import { TopupPackageService } from './topup/topup-package.service.js';
import { TopupService } from './topup/topup.service.js';

@Module({
  controllers: [CreditController],
  exports: [CommitService, CreditReactivationService, CreditService, GiftService, PreChargeService, RefundService],
  providers: [
    CommitService,
    CreditLogService,
    CreditReactivationService,
    CreditService,
    ExpiryWorker,
    GiftService,
    LotAllocatorService,
    LotService,
    PreChargeService,
    RefundService,
    TopupPackageService,
    TopupService,
  ],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CreditModule {}
