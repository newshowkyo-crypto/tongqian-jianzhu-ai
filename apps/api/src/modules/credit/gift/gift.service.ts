import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

@Injectable()
export class GiftService {
  private readonly antiAbuse = new Map<string, number>();

  constructor(
    @Inject(CreditLogService) private readonly logs: CreditLogService,
    @Inject(LotService) private readonly lots: LotService,
  ) {}

  gift(input: { amount: number; expiresInDays?: number; idempotencyKey: string; source: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number } {
    this.assertGiftAllowed(input);
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

  /**
   * Grants the registration welcome gift.
   *
   * @param input User and tenant information.
   * @returns Balance after gift.
   */
  registrationGift(input: { deviceFingerprint?: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number } {
    return this.gift({ amount: 500, expiresInDays: 90, idempotencyKey: `gift:register:${input.userId}`, source: `register:${input.deviceFingerprint ?? input.userId}`, tenantId: input.tenantId, traceId: input.traceId, userId: input.userId });
  }

  /**
   * Grants invitation reward with one reward per invitee.
   *
   * @param input Invitation information.
   * @returns Balance after reward.
   */
  inviteGift(input: { inviteeUserId: string; inviterUserId: string; tenantId: string; traceId?: string }): { balanceAfter: number } {
    return this.gift({ amount: 200, expiresInDays: 180, idempotencyKey: `gift:invite:${input.inviteeUserId}`, source: `invite:${input.inviteeUserId}`, tenantId: input.tenantId, traceId: input.traceId, userId: input.inviterUserId });
  }

  /**
   * Grants weekly check-in reward with source-level anti-abuse throttling.
   *
   * @param input Check-in information.
   * @returns Balance after gift.
   */
  weeklyCheckinGift(input: { isoWeek: string; tenantId: string; traceId?: string; userId: string }): { balanceAfter: number } {
    return this.gift({ amount: 50, expiresInDays: 30, idempotencyKey: `gift:weekly:${input.userId}:${input.isoWeek}`, source: `weekly:${input.isoWeek}`, tenantId: input.tenantId, traceId: input.traceId, userId: input.userId });
  }

  private assertGiftAllowed(input: { amount: number; idempotencyKey: string; source: string; userId: string }): void {
    if (input.amount <= 0 || input.amount > 1_000) {
      throw new BusinessError({ code: ErrorCodes.FRAUD_RISK_DETECTED.code, details: input, message: 'Gift amount outside allowed range.' });
    }
    const key = `${input.userId}:${input.source}`;
    const count = this.antiAbuse.get(key) ?? 0;
    if (count >= 3 && !this.logs.findByIdempotencyKey(input.idempotencyKey)) {
      throw new BusinessError({ code: ErrorCodes.FRAUD_RISK_DETECTED.code, details: { source: input.source, userId: input.userId }, message: 'Gift anti-abuse threshold reached.' });
    }
    this.antiAbuse.set(key, count + 1);
  }
}
