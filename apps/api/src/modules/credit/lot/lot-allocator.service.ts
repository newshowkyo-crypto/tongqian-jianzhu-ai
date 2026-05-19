import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { LotAllocation } from '../credit-types.js';

import { LotService } from './lot.service.js';

@Injectable()
export class LotAllocatorService {
  constructor(@Inject(LotService) private readonly lots: LotService) {}

  /**
   * Allocates credits by FEFO order: earliest expiry first, then oldest created.
   * This keeps BR credit expiry promises stable and is covered by PBT monotonicity.
   *
   * @param accountId Credit account id.
   * @param amount Credits requested.
   * @returns Allocation plan without mutating lots.
   */
  allocate(accountId: string, amount: number): LotAllocation[] {
    this.validateRequest(accountId, amount);
    let remaining = amount;
    const allocations: LotAllocation[] = [];
    for (const lot of this.lots.activeLots(accountId)) {
      if (remaining <= 0) break;
      const take = Math.min(lot.remainingAmount, remaining);
      allocations.push({ amount: take, lotId: lot.id });
      remaining -= take;
    }
    if (remaining > 0) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { requested: amount, remaining }, message: 'Credit balance is insufficient.' });
    }
    return allocations;
  }

  /**
   * Allocates and immediately applies deductions to lots.
   *
   * @param accountId Credit account id.
   * @param amount Credits requested.
   * @returns Applied allocation plan.
   */
  allocateAndApply(accountId: string, amount: number): LotAllocation[] {
    const plan = this.allocate(accountId, amount);
    for (const allocation of plan) this.lots.adjust(allocation.lotId, -allocation.amount);
    return plan;
  }

  /**
   * Checks whether an allocation can be satisfied without throwing.
   *
   * @param accountId Credit account id.
   * @param amount Credits requested.
   * @returns Availability decision.
   */
  canAllocate(accountId: string, amount: number): { available: boolean; missing: number; totalAvailable: number } {
    this.validateRequest(accountId, amount);
    const totalAvailable = this.lots.activeLots(accountId).reduce((sum, lot) => sum + lot.remainingAmount, 0);
    return { available: totalAvailable >= amount, missing: Math.max(amount - totalAvailable, 0), totalAvailable };
  }

  /**
   * Explains current FEFO order for admin diagnostics and property tests.
   *
   * @param accountId Credit account id.
   * @returns Lot ordering evidence.
   */
  explainOrder(accountId: string): Array<{ expiresAt: string; lotId: string; remainingAmount: number }> {
    if (!accountId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Credit account scope is required.' });
    return this.lots.activeLots(accountId).map((lot) => ({
      expiresAt: lot.expiresAt ?? 'NO_EXPIRY',
      lotId: lot.id,
      remainingAmount: lot.remainingAmount,
    }));
  }

  /**
   * Verifies that active lots are monotonic by expiry timestamp.
   *
   * @param accountId Credit account id.
   * @returns True when FEFO order is stable.
   */
  isFefoMonotonic(accountId: string): boolean {
    const ordered = this.explainOrder(accountId);
    const ranks = ordered.map((item) => (item.expiresAt === 'NO_EXPIRY' ? Number.MAX_SAFE_INTEGER : new Date(item.expiresAt).getTime()));
    return ranks.every((rank, index) => index === 0 || (ranks[index - 1] ?? Number.MIN_SAFE_INTEGER) <= rank);
  }

  private validateRequest(accountId: string, amount: number): void {
    if (!accountId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Credit account scope is required.' });
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, message: 'Credit allocation amount must be positive.' });
    }
  }
}
