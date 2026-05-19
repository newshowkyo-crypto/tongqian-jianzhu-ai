import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

export interface RefundInput {
  readonly amount: number;
  readonly idempotencyKey: string;
  readonly originalLotId?: string;
  readonly reason?: string;
  readonly tenantId: string;
  readonly traceId?: string;
  readonly userId: string;
}

@Injectable()
export class RefundService {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  /**
   * Refunds failed AI charges idempotently and restores the original lot when available.
   *
   * @param input Refund request.
   * @returns Balance after refund.
   */
  refund(input: RefundInput): { balanceAfter: number; refunded: true; traceId: string } {
    this.validate(input);
    const existing = this.logs.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { balanceAfter: existing.balanceAfter, refunded: true, traceId: existing.traceId };
    const account = this.lots.account(input.userId, input.tenantId);
    if (input.originalLotId) {
      this.lots.adjust(input.originalLotId, input.amount);
    } else {
      this.lots.create({ accountId: account.id, amount: input.amount, source: 'refund.ai', sourceType: 'ai_failure_refund' });
      account.totalBalance -= input.amount;
    }
    account.totalBalance += input.amount;
    const traceId = input.traceId ?? crypto.randomUUID();
    const log = this.logs.write({
      accountId: account.id,
      amount: input.amount,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'ai-gateway',
      sourceResource: input.reason,
      traceId,
      type: 'refund',
    });
    return { balanceAfter: log.balanceAfter, refunded: true, traceId };
  }

  /**
   * Calculates refund eligibility before a write action.
   *
   * @param input Refund request.
   * @returns Eligibility decision.
   */
  eligibility(input: RefundInput): { eligible: boolean; reason: string } {
    this.validate(input);
    if (this.logs.findByIdempotencyKey(input.idempotencyKey)) return { eligible: true, reason: 'idempotent-replay' };
    if (input.reason?.includes('abuse')) return { eligible: false, reason: 'manual-review-required' };
    return { eligible: true, reason: 'ai-failure-refund' };
  }

  /**
   * Builds audit metadata for finance and AI gateway traces.
   *
   * @param input Refund request.
   * @returns Audit row.
   */
  toAudit(input: RefundInput): Record<string, number | string | undefined> {
    return {
      action: 'CREDIT_REFUND',
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
      originalLotId: input.originalLotId,
      reason: input.reason,
      tenantId: input.tenantId,
      traceId: input.traceId,
      userId: input.userId,
    };
  }

  /**
   * Finds refund rows for a trace id.
   *
   * @param traceId Trace id.
   * @returns Refund log rows.
   */
  refundLogs(traceId: string): ReturnType<CreditLogService['byTrace']> {
    return this.logs.byTrace(traceId).filter((row) => row.type === 'refund');
  }

  private validate(input: RefundInput): void {
    if (!input.tenantId || !input.userId || !input.idempotencyKey) {
      throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Credit refund requires tenant, user and idempotency scope.' });
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, message: 'Credit refund amount must be positive.' });
    }
  }
}
