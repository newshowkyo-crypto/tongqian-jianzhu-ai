import type { EntityId, TenantId, UserId } from '../common/protocol.js';

import type { CreditSourceType } from './expiry.js';

export enum CreditLotStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  FROZEN = 'frozen',
  EXPIRED = 'expired',
  VOIDED = 'voided',
}

export enum CreditDeductionPriority {
  SUBSCRIPTION_EARLIEST_EXPIRY = 1,
  GIFT_EARLIEST_EXPIRY = 2,
  TOP_UP_NEVER_EXPIRES = 3,
}

export interface CreditLot {
  id: EntityId;
  tenantId: TenantId;
  userId: UserId;
  sourceType: CreditSourceType;
  status: CreditLotStatus;
  originalAmount: number;
  availableAmount: number;
  reservedAmount: number;
  consumedAmount: number;
  refundedAmount: number;
  sourceRefId?: EntityId;
  expiresAt?: string;
  frozenUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditLotAllocation {
  lotId: EntityId;
  sourceType: CreditSourceType;
  amount: number;
  expiresAt?: string;
  priority: CreditDeductionPriority;
}

export const CREDIT_LOT_STATUS_VALUES = Object.values(CreditLotStatus);
export const CREDIT_DEDUCTION_PRIORITY_VALUES = Object.values(CreditDeductionPriority);

export type CreditLotStatusValue = `${CreditLotStatus}`;
