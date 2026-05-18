import { Inject, Injectable } from '@nestjs/common';
import type {
  AgentCommissionView,
  AgentWithdrawalView,
  PayChannel,
  PaymentOrderType,
  PaymentOrderView,
  PaymentProviderCharge,
  PaymentRefundView,
  RefundTier,
  RewardPaymentRoute,
} from '@tongqian/types';

import { ApprovalEngineService } from '../approval/approval-engine.service.js';

interface CreateOrderInput {
  amountCny: number;
  channel: PayChannel;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  tenantId: string;
  type: PaymentOrderType;
  userId: string;
}

interface ProviderWebhookInput {
  body: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}

interface PaymentProvider {
  charge(order: PaymentOrderView): PaymentProviderCharge;
  refund(refund: PaymentRefundView): { externalRefundNo: string; mock: boolean; provider: PayChannel };
  verifyWebhook(input: ProviderWebhookInput): boolean;
}

class MockWechatProvider implements PaymentProvider {
  charge(order: PaymentOrderView): PaymentProviderCharge {
    return {
      externalOrderNo: `wx_${order.id}`,
      mock: true,
      paymentUrl: `mock://wechat/pay/${order.id}`,
      provider: 'wechat',
    };
  }

  refund(refund: PaymentRefundView): { externalRefundNo: string; mock: boolean; provider: PayChannel } {
    return { externalRefundNo: `wx_refund_${refund.id}`, mock: true, provider: 'wechat' };
  }

  verifyWebhook(input: ProviderWebhookInput): boolean {
    return input.headers['x-wechatpay-signature'] === 'mock' || input.headers['x-payment-mock'] === 'true';
  }
}

class MockAlipayProvider implements PaymentProvider {
  charge(order: PaymentOrderView): PaymentProviderCharge {
    return {
      externalOrderNo: `ali_${order.id}`,
      mock: true,
      paymentUrl: `mock://alipay/pay/${order.id}`,
      provider: 'alipay',
    };
  }

  refund(refund: PaymentRefundView): { externalRefundNo: string; mock: boolean; provider: PayChannel } {
    return { externalRefundNo: `ali_refund_${refund.id}`, mock: true, provider: 'alipay' };
  }

  verifyWebhook(input: ProviderWebhookInput): boolean {
    return input.headers['alipay-signature'] === 'mock' || input.headers['x-payment-mock'] === 'true';
  }
}

@Injectable()
export class PaymentService {
  private readonly alipay = new MockAlipayProvider();
  private readonly commissions = new Map<string, AgentCommissionView>();
  private readonly contracts = new Map<string, { channel: PayChannel; externalContractId: string; id: string; status: 'active' | 'revoked'; userId: string }>();
  private readonly orders = new Map<string, PaymentOrderView>();
  private readonly ordersByIdempotency = new Map<string, string>();
  private readonly refunds = new Map<string, PaymentRefundView>();
  private readonly wechat = new MockWechatProvider();
  private readonly withdrawals = new Map<string, AgentWithdrawalView>();

  constructor(@Inject(ApprovalEngineService) private readonly approvals: ApprovalEngineService) {}

  createOrder(input: CreateOrderInput): PaymentOrderView & { charge: PaymentProviderCharge } {
    const existingId = this.ordersByIdempotency.get(input.idempotencyKey);
    if (existingId) {
      const existing = this.mustGetOrder(existingId);
      return { ...existing, charge: this.provider(existing.channel).charge(existing) };
    }
    if (input.amountCny <= 0) throw new Error('PAY.ORDER.AMOUNT_MISMATCH');

    const order: PaymentOrderView = {
      amountCny: input.amountCny,
      channel: input.channel,
      createdAt: new Date().toISOString(),
      currency: 'CNY',
      id: crypto.randomUUID(),
      idempotencyKey: input.idempotencyKey,
      metadata: input.metadata,
      status: 'pending',
      tenantId: input.tenantId,
      traceId: crypto.randomUUID(),
      type: input.type,
      userId: input.userId,
    };
    const charge = this.provider(order.channel).charge(order);
    order.externalOrderNo = charge.externalOrderNo;
    this.orders.set(order.id, order);
    this.ordersByIdempotency.set(order.idempotencyKey, order.id);
    return { ...order, charge };
  }

