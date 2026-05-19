import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { CreditAccount, CreditLot, CreditSourceType } from '../credit-types.js';

@Injectable()
export class LotService {
  private readonly accounts = new Map<string, CreditAccount>();
  private readonly lotStore = new Map<string, CreditLot>();

  account(userId: string, tenantId = 'mock-tenant'): CreditAccount {
    const existing = [...this.accounts.values()].find((account) => account.userId === userId);
    if (existing) return existing;
    const account = { id: crypto.randomUUID(), tenantId, totalBalance: 0, userId };
    this.accounts.set(account.id, account);
    return account;
  }

  create(input: { accountId: string; amount: number; expiresAt?: string; source: string; sourceType: CreditSourceType }): CreditLot {
    const lot: CreditLot = {
      accountId: input.accountId,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
      id: crypto.randomUUID(),
      initialAmount: input.amount,
      remainingAmount: input.amount,
      source: input.source,
      sourceType: input.sourceType,
    };
    this.lotStore.set(lot.id, lot);
    const account = this.accounts.get(input.accountId);
    if (account) account.totalBalance += input.amount;
    return lot;
  }

  activeLots(accountId: string, now = new Date()): CreditLot[] {
    return [...this.lotStore.values()]
      .filter((lot) => lot.accountId === accountId && lot.remainingAmount > 0 && (!lot.expiresAt || new Date(lot.expiresAt) > now) && (!lot.frozenUntil || new Date(lot.frozenUntil) <= now))
      .sort((a, b) => this.expiryRank(a) - this.expiryRank(b) || a.createdAt.localeCompare(b.createdAt));
  }

  lots(accountId: string): CreditLot[] {
    return [...this.lotStore.values()].filter((lot) => lot.accountId === accountId);
  }

  adjust(lotId: string, delta: number): CreditLot {
    const lot = this.lotStore.get(lotId);
    if (!lot) throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { lotId }, message: 'Credit lot not found.' });
    if (lot.remainingAmount + delta < 0) throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { delta, lotId }, message: 'Credit lot balance cannot be negative.' });
    lot.remainingAmount += delta;
    return lot;
  }

  freeze(accountId: string, until: string): void {
    for (const lot of this.lots(accountId)) lot.frozenUntil = until;
  }

  unfreeze(accountId: string): void {
    for (const lot of this.lots(accountId)) lot.frozenUntil = undefined;
  }

  expire(accountId: string, now = new Date()): number {
    let expired = 0;
    for (const lot of this.lots(accountId)) {
      if (lot.expiresAt && new Date(lot.expiresAt) <= now && lot.remainingAmount > 0) {
        expired += lot.remainingAmount;
        lot.remainingAmount = 0;
      }
    }
    const account = this.accounts.get(accountId);
    if (account) account.totalBalance -= expired;
    return expired;
  }

  /**
   * Consumes credits using FEFO first and paid balance tie-breaker order.
   *
   * @param accountId Credit account id.
   * @param amount Amount to consume.
   * @returns Lot allocations.
   */
  consumeFefo(accountId: string, amount: number): Array<{ amount: number; lotId: string; sourceType: CreditSourceType }> {
    const account = this.accounts.get(accountId);
    if (!account || account.totalBalance < amount) throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { accountId, amount }, message: 'Insufficient credit balance.' });
    let remaining = amount;
    const allocations: Array<{ amount: number; lotId: string; sourceType: CreditSourceType }> = [];
    for (const lot of this.activeLots(accountId)) {
      if (remaining <= 0) break;
      const used = Math.min(lot.remainingAmount, remaining);
      lot.remainingAmount -= used;
      remaining -= used;
      allocations.push({ amount: used, lotId: lot.id, sourceType: lot.sourceType });
    }
    if (remaining > 0) throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { accountId, remaining }, message: 'Insufficient active lots.' });
    account.totalBalance -= amount;
    return allocations;
  }

  /**
   * Archives expired lots for reporting without deleting audit history.
   *
   * @param accountId Credit account id.
   * @param now Current time.
   * @returns Expired lot count and amount.
   */
  archiveExpired(accountId: string, now = new Date()): { amount: number; count: number } {
    let amount = 0;
    let count = 0;
    for (const lot of this.lots(accountId)) {
      if (lot.expiresAt && new Date(lot.expiresAt) <= now && lot.remainingAmount > 0) {
        amount += lot.remainingAmount;
        lot.remainingAmount = 0;
        count += 1;
      }
    }
    const account = this.accounts.get(accountId);
    if (account) account.totalBalance -= amount;
    return { amount, count };
  }

  /**
   * Builds a lot aging summary for admin alerts and monthly self-check.
   *
   * @param accountId Credit account id.
   * @returns Lot distribution.
   */
  aging(accountId: string): { active: number; expired: number; frozen: number; totalRemaining: number } {
    const now = new Date();
    const lots = this.lots(accountId);
    return {
      active: lots.filter((lot) => lot.remainingAmount > 0 && (!lot.expiresAt || new Date(lot.expiresAt) > now)).length,
      expired: lots.filter((lot) => lot.expiresAt && new Date(lot.expiresAt) <= now).length,
      frozen: lots.filter((lot) => lot.frozenUntil && new Date(lot.frozenUntil) > now).length,
      totalRemaining: lots.reduce((sum, lot) => sum + lot.remainingAmount, 0),
    };
  }

  private expiryRank(lot: CreditLot): number {
    return lot.expiresAt ? new Date(lot.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
  }
}
