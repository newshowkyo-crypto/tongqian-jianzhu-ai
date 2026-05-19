import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { ApprovalTemplateService } from './approval-template.service.js';

export interface ApprovalFlow {
  auditTrail?: Array<{ action: string; actorId?: string; at: string; note?: string }>;
  closedAt?: string;
  id: string;
  resourceId: string;
  resourceType: string;
  status: 'approved' | 'pending' | 'rejected';
  steps: Array<{ approverId?: string; approverRole: string; decision: 'approved' | 'pending' | 'rejected' | 'transferred'; requires2fa: boolean; stepNo: number; transferredToRole?: string }>;
  type: string;
}

@Injectable()
export class ApprovalEngineService {
  private readonly flows = new Map<string, ApprovalFlow>();

  constructor(private readonly templates: ApprovalTemplateService) {}

  createFlow(input: { resourceId: string; resourceType: string; type: string }): ApprovalFlow {
    const template = this.templates.getActive(input.type);
    const flow: ApprovalFlow = {
      id: crypto.randomUUID(),
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      auditTrail: [{ action: 'approval.flow.created', at: new Date().toISOString(), note: `${input.resourceType}:${input.resourceId}` }],
      status: 'pending',
      steps: template.steps.map((step) => ({ ...step, decision: 'pending' })),
      type: input.type,
    };
    this.flows.set(flow.id, flow);
    return flow;
  }

  sign(flowId: string, input: { approverId: string; decision: 'approved' | 'rejected'; twoFactorCode?: string }): ApprovalFlow {
    const flow = this.flows.get(flowId);
    if (!flow) throw this.error('AUTH.APPROVAL.NOT_FOUND', { flowId });
    const step = flow.steps.find((item) => item.decision === 'pending');
    if (!step) throw this.error('AUTH.APPROVAL.NO_PENDING_STEP', { flowId });
    if (step.requires2fa && !this.verifySecondFactor(input.twoFactorCode)) throw this.error('AUTH.2FA.INVALID', { flowId, stepNo: step.stepNo });
    step.approverId = input.approverId;
    step.decision = input.decision;
    flow.auditTrail?.push({ action: `approval.step.${input.decision}`, actorId: input.approverId, at: new Date().toISOString(), note: `step:${step.stepNo}` });
    if (input.decision === 'rejected') {
      flow.status = 'rejected';
      flow.closedAt = new Date().toISOString();
    } else if (flow.steps.every((item) => item.decision === 'approved')) {
      flow.status = 'approved';
      flow.closedAt = new Date().toISOString();
    }
    return flow;
  }

  /**
   * Transfers the current pending step to another approver role with an audit trail.
   *
   * @param flowId Approval flow id.
   * @param input Actor and target role.
   * @returns Updated flow.
   */
  transfer(flowId: string, input: { actorId: string; reason: string; targetRole: string; twoFactorCode?: string }): ApprovalFlow {
    const flow = this.flows.get(flowId);
    if (!flow) throw this.error('AUTH.APPROVAL.NOT_FOUND', { flowId });
    if (!this.verifySecondFactor(input.twoFactorCode)) throw this.error('AUTH.2FA.INVALID', { flowId, action: 'transfer' });
    const step = flow.steps.find((item) => item.decision === 'pending');
    if (!step) throw this.error('AUTH.APPROVAL.NO_PENDING_STEP', { flowId });
    step.transferredToRole = input.targetRole;
    step.approverRole = input.targetRole;
    flow.auditTrail?.push({ action: 'approval.step.transferred', actorId: input.actorId, at: new Date().toISOString(), note: input.reason });
    return flow;
  }

  pending(): ApprovalFlow[] {
    return [...this.flows.values()].filter((flow) => flow.status === 'pending');
  }

  /**
   * Reads approval detail with the four-step state-machine projection used by admin console.
   *
   * @param flowId Approval flow id.
   * @returns Current state projection.
   */
  getState(flowId: string): { closedAt?: string; currentStep?: number; flow: ApprovalFlow; nextAction: 'approve' | 'closed' | 'reject' | 'transfer' } {
    const flow = this.flows.get(flowId);
    if (!flow) throw this.error('AUTH.APPROVAL.NOT_FOUND', { flowId });
    return {
      closedAt: flow.closedAt,
      currentStep: flow.steps.find((item) => item.decision === 'pending')?.stepNo,
      flow,
      nextAction: flow.status === 'pending' ? 'approve' : 'closed',
    };
  }

  /**
   * Lists flows by resource while preserving tenant/resource boundaries for callers.
   *
   * @param resourceType Resource type.
   * @param resourceId Resource id.
   * @returns Matching flows.
   */
  listByResource(resourceType: string, resourceId: string): ApprovalFlow[] {
    return [...this.flows.values()].filter((flow) => flow.resourceType === resourceType && flow.resourceId === resourceId);
  }

  private verifySecondFactor(code?: string): boolean {
    return Boolean(code && code.length >= 4);
  }

  private error(code: string, details: Record<string, unknown>): BusinessError {
    return new BusinessError({ code: ErrorCodes.PERM_ACTION_DENIED.code, details: { ...details, code }, message: code });
  }
}