  getOrder(id: string, tenantId: string, userId?: string): PaymentOrderView {
    const order = this.mustGetOrder(id);
    if (order.tenantId !== tenantId || (userId && order.userId !== userId)) throw new Error('PAY.ORDER.NOT_FOUND');
    return order;
  }

  handleWebhook(channel: PayChannel, input: ProviderWebhookInput): PaymentOrderView {
    if (!this.provider(channel).verifyWebhook(input)) throw new Error('PAY.WEBHOOK.SIGNATURE_INVALID');
    const externalOrderNo = String(input.body.externalOrderNo ?? input.body.out_trade_no ?? '');
    const order = [...this.orders.values()].find((item) => item.externalOrderNo === externalOrderNo);
    if (!order) throw new Error('PAY.ORDER.NOT_FOUND');
    order.status = String(input.body.status ?? input.body.trade_status) === 'failed' ? 'failed' : 'paid';
    order.paidAt = new Date().toISOString();
    return order;
  }

  requestRefund(input: { amountCny?: number; orderId: string; reason: string; tenantId: string; userId: string }): PaymentRefundView {
    const order = this.getOrder(input.orderId, input.tenantId, input.userId);
    const amountCny = input.amountCny ?? this.refundableAmount(order);
    if (amountCny <= 0 || amountCny > order.amountCny) throw new Error('PAY.ORDER.AMOUNT_MISMATCH');
    const tier = this.resolveRefundTier(order);
    if (tier === 'none') throw new Error('PAY.REFUND.WINDOW_EXPIRED');
    const refund: PaymentRefundView = {
      amountCny,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      orderId: order.id,
      reason: input.reason,
      status: 'requested',
      tier,
    };
    const flow = this.approvals.createFlow({ resourceId: refund.id, resourceType: 'payment_refund', type: 'PAYMENT_REFUND' });
    refund.approvalFlowId = flow.id;
    this.refunds.set(refund.id, refund);
    return refund;
  }

  completeRefund(refundId: string): PaymentRefundView {
    const refund = this.mustGetRefund(refundId);
    const order = this.mustGetOrder(refund.orderId);
    const providerRefund = this.provider(order.channel).refund(refund);
    refund.externalRefundNo = providerRefund.externalRefundNo;
    refund.status = 'completed';
    refund.completedAt = new Date().toISOString();
    order.status = refund.amountCny >= order.amountCny ? 'refunded' : 'partial_refunded';
    this.clawbackOnRefund(order.id);
    return refund;
  }

  listRefunds(userId: string): PaymentRefundView[] {
    const orderIds = new Set([...this.orders.values()].filter((order) => order.userId === userId).map((order) => order.id));
    return [...this.refunds.values()].filter((refund) => orderIds.has(refund.orderId));
  }

  signWechatContract(userId: string): { channel: PayChannel; externalContractId: string; id: string; status: 'active' | 'revoked'; userId: string } {
    const contract = { channel: 'wechat' as const, externalContractId: `wx_contract_${crypto.randomUUID()}`, id: crypto.randomUUID(), status: 'active' as const, userId };
    this.contracts.set(contract.id, contract);
    return contract;
  }

  revokeContract(contractId: string): { channel: PayChannel; externalContractId: string; id: string; status: 'active' | 'revoked'; userId: string } {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error('PAY.AUTO_CHARGE.CONTRACT_REVOKED');
    contract.status = 'revoked';
    return contract;
  }

  settleCrossDomain(input: { actualAmountCny: number; assignedAgentId: string; clientTenantId: string; dispatchId: string; ownerAgentId: string }): AgentCommissionView[] {
    const fee = Number((input.actualAmountCny * 0.05).toFixed(2));
    const freezeUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const outgoing = this.createCommission(input.assignedAgentId, input.clientTenantId, 'dispatch_5pct', -fee, 'settlable', input.dispatchId);
    const incoming = this.createCommission(input.ownerAgentId, input.clientTenantId, 'dispatch_5pct', fee, 'frozen', input.dispatchId, freezeUntil);
    return [outgoing, incoming];
  }

  listCommissions(agentId: string): AgentCommissionView[] {
    return [...this.commissions.values()].filter((item) => item.agentId === agentId);
  }

