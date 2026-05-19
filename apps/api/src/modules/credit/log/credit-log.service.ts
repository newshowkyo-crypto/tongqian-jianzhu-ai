import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { CreditLog, CreditLogType } from '../credit-types.js';

@Injectable()
export class CreditLogService {
  private readonly logs: CreditLog[] = [];

  /**
   * Writes an immutable credit log entry. Reused idempotency keys return the
   * original row so payment callbacks and AI retries cannot double mutate balance.
   *
   * @param input Credit log payload without generated fields.
   * @returns Persisted credit log.
   */
  write(input: Omit<CreditLog, 'createdAt' | 'id'>): CreditLog {
    this.validateWrite(input);
    const existing = this.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;
    const log = { ...input, createdAt: new Date().toISOString(), id: crypto.randomUUID() };
    this.logs.push(log);
    return log;
  }

  /**
   * Locates a credit log by idempotency key for write de-duplication.
   *
   * @param key Idempotency key from upstream business action.
   * @returns Existing credit log when the key was already consumed.
   */
  findByIdempotencyKey(key?: string): CreditLog | undefined {
    return key ? this.logs.find((log) => log.idempotencyKey === key) : undefined;
  }

  /**
   * Lists ledger rows in reverse chronological order under account scope.
   *
   * @param accountId Credit account id.
   * @returns Scoped credit logs.
   */
  list(accountId: string): CreditLog[] {
    this.assertAccount(accountId);
    return this.logs.filter((log) => log.accountId === accountId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * Lists ledger rows by business transaction type.
   *
   * @param accountId Credit account id.
   * @param type Credit log type.
   * @returns Filtered credit logs.
   */
  byType(accountId: string, type: CreditLogType): CreditLog[] {
    return this.list(accountId).filter((log) => log.type === type);
  }

  /**
   * Produces an audit-safe balance movement summary for admin exports.
   *
   * @param accountId Credit account id.
   * @returns Debit, credit, refund and latest balance totals.
   */
  summarize(accountId: string): { creditIn: number; creditOut: number; latestBalance: number; refunds: number } {
    const rows = this.list(accountId);
    const creditIn = rows.filter((row) => row.type === 'gift' || row.type === 'topup' || row.type === 'refund').reduce((sum, row) => sum + row.amount, 0);
    const creditOut = rows.filter((row) => row.type === 'commit' || row.type === 'expire').reduce((sum, row) => sum + Math.abs(row.amount), 0);
    const refunds = rows.filter((row) => row.type === 'refund').reduce((sum, row) => sum + row.amount, 0);
    return { creditIn, creditOut, latestBalance: rows[0]?.balanceAfter ?? 0, refunds };
  }

  /**
   * Returns rows linked to one trace id for support investigation.
   *
   * @param traceId Trace id.
   * @returns Matching credit logs.
   */
  byTrace(traceId: string): CreditLog[] {
    if (!traceId) throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, message: 'Credit trace id is required.' });
    return this.logs.filter((log) => log.traceId === traceId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /**
   * Builds reconciliation rows with source module and resource information.
   *
   * @param accountId Credit account id.
   * @returns Reconciliation rows for finance download.
   */
  reconciliation(accountId: string): Array<Record<string, number | string | undefined>> {
    return this.list(accountId).map((log) => ({
      accountId: log.accountId,
      amount: log.amount,
      balanceAfter: log.balanceAfter,
      createdAt: log.createdAt,
      sourceModule: log.sourceModule,
      sourceResource: log.sourceResource,
      type: log.type,
    }));
  }

  private assertAccount(accountId: string): void {
    if (!accountId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Credit account scope is required.' });
  }

  private validateWrite(input: Omit<CreditLog, 'createdAt' | 'id'>): void {
    this.assertAccount(input.accountId);
    if (!input.traceId || !input.sourceModule) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, message: 'Credit log requires trace and source module.' });
    }
    if (!Number.isFinite(input.amount) || !Number.isFinite(input.balanceAfter)) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, message: 'Credit log amount is invalid.' });
    }
  }
}
