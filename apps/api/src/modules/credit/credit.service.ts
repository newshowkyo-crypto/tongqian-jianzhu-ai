import { Inject, Injectable } from '@nestjs/common';

import { GiftService } from './gift/gift.service.js';
import { CreditLogService } from './log/credit-log.service.js';
import { LotService } from './lot/lot.service.js';
import { CommitService } from './preCharge/commit.service.js';
import { PreChargeService } from './preCharge/pre-charge.service.js';
import { RefundService } from './preCharge/refund.service.js';
import { TopupService } from './topup/topup.service.js';

@Injectable()
export class CreditService {
  constructor(
    @Inject(CommitService) private readonly commitService: CommitService,
    @Inject(GiftService) private readonly giftService: GiftService,
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
    @Inject(PreChargeService) private readonly preChargeService: PreChargeService,
    @Inject(RefundService) private readonly refundService: RefundService,
    @Inject(TopupService) private readonly topupService: TopupService,
  ) {}

  balance(userId: string, tenantId: string): unknown {
    const account = this.lots.account(userId, tenantId);
    const lots = this.lots.lots(account.id);
    return {
      giftCredits: lots.filter((lot) => lot.sourceType === 'gift').reduce((sum, lot) => sum + lot.remainingAmount, 0),
      subscriptionCredits: lots.filter((lot) => lot.sourceType === 'subscription').reduce((sum, lot) => sum + lot.remainingAmount, 0),
      topUpCredits: lots.filter((lot) => lot.sourceType === 'topup').reduce((sum, lot) => sum + lot.remainingAmount, 0),
      totalAvailableCredits: account.totalBalance,
    };
  }

  lotsFor(userId: string, tenantId: string): unknown[] {
    return this.lots.lots(this.lots.account(userId, tenantId).id);
  }

  logsFor(userId: string, tenantId: string): unknown[] {
    return this.logs.list(this.lots.account(userId, tenantId).id);
  }

  preCharge(input: Parameters<PreChargeService['preCharge']>[0]): unknown {
    return this.preChargeService.preCharge(input);
  }

  commit(input: Parameters<CommitService['commit']>[0]): unknown {
    return this.commitService.commit(input);
  }

  refund(input: Parameters<RefundService['refund']>[0]): unknown {
    return this.refundService.refund(input);
  }

  gift(input: Parameters<GiftService['gift']>[0]): unknown {
    return this.giftService.gift(input);
  }

  topup(input: Parameters<TopupService['topup']>[0]): unknown {
    return this.topupService.topup(input);
  }
}
