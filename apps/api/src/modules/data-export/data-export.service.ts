import { Inject, Injectable } from '@nestjs/common';

import { ApprovalEngineService } from '../approval/approval-engine.service.js';
import type { ApprovalFlow } from '../approval/approval-engine.service.js';

@Injectable()
export class DataExportService {
  constructor(@Inject(ApprovalEngineService) private readonly approvals: ApprovalEngineService) {}

  request(input: { requesterRole: string; resourceId: string; twoFactorCode?: string }): ApprovalFlow {
    if (!['OWNER', 'PLATFORM_OWNER'].includes(input.requesterRole)) {
      throw new Error('PERM.DENIED');
    }
    if (!input.twoFactorCode) {
      throw new Error('AUTH.2FA.INVALID');
    }
    return this.approvals.createFlow({ resourceId: input.resourceId, resourceType: 'data-export', type: 'data-export' });
  }
}
