import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

export interface CommitInput {
  readonly amount: number;
  readonly idempotencyKey: string;
  readonly sourceResource?: string;
  readonly tenantId: string;
  readonly traceId?: string;
  readonly userId: string;
}

@Injectable()
export class CommitService {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  /**
   * Commits a previously reserved AI credit charge idempotently.
   *
   * @param input Commit request.
   * @returns Commit state and balance.
   */
  commit(input: CommitInput): { balanceAfter: number; committed: true; traceId: string } {
    this.validate(input);
    const existing = this.logs.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { balanceAfter: existing.balanceAfter, committed: true, traceId: existing.traceId };
    const account = this.lots.account(input.userId, input.tenantId);
    if (account.totalBalance < input.amount) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { balance: account.totalBalance, requested: input.amount }, message: 'Credit commit exceeds reserved balance.' });
    }
    const traceId = input.traceId ?? crypto.randomUUID();
    account.totalBalance -= input.amount;
    const log = this.logs.write({
      accountId: account.id,
      amount: input.amount,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'ai-gateway',
      sourceResource: input.sourceResource,
      traceId,
      type: 'commit',
    });
    return { balanceAfter: log.balanceAfter, committed: true, traceId };
  }

  /**
   * Performs a dry-run validation for UI confirmation.
   *
   * @param input Commit request.
   * @returns Preview result.
   */
  preview(input: CommitInput): { balanceAfter: number; canCommit: boolean; reason: string } {
    this.validate(input);
    const account = this.lots.account(input.userId, input.tenantId);
    const balanceAfter = account.totalBalance - input.amount;
    return { balanceAfter, canCommit: balanceAfter >= 0, reason: balanceAfter >= 0 ? 'ready' : 'insufficient-balance' };
  }

  /**
   * Returns audit metadata for credit commit operations.
   *
   * @param input Commit request.
   * @returns Audit row.
   */
  toAudit(input: CommitInput): Record<string, number | string | undefined> {
    return {
      action: 'CREDIT_COMMIT',
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
      sourceResource: input.sourceResource,
      tenantId: input.tenantId,
      traceId: input.traceId,
      userId: input.userId,
    };
  }

  /**
   * Checks whether a commit key was already consumed.
   *
   * @param idempotencyKey Idempotency key.
   * @returns Existing result status.
   */
  status(idempotencyKey: string): { committed: boolean; traceId?: string } {
    const existing = this.logs.findByIdempotencyKey(idempotencyKey);
    return { committed: Boolean(existing), traceId: existing?.traceId };
  }

  private validate(input: CommitInput): void {
    if (!input.tenantId || !input.userId || !input.idempotencyKey) {
      throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Credit commit requires tenant, user and idempotency scope.' });
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, message: 'Credit commit amount must be positive.' });
    }
  }
}
