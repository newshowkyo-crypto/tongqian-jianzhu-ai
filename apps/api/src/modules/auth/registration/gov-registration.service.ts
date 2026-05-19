import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class GovRegistrationService {
  /**
   * Registers a government or SOE tenant in pending review status.
   *
   * @param input Registration input.
   * @returns Pending review registration result.
   */
  register(input: RegistrationInput): RegistrationResult {
    this.validate(input);
    return { approvalRequired: true, defaultDashboard: 'owner', status: 'pending_review', tenantId: crypto.randomUUID(), userId: crypto.randomUUID() };
  }

  /**
   * Checks official letter metadata for public-sector onboarding.
   *
   * @param input Letter metadata.
   * @returns Review decision.
   */
  reviewOfficialLetter(input: { fileId?: string; organizationName?: string }): { passed: boolean; reason: string } {
    if (!input.fileId) return { passed: false, reason: 'official-letter-missing' };
    if (!input.organizationName || input.organizationName.length < 2) return { passed: false, reason: 'organization-name-missing' };
    return { passed: true, reason: 'pending-manual-review' };
  }

  /**
   * Returns compliance restrictions for government workspace.
   *
   * @returns Restriction keys.
   */
  restrictions(): string[] {
    return ['domestic-model-only', 'watermark-required', 'no-cross-tenant-project-source', 'audit-retention-six-years'];
  }

  /**
   * Builds pending approval work item for platform operations.
   *
   * @param input Registration input.
   * @returns Work item metadata.
   */
  buildApprovalTicket(input: RegistrationInput): Record<string, string> {
    this.validate(input);
    return {
      action: 'GOV_REGISTRATION_REVIEW',
      applicant: input.name,
      phoneMasked: input.phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2'),
      sla: '72h',
    };
  }

  /**
   * Returns default workspace safeguards after approval.
   *
   * @returns Safeguard flags.
   */
  defaultSafeguards(): Record<string, boolean> {
    return { domesticProviderOnly: true, reportWatermark: true, sensitiveExportApproval: true, traceRequired: true };
  }

  /**
   * Returns the default review checklist for official public-sector applications.
   *
   * @returns Checklist item keys.
   */
  reviewChecklist(): string[] {
    return ['official-letter-uploaded', 'unit-name-matches-seal', 'domestic-model-only-acknowledged', 'watermark-policy-accepted'];
  }

  /**
   * Produces audit metadata for public-sector onboarding.
   *
   * @param input Registration input.
   * @returns Audit metadata.
   */
  toAudit(input: RegistrationInput): Record<string, string> {
    return { action: 'GOV_REGISTRATION_SUBMIT', applicant: input.name, phoneMasked: input.phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2') };
  }

  private validate(input: RegistrationInput): void {
    if (input.role !== 'GOV_USER' || !input.phone || !input.name) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Government registration input is incomplete.' });
    }
  }
}
