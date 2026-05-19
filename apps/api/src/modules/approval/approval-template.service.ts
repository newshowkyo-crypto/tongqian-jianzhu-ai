import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

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
  { id: 'tpl-contract-review-v1', steps: [{ approverRole: 'OWNER', requires2fa: true, stepNo: 1 }, { approverRole: 'LEGAL_REVIEWER', requires2fa: false, stepNo: 2 }], type: 'contract', version: 1 },
  { id: 'tpl-refund-v1', steps: [{ approverRole: 'PLATFORM_FIN', requires2fa: true, stepNo: 1 }], type: 'refund', version: 1 },
  { id: 'tpl-withdrawal-v1', steps: [{ approverRole: 'PLATFORM_FIN', requires2fa: true, stepNo: 1 }], type: 'withdrawal', version: 1 },
  { id: 'tpl-qualification-v1', steps: [{ approverRole: 'QUAL_MANAGER', requires2fa: false, stepNo: 1 }, { approverRole: 'OWNER', requires2fa: true, stepNo: 2 }], type: 'qualification', version: 1 },
  { id: 'tpl-data-export-v1', steps: [{ approverRole: 'OWNER', requires2fa: true, stepNo: 1 }], type: 'data-export', version: 1 },
  { id: 'tpl-platform-user-create-v1', steps: [{ approverRole: 'PLATFORM_OWNER', requires2fa: true, stepNo: 1 }], type: 'platform-user-create', version: 1 },
];

@Injectable()
export class ApprovalTemplateService {
  private readonly templates = new Map<string, ApprovalTemplate>(DEFAULT_TEMPLATES.map((template) => [template.id, template]));

  /**
   * Returns the latest template by type, falling back to an owner-only flow.
   *
   * @param type Approval type.
   * @returns Active approval template.
   */
  getActive(type: string): ApprovalTemplate {
    return [...this.templates.values()].filter((template) => template.type === type).sort((a, b) => b.version - a.version)[0] ?? {
      id: `tpl-${type}-v1`,
      steps: [{ approverRole: 'OWNER', requires2fa: false, stepNo: 1 }],
      type,
      version: 1,
    };
  }

  /**
   * Lists all templates for admin seed and CRUD screens.
   *
   * @returns Approval templates.
   */
  list(): ApprovalTemplate[] {
    return [...this.templates.values()].sort((a, b) => a.type.localeCompare(b.type) || b.version - a.version);
  }

  /**
   * Creates a new approval template version with normalized step numbers.
   *
   * @param input Template fields.
   * @returns Created template.
   */
  create(input: Omit<ApprovalTemplate, 'id' | 'version'> & { version?: number }): ApprovalTemplate {
    const version = input.version ?? this.nextVersion(input.type);
    const template: ApprovalTemplate = {
      id: `tpl-${input.type}-v${version}`,
      steps: input.steps.map((step, index) => ({ ...step, stepNo: index + 1 })),
      type: input.type,
      version,
    };
    this.assertValid(template);
    this.templates.set(template.id, template);
    return template;
  }

  /**
   * Updates an existing template; used by platform-owner approval configuration.
   *
   * @param id Template id.
   * @param patch Template patch.
   * @returns Updated template.
   */
  update(id: string, patch: Partial<ApprovalTemplate>): ApprovalTemplate {
    const current = this.templates.get(id);
    if (!current) throw this.notFound(id);
    const updated = { ...current, ...patch, id, steps: patch.steps ?? current.steps };
    this.assertValid(updated);
    this.templates.set(id, updated);
    return updated;
  }

  /**
   * Removes a template version while leaving default fallbacks intact.
   *
   * @param id Template id.
   */
  remove(id: string): void {
    if (!this.templates.delete(id)) throw this.notFound(id);
  }

  private nextVersion(type: string): number {
    return Math.max(0, ...[...this.templates.values()].filter((template) => template.type === type).map((template) => template.version)) + 1;
  }

  private assertValid(template: ApprovalTemplate): void {
    if (template.steps.length === 0 || template.steps.some((step) => !step.approverRole)) {
      throw new BusinessError({ code: ErrorCodes.RULE_EVALUATION_FAILED.code, details: { template }, message: 'Approval template requires approver steps.' });
    }
  }

  private notFound(id: string): BusinessError {
    return new BusinessError({ code: ErrorCodes.RULE_EVALUATION_FAILED.code, details: { id }, message: 'Approval template not found.' });
  }
}
