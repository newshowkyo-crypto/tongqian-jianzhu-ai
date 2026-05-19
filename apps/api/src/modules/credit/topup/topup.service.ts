import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { CreditLogService } from '../log/credit-log.service.js';
import { LotService } from '../lot/lot.service.js';

import { TopupPackageService } from './topup-package.service.js';

@Injectable()
export class TopupService {
  private readonly orders = new Map<string, { packageCode: string; paymentId?: string; status: 'created' | 'paid' | 'failed'; userId: string }>();

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

  /**
   * Creates a top-up order before the mock payment provider confirms payment.
   *
   * @param input Top-up order input.
   * @returns Created order.
   */
  createOrder(input: { packageCode: string; userId: string }): { amountCredits: number; orderId: string; status: 'created' } {
    const pkg = this.packages.get(input.packageCode);
    const orderId = crypto.randomUUID();
    this.orders.set(orderId, { packageCode: input.packageCode, status: 'created', userId: input.userId });
    return { amountCredits: pkg.credits, orderId, status: 'created' };
  }

  /**
   * Confirms a payment and applies credits idempotently.
   *
   * @param input Payment callback input.
   * @returns Top-up result.
   */
  confirmPayment(input: { orderId: string; paymentId: string; tenantId: string; traceId?: string }): { balanceAfter: number; credits: number; orderId: string } {
    const order = this.orders.get(input.orderId);
    if (!order) throw new BusinessError({ code: ErrorCodes.PAY_ORDER_CONFLICT.code, details: { orderId: input.orderId }, message: 'Top-up order not found.' });
    if (order.status === 'paid') {
      const existing = this.logs.findByIdempotencyKey(`topup:${input.orderId}`);
      return { balanceAfter: existing?.balanceAfter ?? 0, credits: existing?.amount ?? 0, orderId: input.orderId };
    }
    const result = this.topup({ idempotencyKey: `topup:${input.orderId}`, packageCode: order.packageCode, paymentId: input.paymentId, tenantId: input.tenantId, traceId: input.traceId, userId: order.userId });
    order.status = 'paid';
    order.paymentId = input.paymentId;
    return { ...result, orderId: input.orderId };
  }

  /**
   * Marks a payment order failed without touching credit lots.
   *
   * @param orderId Top-up order id.
   */
  failOrder(orderId: string): void {
    const order = this.orders.get(orderId);
    if (!order) throw new BusinessError({ code: ErrorCodes.PAY_ORDER_CONFLICT.code, details: { orderId }, message: 'Top-up order not found.' });
    order.status = 'failed';
  }
}
