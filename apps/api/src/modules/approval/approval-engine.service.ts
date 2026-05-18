import { Injectable } from '@nestjs/common';

import type { ApprovalTemplateService } from './approval-template.service.js';

export interface ApprovalFlow {
  closedAt?: string;
  id: string;
  resourceId: string;
  resourceType: string;
  status: 'approved' | 'pending' | 'rejected';
  steps: Array<{ approverId?: string; approverRole: string; decision: 'approved' | 'pending' | 'rejected'; requires2fa: boolean; stepNo: number }>;
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
      status: 'pending',
      steps: template.steps.map((step) => ({ ...step, decision: 'pending' })),
      type: input.type,
    };
    this.flows.set(flow.id, flow);
    return flow;
  }

  sign(flowId: string, input: { approverId: string; decision: 'approved' | 'rejected'; twoFactorCode?: string }): ApprovalFlow {
    const flow = this.flows.get(flowId);
    if (!flow) throw new Error('AUTH.APPROVAL.NOT_FOUND');
    const step = flow.steps.find((item) => item.decision === 'pending');
    if (!step) throw new Error('AUTH.APPROVAL.NO_PENDING_STEP');
    if (step.requires2fa && !input.twoFactorCode) throw new Error('AUTH.2FA.INVALID');
    step.approverId = input.approverId;
    step.decision = input.decision;
    if (input.decision === 'rejected') {
      flow.status = 'rejected';
      flow.closedAt = new Date().toISOString();
    } else if (flow.steps.every((item) => item.decision === 'approved')) {
      flow.status = 'approved';
      flow.closedAt = new Date().toISOString();
    }
    return flow;
  }

  pending(): ApprovalFlow[] {
    return [...this.flows.values()].filter((flow) => flow.status === 'pending');
  }
}
