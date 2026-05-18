import { Inject, Injectable } from '@nestjs/common';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

import { TopupPackageService } from './topup-package.service.js';

@Injectable()
export class TopupService {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
    @Inject(TopupPackageService) private readonly packages: TopupPackageService,
  ) {}

  topup(input: { idempotencyKey: string; packageCode: string; paymentId: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number; credits: number } {
    const existing = this.logs.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return { balanceAfter: existing.balanceAfter, credits: existing.amount };
    const pkg = this.packages.get(input.packageCode);
    const account = this.lots.account(input.userId, input.tenantId);
    this.lots.create({ accountId: account.id, amount: pkg.credits, source: `topup.${input.paymentId}`, sourceType: 'topup' });
    const log = this.logs.write({
      accountId: account.id,
      amount: pkg.credits,
      balanceAfter: account.totalBalance,
      idempotencyKey: input.idempotencyKey,
      sourceModule: 'payment-gateway',
      sourceResource: input.paymentId,
      traceId: input.traceId ?? crypto.randomUUID(),
      type: 'topup',
    });
    return { balanceAfter: log.balanceAfter, credits: pkg.credits };
  }
}
