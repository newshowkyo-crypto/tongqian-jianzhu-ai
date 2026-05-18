import { Inject, Injectable } from '@nestjs/common';

import { LotService } from '../lot/lot.service.js';

@Injectable()
export class CreditReactivationService {
  constructor(@Inject(LotService) private readonly lots: LotService) {}

  freeze(userId: string, tenantId: string): { frozenUntil: string } {
    const account = this.lots.account(userId, tenantId);
    const frozenUntil = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();
    this.lots.freeze(account.id, frozenUntil);
    return { frozenUntil };
  }

  reactivate(userId: string, tenantId: string): { reactivated: true } {
    const account = this.lots.account(userId, tenantId);
    this.lots.unfreeze(account.id);
    return { reactivated: true };
  }
}
