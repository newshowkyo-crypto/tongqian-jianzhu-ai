import { Inject, Injectable } from '@nestjs/common';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

@Injectable()
export class CommitService {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  commit(input: { amount: number; idempotencyKey: string; tenantId: string; traceId?: string; userId: string }): { committed: true } {
    if (this.logs.findByIdempotencyKey(input.idempotencyKey)) return { committed: true };
    const account = this.lots.account(input.userId, input.tenantId);
    this.logs.write({
      accountId: account.id,
      amount: 0,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'ai-gateway',
      traceId: input.traceId ?? crypto.randomUUID(),
      type: 'commit',
    });
    return { committed: true };
  }
}
