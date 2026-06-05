import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditRepository } from '../credit.repository.js';

import { TopupPackageService } from './topup-package.service.js';

/**
 * Applies paid top-ups to the persistent credit ledger. `topup` is idempotent
 * (persisted log key) and credits a new lot. The pre-payment order handshake is
 * ephemeral coordination state (no money), kept in memory until a payment-order
 * table is introduced.
 */
@Injectable()
export class TopupService {
  private readonly orders = new Map<string, { packageCode: string; paymentId?: string; status: 'created' | 'paid' | 'failed'; userId: string }>();

  constructor(
    @Inject(CreditRepository) private readonly repo: CreditRepository,
    @Inject(TopupPackageService) private readonly packages: TopupPackageService,
  ) {}

  async topup(input: { idempotencyKey: string; packageCode: string; paymentId: string; tenantId: string; traceId?: string; userId: string }): Promise<{ balanceAfter: number; credits: number }> {
    const pkg = this.packages.get(input.packageCode);
    const result = await this.repo.addLot({
      amount: pkg.totalCredits,
      logKey: `topup:${input.idempotencyKey}`,
      logType: 'topup',
      source: `topup.${input.paymentId}`,
      sourceModule: 'payment-gateway',
      sourceResource: input.paymentId,
      sourceType: 'topup',
      tenantId: input.tenantId,
      traceId: input.traceId ?? randomUUID(),
      userId: input.userId,
    });
    return { balanceAfter: result.balanceAfter, credits: pkg.totalCredits };
  }

  createOrder(input: { packageCode: string; userId: string }): { amountCredits: number; orderId: string; status: 'created' } {
    const pkg = this.packages.get(input.packageCode);
    const orderId = randomUUID();
    this.orders.set(orderId, { packageCode: input.packageCode, status: 'created', userId: input.userId });
    return { amountCredits: pkg.totalCredits, orderId, status: 'created' };
  }

  async confirmPayment(input: { orderId: string; paymentId: string; tenantId: string; traceId?: string }): Promise<{ balanceAfter: number; credits: number; orderId: string }> {
    const order = this.orders.get(input.orderId);
    if (!order) throw new BusinessError({ code: ErrorCodes.PAY_ORDER_CONFLICT.code, details: { orderId: input.orderId }, message: 'Top-up order not found.' });
    const result = await this.topup({ idempotencyKey: `order:${input.orderId}`, packageCode: order.packageCode, paymentId: input.paymentId, tenantId: input.tenantId, traceId: input.traceId, userId: order.userId });
    order.status = 'paid';
    order.paymentId = input.paymentId;
    return { ...result, orderId: input.orderId };
  }

  failOrder(orderId: string): void {
    const order = this.orders.get(orderId);
    if (!order) throw new BusinessError({ code: ErrorCodes.PAY_ORDER_CONFLICT.code, details: { orderId }, message: 'Top-up order not found.' });
    order.status = 'failed';
  }
}
