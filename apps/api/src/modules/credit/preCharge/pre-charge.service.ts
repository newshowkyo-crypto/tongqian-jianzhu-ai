import { Inject, Injectable } from '@nestjs/common';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotAllocatorService } from '../lot/lot-allocator.service.js';
import { LotService } from '../lot/lot.service.js';

@Injectable()
export class PreChargeService {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotAllocatorService) private readonly allocator: LotAllocatorService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  preCharge(input: { amount: number; idempotencyKey: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number; released?: boolean } {
    const existing = this.logs.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { balanceAfter: existing.balanceAfter };

    const account = this.lots.account(input.userId, input.tenantId);
    const allocations = this.allocator.allocate(account.id, input.amount);
    for (const allocation of allocations) this.lots.adjust(allocation.lotId, -allocation.amount);
    account.totalBalance -= input.amount;
    const log = this.logs.write({
      accountId: account.id,
      amount: -input.amount,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'ai-gateway',
      traceId: input.traceId ?? crypto.randomUUID(),
      type: 'pre_charge',
    });
    return { balanceAfter: log.balanceAfter };
  }
}
