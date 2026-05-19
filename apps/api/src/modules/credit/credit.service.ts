import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

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

  /**
   * Builds an account overview for dashboards with balance, warning, and FEFO allocation signals.
   *
   * @param userId User id.
   * @param tenantId Tenant id.
   * @returns Credit account overview.
   */
  overview(userId: string, tenantId: string): { accountId: string; alerts: string[]; balance: unknown; nextExpiryAt?: string; recommendedAllocation: string } {
    const account = this.lots.account(userId, tenantId);
    const lots = this.lots.activeLots(account.id);
    const nextExpiryAt = lots.find((lot) => lot.expiresAt)?.expiresAt;
    return {
      accountId: account.id,
      alerts: this.alerts(userId, tenantId),
      balance: this.balance(userId, tenantId),
      nextExpiryAt,
      recommendedAllocation: nextExpiryAt ? 'FEFO_USE_EXPIRING_LOTS_FIRST' : 'PBT_USE_PAID_BALANCE_FIRST',
    };
  }

  lotsFor(userId: string, tenantId: string): unknown[] {
    return this.lots.lots(this.lots.account(userId, tenantId).id);
  }

  logsFor(userId: string, tenantId: string): unknown[] {
    return this.logs.list(this.lots.account(userId, tenantId).id);
  }

  /**
   * Returns credit health warnings for low balance, frozen lots, and near expiry batches.
   *
   * @param userId User id.
   * @param tenantId Tenant id.
   * @returns Warning codes.
   */
  alerts(userId: string, tenantId: string): string[] {
    const account = this.lots.account(userId, tenantId);
    const lots = this.lots.lots(account.id);
    const warnings: string[] = [];
    if (account.totalBalance < 100) warnings.push('credit.low_balance');
    if (lots.some((lot) => lot.frozenUntil && new Date(lot.frozenUntil) > new Date())) warnings.push('credit.frozen_lot');
    if (lots.some((lot) => lot.expiresAt && new Date(lot.expiresAt).getTime() - Date.now() < 14 * 24 * 60 * 60_000 && lot.remainingAmount > 0)) warnings.push('credit.expiring_soon');
    return warnings;
  }

  preCharge(input: Parameters<PreChargeService['preCharge']>[0]): unknown {
    if (input.amount <= 0) throw this.invalidAmount(input.amount);
    return this.preChargeService.preCharge(input);
  }

  commit(input: Parameters<CommitService['commit']>[0]): unknown {
    return this.commitService.commit(input);
  }

  refund(input: Parameters<RefundService['refund']>[0]): unknown {
    return this.refundService.refund(input);
  }

  gift(input: Parameters<GiftService['gift']>[0]): unknown {
    if (input.amount <= 0) throw this.invalidAmount(input.amount);
    return this.giftService.gift(input);
  }

  topup(input: Parameters<TopupService['topup']>[0]): unknown {
    return this.topupService.topup(input);
  }

  private invalidAmount(amount: number): BusinessError {
    return new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { amount }, message: 'Credit amount must be positive.' });
  }
}
