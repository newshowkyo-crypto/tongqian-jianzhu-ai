import type { EntityId, TraceId, UserId } from '../common/protocol.js';

export enum ApprovalDecision {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ApprovalDecisionRequest {
  flowId: EntityId;
  stepId: EntityId;
  approverId: UserId;
  decision: Exclude<ApprovalDecision, ApprovalDecision.PENDING>;
  reason?: string;
  twoFactorToken?: string;
  traceId: TraceId;
}

export interface ApprovalDecisionResult {
  flowId: EntityId;
  stepId: EntityId;
  decision: ApprovalDecision;
  flowClosed: boolean;
  nextStepNo?: number;
  traceId: TraceId;
  decidedAt: string;
}

export const APPROVAL_DECISION_VALUES = Object.values(ApprovalDecision);

export type ApprovalDecisionValue = `${ApprovalDecision}`;
