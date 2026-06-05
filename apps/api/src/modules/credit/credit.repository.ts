import { Inject, Injectable } from '@nestjs/common';
import { type Prisma, PrismaClient } from '@prisma/client';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { CreditLog, CreditLogType, CreditSourceType } from './credit-types.js';

export interface MovementResult {
  balanceAfter: number;
  replayed: boolean;
}

export interface PreChargeArgs {
  amount: number;
  logKey: string;
  sourceModule: string;
  sourceResource?: string;
  tenantId: string;
  traceId: string;
  userId: string;
}

export interface SettleArgs {
  amount: number;
  logKey: string;
  sourceModule: string;
  sourceResource?: string;
  tenantId: string;
  traceId: string;
  userId: string;
}

export interface AddLotArgs {
  amount: number;
  expiresAt?: string;
  logKey?: string;
  logType: CreditLogType;
  source: string;
  sourceModule: string;
  sourceResource?: string;
  sourceType: CreditSourceType;
  tenantId: string;
  traceId: string;
  userId: string;
}

/**
 * Persistent contract for the credit ledger. Both the Prisma-backed
 * {@link CreditRepository} and the unit-test in-memory fake honor this
 * contract, so the agreed ledger semantics are covered by tests while the
 * real database integration is verified manually.
 *
 * Ledger semantics (fixes the historical double-deduct):
 * - preCharge: reserve = consume lots FEFO + decrement balance; idempotent.
 * - commit: finalize a prior preCharge; records an audit row, NO balance change.
 * - refund: release = restore balance via a refund lot; idempotent.
 * All idempotency is enforced by the unique credit_logs.idempotency_key.
 */
export interface CreditStore {
  preCharge(args: PreChargeArgs): Promise<MovementResult>;
  commit(args: SettleArgs): Promise<MovementResult>;
  refund(args: SettleArgs): Promise<MovementResult>;
  addLot(args: AddLotArgs): Promise<MovementResult>;
  expire(userId: string, tenantId: string): Promise<number>;
  setFrozen(userId: string, tenantId: string, frozenUntil: string | null): Promise<void>;
  getBalance(userId: string, tenantId: string): Promise<number>;
  listLots(userId: string, tenantId: string): Promise<Array<Record<string, unknown>>>;
  listLogs(userId: string, tenantId: string): Promise<CreditLog[]>;
  findLogByKey(logKey: string): Promise<CreditLog | null>;
}

function insufficient(details: Record<string, unknown>): BusinessError {
  return new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details, message: 'Insufficient credit balance.' });
}

@Injectable()
export class CreditRepository implements CreditStore {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  async getBalance(userId: string, tenantId: string): Promise<number> {
    const account = await this.prisma.creditAccount.findFirst({ select: { totalBalance: true }, where: { tenantId, userId } });
    return account?.totalBalance ?? 0;
  }

  async listLots(userId: string, tenantId: string): Promise<Array<Record<string, unknown>>> {
    const account = await this.prisma.creditAccount.findFirst({ select: { id: true }, where: { tenantId, userId } });
    if (!account) return [];
    return this.prisma.creditLot.findMany({ orderBy: { createdAt: 'asc' }, where: { accountId: account.id } });
  }

  async listLogs(userId: string, tenantId: string): Promise<CreditLog[]> {
    const account = await this.prisma.creditAccount.findFirst({ select: { id: true }, where: { tenantId, userId } });
    if (!account) return [];
    const rows = await this.prisma.creditLog.findMany({ orderBy: { createdAt: 'desc' }, where: { accountId: account.id } });
    return rows.map((r) => this.toLogView(r));
  }

  async findLogByKey(logKey: string): Promise<CreditLog | null> {
    const row = await this.prisma.creditLog.findUnique({ where: { idempotencyKey: logKey } });
    return row ? this.toLogView(row) : null;
  }

  async preCharge(args: PreChargeArgs): Promise<MovementResult> {
    if (!Number.isFinite(args.amount) || args.amount <= 0) throw insufficient({ amount: args.amount });
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.creditLog.findUnique({ where: { idempotencyKey: args.logKey } });
      if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };

      const account = await this.ensureAccountTx(tx, args.userId, args.tenantId);
      if (account.totalBalance < args.amount) throw insufficient({ available: account.totalBalance, requested: args.amount });

