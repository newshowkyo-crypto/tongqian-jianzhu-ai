import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditRepository } from '../credit.repository.js';

export interface RefundInput {
  readonly amount: number;
  readonly idempotencyKey: string;
  readonly reason?: string;
  readonly tenantId: string;
  readonly traceId?: string;
  readonly userId: string;
}

/**
 * Releases a credit reservation back to the account (AI failure, DB failure or
 * cache hit). Restores the balance via a refund lot. Idempotent.
 */
@Injectable()
export class RefundService {
  constructor(@Inject(CreditRepository) private readonly repo: CreditRepository) {}

  async refund(input: RefundInput): Promise<{ balanceAfter: number; refunded: true; traceId: string }> {
    this.validate(input);
    const traceId = input.traceId ?? randomUUID();
    const result = await this.repo.refund({
      amount: input.amount,
      logKey: `refund:${input.idempotencyKey}`,
      sourceModule: 'ai-gateway',
      sourceResource: input.reason,
      tenantId: input.tenantId,
      traceId,
      userId: input.userId,
    });
    return { balanceAfter: result.balanceAfter, refunded: true, traceId };
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
