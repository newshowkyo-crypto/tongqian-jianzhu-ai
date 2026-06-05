import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { CreditLog } from './credit-types.js';
import { CreditRepository } from './credit.repository.js';
import { GiftService } from './gift/gift.service.js';
import { CommitService, type CommitInput } from './preCharge/commit.service.js';
import { PreChargeService, type PreChargeRequest } from './preCharge/pre-charge.service.js';
import { RefundService, type RefundInput } from './preCharge/refund.service.js';
import { TopupService } from './topup/topup.service.js';

interface CreditBalance {
  giftCredits: number;
  subscriptionCredits: number;
  topUpCredits: number;
  totalAvailableCredits: number;
}

interface LotRow {
  expiresAt: Date | null;
  frozenUntil: Date | null;
  remainingAmount: number;
  sourceType: string;
}

@Injectable()
export class CreditService {
  constructor(
    @Inject(CreditRepository) private readonly repo: CreditRepository,
    @Inject(CommitService) private readonly commitService: CommitService,
    @Inject(GiftService) private readonly giftService: GiftService,
    @Inject(PreChargeService) private readonly preChargeService: PreChargeService,
    @Inject(RefundService) private readonly refundService: RefundService,
    @Inject(TopupService) private readonly topupService: TopupService,
  ) {}

  async balance(userId: string, tenantId: string): Promise<CreditBalance> {
    const lots = (await this.repo.listLots(userId, tenantId)) as unknown as LotRow[];
    const total = await this.repo.getBalance(userId, tenantId);
    return {
      giftCredits: lots.filter((l) => l.sourceType === 'gift').reduce((sum, l) => sum + l.remainingAmount, 0),
      subscriptionCredits: lots.filter((l) => l.sourceType === 'subscription').reduce((sum, l) => sum + l.remainingAmount, 0),
      topUpCredits: lots.filter((l) => l.sourceType === 'topup').reduce((sum, l) => sum + l.remainingAmount, 0),
      totalAvailableCredits: total,
    };
  }

  async overview(userId: string, tenantId: string): Promise<{ alerts: string[]; balance: CreditBalance; nextExpiryAt?: string; recommendedAllocation: string }> {
    const balance = await this.balance(userId, tenantId);
    const lots = (await this.repo.listLots(userId, tenantId)) as unknown as LotRow[];
    const now = new Date();
    const nextExpiry = lots
      .filter((l) => l.remainingAmount > 0 && l.expiresAt && l.expiresAt > now)
      .sort((a, b) => (a.expiresAt as Date).getTime() - (b.expiresAt as Date).getTime())[0]?.expiresAt;
    return {
      alerts: await this.alerts(userId, tenantId),
      balance,
      nextExpiryAt: nextExpiry ? nextExpiry.toISOString() : undefined,
      recommendedAllocation: nextExpiry ? 'FEFO_USE_EXPIRING_LOTS_FIRST' : 'PBT_USE_PAID_BALANCE_FIRST',
    };
  }

  async lotsFor(userId: string, tenantId: string): Promise<unknown[]> {
    return this.repo.listLots(userId, tenantId);
  }

  async logsFor(userId: string, tenantId: string): Promise<CreditLog[]> {
    return this.repo.listLogs(userId, tenantId);
  }

  async alerts(userId: string, tenantId: string): Promise<string[]> {
    const total = await this.repo.getBalance(userId, tenantId);
    const lots = (await this.repo.listLots(userId, tenantId)) as unknown as LotRow[];
    const now = new Date();
    const warnings: string[] = [];
    if (total < 100) warnings.push('credit.low_balance');
    if (lots.some((l) => l.frozenUntil && l.frozenUntil > now)) warnings.push('credit.frozen_lot');
    if (lots.some((l) => l.expiresAt && l.expiresAt.getTime() - now.getTime() < 14 * 24 * 60 * 60_000 && l.remainingAmount > 0)) warnings.push('credit.expiring_soon');
    return warnings;
  }

  async preCharge(input: PreChargeRequest): Promise<{ balanceAfter: number }> {
    if (input.amount <= 0) throw this.invalidAmount(input.amount);
    return this.preChargeService.preCharge(input);
  }

  async commit(input: CommitInput): Promise<{ balanceAfter: number; committed: true; traceId: string }> {
    return this.commitService.commit(input);
  }

  async refund(input: RefundInput): Promise<{ balanceAfter: number; refunded: true; traceId: string }> {
    return this.refundService.refund(input);
  }

  async gift(input: Parameters<GiftService['gift']>[0]): Promise<{ balanceAfter: number }> {
    if (input.amount <= 0) throw this.invalidAmount(input.amount);
    return this.giftService.gift(input);
  }

  async topup(input: Parameters<TopupService['topup']>[0]): Promise<{ balanceAfter: number; credits: number }> {
    return this.topupService.topup(input);
  }

  private invalidAmount(amount: number): BusinessError {
    return new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { amount }, message: 'Credit amount must be positive.' });
  }
}
