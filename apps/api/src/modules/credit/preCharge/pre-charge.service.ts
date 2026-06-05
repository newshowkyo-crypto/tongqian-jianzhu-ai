import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditRepository } from '../credit.repository.js';

export interface PreChargeRequest {
  readonly amount: number;
  readonly idempotencyKey: string;
  readonly sourceResource?: string;
  readonly tenantId: string;
  readonly traceId?: string;
  readonly userId: string;
}

/**
 * Reserves credits before an AI call. preCharge consumes lots (FEFO) and
 * decrements the balance — it is the single deduction point. commit later
 * only finalizes (no further deduction); refund releases the reservation.
 * Idempotent via the persisted, namespaced credit log key.
 */
@Injectable()
export class PreChargeService {
  constructor(@Inject(CreditRepository) private readonly repo: CreditRepository) {}

  async preCharge(input: PreChargeRequest): Promise<{ balanceAfter: number }> {
    if (!input.amount || input.amount <= 0) {
      throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { amount: input.amount }, message: 'Pre-charge amount must be positive.' });
    }
    const result = await this.repo.preCharge({
      amount: input.amount,
      logKey: `precharge:${input.idempotencyKey}`,
      sourceModule: 'ai-gateway',
      sourceResource: input.sourceResource,
      tenantId: input.tenantId,
      traceId: input.traceId ?? randomUUID(),
      userId: input.userId,
    });
    return { balanceAfter: result.balanceAfter };
  }
}
