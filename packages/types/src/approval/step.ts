import type { EntityId, UserId } from '../common/protocol.js';

import type { ApprovalDecision } from './decision.js';

export enum ApprovalApproverRole {
  OWNER = 'OWNER',
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  OPS_MANAGER = 'OPS_MANAGER',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  CUSTOMER_SUCCESS = 'CUSTOMER_SUCCESS',
  QUALITY_AUDITOR = 'QUALITY_AUDITOR',
  SECURITY_AUDITOR = 'SECURITY_AUDITOR',
}

export interface ApprovalStepTemplate {
  stepNo: number;
  approverRole: ApprovalApproverRole;
  required: boolean;
  requires2fa: boolean;
  timeoutHours?: number;
}

export interface ApprovalStep {
  id: EntityId;
  flowId: EntityId;
  stepNo: number;
  approverRole: ApprovalApproverRole;
  approverId?: UserId;
  required: boolean;
  requires2fa: boolean;
  decision: ApprovalDecision;
  reason?: string;
  signedAt?: string;
}

export interface ApprovalTemplate {
  id: EntityId;
  type: string;
  version: number;
  steps: readonly ApprovalStepTemplate[];
  isActive: boolean;
  createdBy: UserId;
  createdAt: string;
}

export const APPROVAL_APPROVER_ROLE_VALUES = Object.values(ApprovalApproverRole);

export type ApprovalApproverRoleValue = `${ApprovalApproverRole}`;
