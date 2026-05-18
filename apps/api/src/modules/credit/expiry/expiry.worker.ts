import { Inject, Injectable } from '@nestjs/common';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

@Injectable()
export class ExpiryWorker {
  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  expireAccount(userId: string, tenantId: string): { expired: number } {
    const account = this.lots.account(userId, tenantId);
    const expired = this.lots.expire(account.id);
    if (expired > 0) {
      this.logs.write({
        accountId: account.id,
        amount: -expired,
        balanceAfter: account.totalBalance,
        sourceModule: 'credit-expiry',
        traceId: crypto.randomUUID(),
        type: 'expire',
      });
    }
    return { expired };
  }
}
