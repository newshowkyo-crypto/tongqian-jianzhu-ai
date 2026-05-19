import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotAllocatorService } from '../lot/lot-allocator.service.js';
import { LotService } from '../lot/lot.service.js';

@Injectable()
export class PreChargeService {
  private readonly holds = new Map<string, { accountId: string; amount: number; expiresAt: number; lotIds: string[] }>();

  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotAllocatorService) private readonly allocator: LotAllocatorService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  preCharge(input: { amount: number; idempotencyKey: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number; released?: boolean } {
    const existing = this.logs.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { balanceAfter: existing.balanceAfter };
    if (input.amount <= 0) throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { amount: input.amount }, message: 'Pre-charge amount must be positive.' });

    const account = this.lots.account(input.userId, input.tenantId);
    const allocations = this.allocator.allocate(account.id, input.amount);
    for (const allocation of allocations) this.lots.adjust(allocation.lotId, -allocation.amount);
    account.totalBalance -= input.amount;
    this.holds.set(input.idempotencyKey, { accountId: account.id, amount: input.amount, expiresAt: Date.now() + 24 * 60 * 60_000, lotIds: allocations.map((allocation) => allocation.lotId) });
    const log = this.logs.write({
      accountId: account.id,
      amount: -input.amount,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'ai-gateway',
      traceId: input.traceId ?? crypto.randomUUID(),
      type: 'pre_charge',
    });
    return { balanceAfter: log.balanceAfter };
  }

  /**
   * Releases a pending hold when AI gateway returns cached output or provider fails.
   *
   * @param input Hold release information.
   * @returns Release state.
   */
  release(input: { idempotencyKey: string; traceId?: string }): { released: boolean } {
    const hold = this.holds.get(input.idempotencyKey);
    if (!hold) return { released: false };
    const amountPerLot = Math.ceil(hold.amount / Math.max(hold.lotIds.length, 1));
    for (const lotId of hold.lotIds) this.lots.adjust(lotId, amountPerLot);
    const account = this.lots.account(hold.accountId);
    account.totalBalance += hold.amount;
    this.logs.write({ accountId: hold.accountId, amount: hold.amount, balanceAfter: account.totalBalance, idempotencyKey: `release:${input.idempotencyKey}`, sourceModule: 'ai-gateway', traceId: input.traceId ?? crypto.randomUUID(), type: 'pre_charge_release' });
    this.holds.delete(input.idempotencyKey);
    return { released: true };
  }

  /**
   * Expires holds older than 24 hours and returns the number still waiting for commit.
   *
   * @returns Hold maintenance summary.
   */
  expireStaleHolds(): { active: number; expired: number } {
    let expired = 0;
    for (const [key, hold] of this.holds.entries()) {
      if (hold.expiresAt <= Date.now()) {
        this.holds.delete(key);
        expired += 1;
      }
    }
    return { active: this.holds.size, expired };
  }
}
