import type { EntityId, IdempotencyKey, TenantId, TraceId, UserId } from '../common/protocol.js';

import type { CreditLotAllocation } from './lot.js';

export enum CreditTransactionType {
  PRE_CHARGE = 'pre_charge',
  COMMIT = 'commit',
  REFUND = 'refund',
  TOP_UP = 'top_up',
  GIFT = 'gift',
  EXPIRE = 'expire',
  VOID = 'void',
  FREEZE = 'freeze',
  UNFREEZE = 'unfreeze',
}

export enum CreditTransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

export interface CreditTransaction {
  id: EntityId;
  tenantId: TenantId;
  userId: UserId;
  type: CreditTransactionType;
  status: CreditTransactionStatus;
  amount: number;
  idempotencyKey: IdempotencyKey;
  traceId: TraceId;
  allocations: readonly CreditLotAllocation[];
  relatedTransactionId?: EntityId;
  taskId?: EntityId;
  reason?: string;
  createdAt: string;
}

export interface CreditBalanceSnapshot {
  tenantId: TenantId;
  userId: UserId;
  subscriptionCredits: number;
  giftCredits: number;
  topUpCredits: number;
  reservedCredits: number;
  totalAvailableCredits: number;
  asOf: string;
}

export const CREDIT_TRANSACTION_TYPE_VALUES = Object.values(CreditTransactionType);
export const CREDIT_TRANSACTION_STATUS_VALUES = Object.values(CreditTransactionStatus);

export type CreditTransactionTypeValue = `${CreditTransactionType}`;
export type CreditTransactionStatusValue = `${CreditTransactionStatus}`;
