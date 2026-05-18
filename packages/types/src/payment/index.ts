export type PayChannel = 'alipay' | 'wechat';
export type PayStatus = 'canceled' | 'failed' | 'paid' | 'partial_refunded' | 'pending' | 'refunded';
export type PaymentOrderType = 'commission_settle' | 'consulting_order' | 'reward' | 'subscription' | 'topup';
export type RefundTier = 'full' | 'half' | 'none' | 'system_failure';
export type CommissionStatus = 'frozen' | 'paid' | 'settlable' | 'withdrawable';
export type WithdrawalStatus = 'approved' | 'failed' | 'paid' | 'rejected' | 'requested';

export interface PaymentOrderView {
  amountCny: number;
  channel: PayChannel;
  createdAt: string;
  currency: 'CNY';
  externalOrderNo?: string;
  id: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  paidAt?: string;
  status: PayStatus;
  tenantId: string;
  traceId: string;
  type: PaymentOrderType;
  userId: string;
}

export interface PaymentProviderCharge {
  externalOrderNo: string;
  mock: boolean;
  paymentUrl: string;
  provider: PayChannel;
}

export interface PaymentRefundView {
  amountCny: number;
  approvalFlowId?: string;
  completedAt?: string;
  createdAt: string;
  externalRefundNo?: string;
  id: string;
  orderId: string;
  reason: string;
  status: 'approved' | 'completed' | 'rejected' | 'requested';
  tier: RefundTier;
}

export interface AgentCommissionView {
  agentId: string;
  amountCny: number;
  clientTenantId: string;
  freezeUntil?: string;
  id: string;
  paidAt?: string;
  settledAt?: string;
  sourceOrderId: string;
  status: CommissionStatus;
  type: 'clawback.dispatch_5pct' | 'dispatch_5pct' | 'referral_fee' | 'subscribe_y1' | 'subscribe_y2+' | 'topup';
}

export interface AgentWithdrawalView {
  agentId: string;
  amountCny: number;
  approvalFlowId?: string;
  bankCardId: string;
  createdAt: string;
  externalPayoutNo?: string;
  feeCny: number;
  id: string;
  paidAt?: string;
  status: WithdrawalStatus;
}

export interface RewardPaymentRoute {
  amountCny: number;
  approvalRoles: ['PLATFORM_CS', 'PLATFORM_OWNER'];
  corporateTransferRequired: boolean;
  grossAmountCny: number;
  letterId: string;
  netAmountCny: number;
  route: 'corporate_transfer' | 'wallet';
  taxWithheldCny: number;
}
