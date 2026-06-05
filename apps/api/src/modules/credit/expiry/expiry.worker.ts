import { Inject, Injectable } from '@nestjs/common';

import { CreditRepository } from '../credit.repository.js';

/**
 * Expires lots whose expiry has passed and records the balance reduction.
 * Persistent and idempotent at the lot level (already-zeroed lots are skipped).
 */
@Injectable()
export class ExpiryWorker {
  constructor(@Inject(CreditRepository) private readonly repo: CreditRepository) {}

  async expireAccount(userId: string, tenantId: string): Promise<{ expired: number }> {
    const expired = await this.repo.expire(userId, tenantId);
    return { expired };
  }
}
