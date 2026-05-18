import { Inject, Injectable } from '@nestjs/common';

import type { LotAllocation } from '../credit-types.js';

import { LotService } from './lot.service.js';

@Injectable()
export class LotAllocatorService {
  constructor(@Inject(LotService) private readonly lots: LotService) {}

  allocate(accountId: string, amount: number): LotAllocation[] {
    let remaining = amount;
    const allocations: LotAllocation[] = [];
    for (const lot of this.lots.activeLots(accountId)) {
      if (remaining <= 0) break;
      const take = Math.min(lot.remainingAmount, remaining);
      allocations.push({ amount: take, lotId: lot.id });
      remaining -= take;
    }
    if (remaining > 0) throw new Error('CREDIT.DEDUCT.INSUFFICIENT');
    return allocations;
  }
}
