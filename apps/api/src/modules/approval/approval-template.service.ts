import { Injectable } from '@nestjs/common';

export interface ApprovalTemplateStep {
  approverRole: string;
  requires2fa: boolean;
  stepNo: number;
}

export interface ApprovalTemplate {
  id: string;
  steps: ApprovalTemplateStep[];
  type: string;
  version: number;
}

const DEFAULT_TEMPLATES: ApprovalTemplate[] = [
  { id: 'tpl-refund-v1', steps: [{ approverRole: 'PLATFORM_FIN', requires2fa: true, stepNo: 1 }], type: 'refund', version: 1 },
  { id: 'tpl-withdrawal-v1', steps: [{ approverRole: 'PLATFORM_FIN', requires2fa: true, stepNo: 1 }], type: 'withdrawal', version: 1 },
  { id: 'tpl-data-export-v1', steps: [{ approverRole: 'OWNER', requires2fa: true, stepNo: 1 }], type: 'data-export', version: 1 },
  { id: 'tpl-platform-user-create-v1', steps: [{ approverRole: 'PLATFORM_OWNER', requires2fa: true, stepNo: 1 }], type: 'platform-user-create', version: 1 },
];

@Injectable()
export class ApprovalTemplateService {
  getActive(type: string): ApprovalTemplate {
    return DEFAULT_TEMPLATES.find((template) => template.type === type) ?? {
      id: `tpl-${type}-v1`,
      steps: [{ approverRole: 'OWNER', requires2fa: false, stepNo: 1 }],
      type,
      version: 1,
    };
  }

  list(): ApprovalTemplate[] {
    return DEFAULT_TEMPLATES;
  }
}
