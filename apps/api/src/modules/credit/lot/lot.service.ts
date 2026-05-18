import { Injectable } from '@nestjs/common';

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
    if (!lot) throw new Error('CREDIT.LOT.NOT_FOUND');
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

  private expiryRank(lot: CreditLot): number {
    return lot.expiresAt ? new Date(lot.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
  }
}
