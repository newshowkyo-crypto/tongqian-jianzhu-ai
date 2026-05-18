import { Inject, Injectable } from '@nestjs/common';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

@Injectable()
export class GiftService {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  gift(input: { amount: number; expiresInDays?: number; idempotencyKey: string; source: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number } {
    const existing = this.logs.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { balanceAfter: existing.balanceAfter };
    const account = this.lots.account(input.userId, input.tenantId);
    const expiresAt = new Date(Date.now() + (input.expiresInDays ?? 90) * 24 * 60 * 60_000).toISOString();
    this.lots.create({ accountId: account.id, amount: input.amount, expiresAt, source: input.source, sourceType: 'gift' });
    const log = this.logs.write({
      accountId: account.id,
      amount: input.amount,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'credit',
      sourceResource: input.source,
      traceId: input.traceId ?? crypto.randomUUID(),
      type: 'gift',
    });
    return { balanceAfter: log.balanceAfter };
  }
}
