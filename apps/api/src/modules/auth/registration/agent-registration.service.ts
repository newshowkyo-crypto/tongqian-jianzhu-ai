import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AGENT_SUBTYPE_VALUES, type AgentSubtype } from '@tongqian/types';

import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class AgentRegistrationService {
  register(input: RegistrationInput): RegistrationResult {
    this.validate(input);
    return { approvalRequired: true, defaultDashboard: 'agent', status: 'pending_review', tenantId: crypto.randomUUID(), userId: crypto.randomUUID() };
  }

  complianceCommitments(): string[] {
    return ['real-name-verified', 'no-private-deal', 'no-b-class-private-service', 'business-tool-ready', 'audit-accepted'];
  }

  /**
   * Builds the 24-72h review queue payload for admin agents page.
   *
   * @param input Registration input.
   * @returns Review payload.
   */
  buildReviewQueueItem(input: RegistrationInput): Record<string, string | boolean> {
    this.validate(input);
    return {
      applicantName: input.name,
      complianceReady: String(Boolean(input.agentSubtype)),
      phoneMasked: input.phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2'),
      reviewSla: '24-72h',
      subtype: input.agentSubtype ?? 'AGENT_GENERAL',
    };
  }

  /**
   * Checks whether the applicant can enter dispatch after review.
   *
   * @param input Review state.
   * @returns Decision with reason.
   */
  canActivate(input: { reviewApproved: boolean }): { allowed: boolean; reason: string } {
    if (!input.reviewApproved) return { allowed: false, reason: 'review-pending' };
    return { allowed: true, reason: 'lv2-baseline-ready' };
  }

  private validate(input: RegistrationInput): void {
    if (!input.phone || !input.name || input.role !== 'AGENT') {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Agent registration input is incomplete.' });
    }
    if (input.agentSubtype && !AGENT_SUBTYPE_VALUES.includes(input.agentSubtype as AgentSubtype)) {
      throw new BusinessError({ code: ErrorCodes.AGENT_PROFILE_INCOMPLETE.code, details: { agentSubtype: input.agentSubtype }, message: 'Agent subtype is invalid.' });
    }
  }
}
