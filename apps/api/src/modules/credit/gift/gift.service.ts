import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditRepository } from '../credit.repository.js';

export interface GiftInput {
  readonly amount: number;
  readonly expiresInDays?: number;
  readonly idempotencyKey: string;
  readonly source: string;
  readonly tenantId: string;
  readonly traceId?: string;
  readonly userId: string;
}

/**
 * Grants gift credits (registration, invitation, weekly check-in). Each grant
 * is a new credit lot with an expiry; idempotent via the persisted log key.
 */
@Injectable()
export class GiftService {
  constructor(@Inject(CreditRepository) private readonly repo: CreditRepository) {}

  async gift(input: GiftInput): Promise<{ balanceAfter: number }> {
    if (input.amount <= 0 || input.amount > 1_000) {
      throw new BusinessError({ code: ErrorCodes.FRAUD_RISK_DETECTED.code, details: { amount: input.amount }, message: 'Gift amount outside allowed range.' });
    }
    const expiresAt = new Date(Date.now() + (input.expiresInDays ?? 90) * 24 * 60 * 60_000).toISOString();
    const result = await this.repo.addLot({
      amount: input.amount,
      expiresAt,
      logKey: `gift:${input.idempotencyKey}`,
      logType: 'gift',
      source: input.source,
      sourceModule: 'credit',
      sourceResource: input.source,
      sourceType: 'gift',
      tenantId: input.tenantId,
      traceId: input.traceId ?? randomUUID(),
      userId: input.userId,
    });
    return { balanceAfter: result.balanceAfter };
  }

  /** Grants the registration welcome gift (idempotent per user). */
  async registrationGift(input: { deviceFingerprint?: string; tenantId: string; traceId?: string; userId: string }): Promise<{ balanceAfter: number }> {
    return this.gift({ amount: 500, expiresInDays: 90, idempotencyKey: `register:${input.userId}`, source: `register:${input.deviceFingerprint ?? input.userId}`, tenantId: input.tenantId, traceId: input.traceId, userId: input.userId });
  }

  /** Grants invitation reward (one per invitee). */
  async inviteGift(input: { inviteeUserId: string; inviterUserId: string; tenantId: string; traceId?: string }): Promise<{ balanceAfter: number }> {
    return this.gift({ amount: 200, expiresInDays: 180, idempotencyKey: `invite:${input.inviteeUserId}`, source: `invite:${input.inviteeUserId}`, tenantId: input.tenantId, traceId: input.traceId, userId: input.inviterUserId });
  }

  /** Grants weekly check-in reward (one per ISO week). */
  async weeklyCheckinGift(input: { isoWeek: string; tenantId: string; traceId?: string; userId: string }): Promise<{ balanceAfter: number }> {
    return this.gift({ amount: 50, expiresInDays: 30, idempotencyKey: `weekly:${input.userId}:${input.isoWeek}`, source: `weekly:${input.isoWeek}`, tenantId: input.tenantId, traceId: input.traceId, userId: input.userId });
  }
}
