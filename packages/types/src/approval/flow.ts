import type { EntityId, TenantId, UserId } from '../common/protocol.js';

export enum ApprovalFlowType {
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  DATA_EXPORT = 'data_export',
  SEAL_USAGE = 'seal_usage',
  AGENT_APPEAL = 'agent_appeal',
  PLATFORM_USER_CREATE = 'platform_user_create',
  CONTRACT_APPROVAL = 'contract_approval',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}

export interface ApprovalFlow {
  id: EntityId;
  type: ApprovalFlowType;
  status: ApprovalStatus;
  resourceType: string;
  resourceId: EntityId;
  initiatorId: UserId;
  tenantId?: TenantId;
  templateId: EntityId;
  currentStepNo: number;
  meta?: Record<string, unknown>;
  expiresAt?: string;
  createdAt: string;
  closedAt?: string;
}

export interface ApprovalRequest<TPayload = Record<string, unknown>> {
  type: ApprovalFlowType;
  resourceType: string;
  resourceId: EntityId;
  initiatorId: UserId;
  tenantId?: TenantId;
  payload: TPayload;
  idempotencyKey: string;
  expiresAt?: string;
}

export const APPROVAL_FLOW_TYPE_VALUES = Object.values(ApprovalFlowType);
export const APPROVAL_STATUS_VALUES = Object.values(ApprovalStatus);

export type ApprovalFlowTypeValue = `${ApprovalFlowType}`;
export type ApprovalStatusValue = `${ApprovalStatus}`;