      // FEFO consume: earliest expiry first, then oldest created.
      const lots = await tx.creditLot.findMany({
        orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }],
        where: { accountId: account.id, remainingAmount: { gt: 0 } },
      });
      let remaining = args.amount;
      const now = new Date();
      for (const lot of lots) {
        if (remaining <= 0) break;
        if (lot.expiresAt && lot.expiresAt <= now) continue;
        if (lot.frozenUntil && lot.frozenUntil > now) continue;
        const take = Math.min(lot.remainingAmount, remaining);
        await tx.creditLot.update({ data: { remainingAmount: lot.remainingAmount - take }, where: { id: lot.id } });
        remaining -= take;
      }
      if (remaining > 0) throw insufficient({ remaining, requested: args.amount });

      const balanceAfter = account.totalBalance - args.amount;
      await tx.creditAccount.update({ data: { totalBalance: balanceAfter }, where: { id: account.id } });
      await tx.creditLog.create({
        data: {
          accountId: account.id,
          amount: -args.amount,
          balanceAfter,
          idempotencyKey: args.logKey,
          sourceModule: args.sourceModule,
          sourceResource: args.sourceResource,
          traceId: args.traceId,
          type: 'pre_charge',
        },
      });
      return { balanceAfter, replayed: false };
    });
  }

  async commit(args: SettleArgs): Promise<MovementResult> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.creditLog.findUnique({ where: { idempotencyKey: args.logKey } });
      if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };
      const account = await this.ensureAccountTx(tx, args.userId, args.tenantId);
      // commit is finalization only — NO balance change (the deduction already
      // happened at preCharge). We record an audit row at the current balance.
      await tx.creditLog.create({
        data: {
          accountId: account.id,
          amount: 0,
          balanceAfter: account.totalBalance,
          idempotencyKey: args.logKey,
          sourceModule: args.sourceModule,
          sourceResource: args.sourceResource,
          traceId: args.traceId,
          type: 'commit',
        },
      });
      return { balanceAfter: account.totalBalance, replayed: false };
    });
  }

  async refund(args: SettleArgs): Promise<MovementResult> {
    if (!Number.isFinite(args.amount) || args.amount <= 0) throw insufficient({ amount: args.amount });
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.creditLog.findUnique({ where: { idempotencyKey: args.logKey } });
      if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };
      const account = await this.ensureAccountTx(tx, args.userId, args.tenantId);
      await tx.creditLot.create({
        data: { accountId: account.id, initialAmount: args.amount, remainingAmount: args.amount, source: args.sourceResource ?? 'refund.ai', sourceType: 'ai_failure_refund' },
      });
      const balanceAfter = account.totalBalance + args.amount;
      await tx.creditAccount.update({ data: { totalBalance: balanceAfter }, where: { id: account.id } });
      await tx.creditLog.create({
        data: {
          accountId: account.id,
          amount: args.amount,
          balanceAfter,
          idempotencyKey: args.logKey,
          sourceModule: args.sourceModule,
          sourceResource: args.sourceResource,
          traceId: args.traceId,
          type: 'refund',
        },
      });
      return { balanceAfter, replayed: false };
    });
  }

  async addLot(args: AddLotArgs): Promise<MovementResult> {
    if (!Number.isFinite(args.amount) || args.amount <= 0) throw insufficient({ amount: args.amount });
    return this.prisma.$transaction(async (tx) => {
      if (args.logKey) {
        const existing = await tx.creditLog.findUnique({ where: { idempotencyKey: args.logKey } });
        if (existing) return { balanceAfter: existing.balanceAfter, replayed: true };
      }
      const account = await this.ensureAccountTx(tx, args.userId, args.tenantId);
      await tx.creditLot.create({
        data: { accountId: account.id, expiresAt: args.expiresAt ? new Date(args.expiresAt) : null, initialAmount: args.amount, remainingAmount: args.amount, source: args.source, sourceType: args.sourceType },
      });
      const balanceAfter = account.totalBalance + args.amount;
      await tx.creditAccount.update({ data: { totalBalance: balanceAfter }, where: { id: account.id } });
      await tx.creditLog.create({
        data: {
          accountId: account.id,
          amount: args.amount,
          balanceAfter,
          idempotencyKey: args.logKey,
          sourceModule: args.sourceModule,
          sourceResource: args.sourceResource,
          traceId: args.traceId,
          type: args.logType,
        },
      });
      return { balanceAfter, replayed: false };
    });
  }

  async expire(userId: string, tenantId: string): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.creditAccount.findFirst({ where: { tenantId, userId } });
      if (!account) return 0;
      const now = new Date();
      const expiredLots = await tx.creditLot.findMany({ where: { accountId: account.id, expiresAt: { lte: now }, remainingAmount: { gt: 0 } } });
      let expired = 0;
      for (const lot of expiredLots) {
        expired += lot.remainingAmount;
        await tx.creditLot.update({ data: { remainingAmount: 0 }, where: { id: lot.id } });
      }
      if (expired > 0) {
        const balanceAfter = account.totalBalance - expired;
        await tx.creditAccount.update({ data: { totalBalance: balanceAfter }, where: { id: account.id } });
        await tx.creditLog.create({
          data: { accountId: account.id, amount: -expired, balanceAfter, sourceModule: 'credit-expiry', traceId: cryptoRandom(), type: 'expire' },
        });
      }
      return expired;
    });
  }

  async setFrozen(userId: string, tenantId: string, frozenUntil: string | null): Promise<void> {
    const account = await this.prisma.creditAccount.findFirst({ select: { id: true }, where: { tenantId, userId } });
    if (!account) return;
    await this.prisma.creditLot.updateMany({ data: { frozenUntil: frozenUntil ? new Date(frozenUntil) : null }, where: { accountId: account.id } });
  }

  private async ensureAccountTx(tx: Prisma.TransactionClient, userId: string, tenantId: string): Promise<{ id: string; totalBalance: number }> {
    const existing = await tx.creditAccount.findFirst({ select: { id: true, totalBalance: true }, where: { tenantId, userId } });
    if (existing) return existing;
    return tx.creditAccount.create({ data: { tenantId, totalBalance: 0, userId }, select: { id: true, totalBalance: true } });
  }

  private toLogView(row: { accountId: string; amount: number; balanceAfter: number; createdAt: Date; id: string; idempotencyKey: string | null; sourceModule: string; sourceResource: string | null; traceId: string; type: string }): CreditLog {
    return {
      accountId: row.accountId,
      amount: row.amount,
      balanceAfter: row.balanceAfter,
      createdAt: row.createdAt.toISOString(),
      id: row.id,
      idempotencyKey: row.idempotencyKey ?? undefined,
      sourceModule: row.sourceModule,
      sourceResource: row.sourceResource ?? undefined,
      traceId: row.traceId,
      type: row.type as CreditLogType,
    };
  }
}

function cryptoRandom(): string {
  return globalThis.crypto.randomUUID();
}