  requestWithdrawal(input: { agentId: string; amountCny: number; bankCardId: string; level?: 'gold' | 'standard' | 'vip' }): AgentWithdrawalView {
    const balance = this.withdrawableBalance(input.agentId);
    if (input.amountCny < 100 || input.amountCny > 50000 || input.amountCny > balance) throw new Error('PAY.WITHDRAWAL.INSUFFICIENT_BALANCE');
    const feeCny = Number(Math.max(1, input.amountCny * 0.006).toFixed(2));
    const withdrawal: AgentWithdrawalView = {
      agentId: input.agentId,
      amountCny: input.amountCny,
      approvalFlowId: this.approvals.createFlow({ resourceId: input.agentId, resourceType: 'agent_withdrawal', type: 'AGENT_WITHDRAWAL' }).id,
      bankCardId: input.bankCardId,
      createdAt: new Date().toISOString(),
      feeCny,
      id: crypto.randomUUID(),
      status: 'requested',
    };
    this.withdrawals.set(withdrawal.id, withdrawal);
    return withdrawal;
  }

  listWithdrawals(agentId: string): AgentWithdrawalView[] {
    return [...this.withdrawals.values()].filter((item) => item.agentId === agentId);
  }

  routeRewardPayment(amountCny: number): RewardPaymentRoute {
    const taxWithheldCny = amountCny >= 800 ? Number((amountCny * 0.2).toFixed(2)) : 0;
    return {
      amountCny,
      approvalRoles: ['PLATFORM_CS', 'PLATFORM_OWNER'],
      corporateTransferRequired: amountCny >= 800,
      grossAmountCny: amountCny,
      letterId: `tax_letter_${crypto.randomUUID()}`,
      netAmountCny: Number((amountCny - taxWithheldCny).toFixed(2)),
      route: amountCny >= 800 ? 'corporate_transfer' : 'wallet',
      taxWithheldCny,
    };
  }

  private clawbackOnRefund(sourceOrderId: string): void {
    for (const commission of [...this.commissions.values()].filter((item) => item.sourceOrderId === sourceOrderId && item.status === 'frozen')) {
      this.createCommission(
        commission.agentId,
        commission.clientTenantId,
        'clawback.dispatch_5pct',
        -commission.amountCny,
        'settlable',
        commission.sourceOrderId,
      );
    }
  }

  private createCommission(
    agentId: string,
    clientTenantId: string,
    type: AgentCommissionView['type'],
    amountCny: number,
    status: AgentCommissionView['status'],
    sourceOrderId: string,
    freezeUntil?: string,
  ): AgentCommissionView {
    const commission: AgentCommissionView = {
      agentId,
      amountCny,
      clientTenantId,
      freezeUntil,
      id: crypto.randomUUID(),
      sourceOrderId,
      status,
      type,
    };
    this.commissions.set(commission.id, commission);
    return commission;
  }

  private mustGetOrder(id: string): PaymentOrderView {
    const order = this.orders.get(id);
    if (!order) throw new Error('PAY.ORDER.NOT_FOUND');
    return order;
  }

  private mustGetRefund(id: string): PaymentRefundView {
    const refund = this.refunds.get(id);
    if (!refund) throw new Error('PAY.REFUND.NOT_FOUND');
    return refund;
  }

  private provider(channel: PayChannel): PaymentProvider {
    return channel === 'wechat' ? this.wechat : this.alipay;
  }

  private refundableAmount(order: PaymentOrderView): number {
    const tier = this.resolveRefundTier(order);
    if (tier === 'full' || tier === 'system_failure') return order.amountCny;
    if (tier === 'half') return Number((order.amountCny * 0.5).toFixed(2));
    return 0;
  }

  private resolveRefundTier(order: PaymentOrderView): RefundTier {
    if (!order.paidAt) return 'full';
    const daysSincePaid = Math.floor((Date.now() - new Date(order.paidAt).getTime()) / 86_400_000);
    if (daysSincePaid <= 7) return 'full';
    if (daysSincePaid <= 30) return 'half';
    return 'none';
  }

  private withdrawableBalance(agentId: string): number {
    return this.listCommissions(agentId)
      .filter((item) => item.status === 'settlable' || item.status === 'withdrawable')
      .reduce((sum, item) => sum + item.amountCny, 0);
  }
}
