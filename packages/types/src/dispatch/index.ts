import type { EntityId, TenantId, UserId } from '../common/protocol.js';

export enum DispatchNeedClass {
  A_STANDARD = 'A',
  B_PREMIUM = 'B',
  C_SELF_SERVICE = 'C',
}

export enum DispatchPoolType {
  OWNED = 'owned',
  CROSS_DOMAIN = 'cross',
  PUBLIC = 'public',
  CUSTOMER_SERVICE = 'customer_service',
}

export enum DispatchStatus {
  DRAFT = 'draft',
  MATCHING = 'matching',
  QUOTING = 'quoting',
  CUSTOMER_SELECTING = 'customer_selecting',
  ACCEPTED = 'accepted',
  IN_SERVICE = 'in_service',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  ESCALATED = 'escalated',
}

export enum DispatchQuoteColor {
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
  OVERPRICE = 'overprice',
  UNKNOWN = 'unknown',
}

export interface DispatchCandidateScore {
  agentUserId: UserId;
  regionScore: number;
  subtypeScore: number;
  reputationScore: number;
  monthlySatisfactionScore: number;
  totalScore: number;
}

export interface DispatchOrderRef {
  id: EntityId;
  tenantId: TenantId;
  needClass: DispatchNeedClass;
  poolType: DispatchPoolType;
  status: DispatchStatus;
  ownerAgentUserId?: UserId;
  selectedAgentUserId?: UserId;
  createdAt: string;
}

export const DISPATCH_NEED_CLASS_VALUES = Object.values(DispatchNeedClass);
export const DISPATCH_POOL_TYPE_VALUES = Object.values(DispatchPoolType);
export const DISPATCH_STATUS_VALUES = Object.values(DispatchStatus);
export const DISPATCH_QUOTE_COLOR_VALUES = Object.values(DispatchQuoteColor);

export type DispatchNeedClassValue = `${DispatchNeedClass}`;
export type DispatchPoolTypeValue = `${DispatchPoolType}`;
export type DispatchStatusValue = `${DispatchStatus}`;
export type DispatchQuoteColorValue = `${DispatchQuoteColor}`;
