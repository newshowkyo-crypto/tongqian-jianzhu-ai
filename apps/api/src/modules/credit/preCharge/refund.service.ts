import { Inject, Injectable } from '@nestjs/common';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

@Injectable()
export class RefundService {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  refund(input: { amount: number; idempotencyKey: string; originalLotId?: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number } {
    const existing = this.logs.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { balanceAfter: existing.balanceAfter };
    const account = this.lots.account(input.userId, input.tenantId);
    if (input.originalLotId) {
      this.lots.adjust(input.originalLotId, input.amount);
    } else {
      this.lots.create({ accountId: account.id, amount: input.amount, source: 'refund.ai', sourceType: 'ai_failure_refund' });
      account.totalBalance -= input.amount;
    }
    account.totalBalance += input.amount;
    const log = this.logs.write({
      accountId: account.id,
      amount: input.amount,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'ai-gateway',
      traceId: input.traceId ?? crypto.randomUUID(),
      type: 'refund',
    });
    return { balanceAfter: log.balanceAfter };
  }
}
