import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditRepository } from '../credit.repository.js';

export interface CommitInput {
  readonly amount: number;
  readonly idempotencyKey: string;
  readonly sourceResource?: string;
  readonly tenantId: string;
  readonly traceId?: string;
  readonly userId: string;
}

/**
 * Finalizes a previously reserved (pre-charged) credit amount. Commit records
 * an audit row but does NOT change the balance — the deduction already happened
 * at preCharge. Idempotent and safe to retry.
 */
@Injectable()
export class CommitService {
  constructor(@Inject(CreditRepository) private readonly repo: CreditRepository) {}

  async commit(input: CommitInput): Promise<{ balanceAfter: number; committed: true; traceId: string }> {
    this.validate(input);
    const traceId = input.traceId ?? randomUUID();
    const result = await this.repo.commit({
      amount: input.amount,
      logKey: `commit:${input.idempotencyKey}`,
      sourceModule: 'ai-gateway',
      sourceResource: input.sourceResource,
      tenantId: input.tenantId,
      traceId,
      userId: input.userId,
    });
    return { balanceAfter: result.balanceAfter, committed: true, traceId };
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
