import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditRepository } from '../credit.repository.js';

export interface ReactivationInput {
  readonly idempotencyKey?: string;
  readonly operatorId?: string;
  readonly reason?: string;
  readonly tenantId: string;
  readonly traceId?: string;
  readonly userId: string;
}

@Injectable()
export class CreditReactivationService {
  constructor(@Inject(CreditRepository) private readonly repo: CreditRepository) {}

  /**
   * Freezes all lots for dormant accounts under BR-406 reactivation rules.
   *
   * @param input Reactivation freeze request.
   * @returns Freeze window.
   */
  async freeze(input: ReactivationInput): Promise<{ frozenUntil: string; frozen: true }> {
    this.validate(input);
    const frozenUntil = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();
    await this.repo.setFrozen(input.userId, input.tenantId, frozenUntil);
    return { frozen: true, frozenUntil };
  }

  /**
   * Reactivates a dormant account after owner confirmation or successful top-up.
   *
   * @param input Reactivation request.
   * @returns Reactivation result.
   */
  async reactivate(input: ReactivationInput): Promise<{ balance: number; reactivated: true }> {
    this.validate(input);
    await this.repo.setFrozen(input.userId, input.tenantId, null);
    const balance = await this.repo.getBalance(input.userId, input.tenantId);
    return { balance, reactivated: true };
  }

  /**
   * Evaluates BR-406 dormant-account handling.
   *
   * @param lastActiveAt Last user activity timestamp.
   * @param balance Current credit balance.
   * @returns BR-406 decision.
   */
  evaluateDormancy(lastActiveAt: string, balance: number): { action: 'freeze' | 'keep-active' | 'reactivation-nudge'; dormantDays: number } {
    const dormantDays = Math.floor((Date.now() - new Date(lastActiveAt).getTime()) / (24 * 60 * 60_000));
    if (dormantDays >= 180 && balance > 0) return { action: 'freeze', dormantDays };
    if (dormantDays >= 90) return { action: 'reactivation-nudge', dormantDays };
    return { action: 'keep-active', dormantDays };
  }

  /**
   * Builds a reactivation offer that avoids reducing output quality.
   *
   * @param balance Current balance.
   * @returns Offer details.
   */
  reactivationOffer(balance: number): { bonusCredits: number; expiresInDays: number; messageKey: string } {
    if (balance <= 0) return { bonusCredits: 50, expiresInDays: 7, messageKey: 'credit.reactivation.zeroBalance' };
    return { bonusCredits: Math.min(Math.ceil(balance * 0.05), 200), expiresInDays: 7, messageKey: 'credit.reactivation.warmReturn' };
  }

  /**
   * Returns audit metadata for freeze/reactivation actions.
   *
   * @param input Reactivation request.
   * @param action Action name.
   * @returns Audit row.
   */
  toAudit(input: ReactivationInput, action: 'freeze' | 'reactivate'): Record<string, string | undefined> {
    return {
      action: `CREDIT_${action.toUpperCase()}`,
      operatorId: input.operatorId,
      reason: input.reason,
      tenantId: input.tenantId,
      traceId: input.traceId,
      userId: input.userId,
    };
  }

  private validate(input: ReactivationInput): void {
    if (!input.tenantId || !input.userId) {
      throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Credit reactivation requires tenant and user scope.' });
    }
  }
}
