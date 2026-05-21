import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { AttributionService } from './attribution.service.js';
import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class BuildingCompanyRegistrationService {
  constructor(
    @Inject(AttributionService)
    private readonly attribution: AttributionService,
  ) {}

  /**
   * Registers a building company tenant after phone and license checks.
   *
   * @param input Registration input.
   * @returns Active owner dashboard registration.
   */
  register(input: RegistrationInput): RegistrationResult {
    this.validate(input);
    const tenantId = crypto.randomUUID();
    this.attribution.bind(tenantId, input.ref);
    return { approvalRequired: false, defaultDashboard: 'owner', status: 'active', tenantId, userId: crypto.randomUUID() };
  }

  /**
   * Performs a local unified social credit code check for development mode.
   *
   * @param code Unified social credit code.
   * @returns Verification result.
   */
  verifyBusinessLicense(code?: string): { passed: boolean; reason: string } {
    if (!code) return { passed: false, reason: 'missing-social-credit-code' };
    return /^[0-9A-HJ-NPQRTUWXY]{18}$/u.test(code) ? { passed: true, reason: 'format-pass' } : { passed: false, reason: 'format-invalid' };
  }

  /**
   * Builds onboarding tasks for first-day activation.
   *
   * @returns Onboarding task keys.
   */
  onboardingTasks(): string[] {
    return ['complete-company-profile', 'invite-owner-team', 'run-first-ai-report', 'enable-morning-briefing'];
  }

  /**
   * Builds the initial free-credit activation package.
   *
   * @returns Credit package metadata.
   */
  activationPackage(): { credits: number; reason: string; validDays: number } {
    return { credits: 500, reason: 'registration-gift', validDays: 30 };
  }

  /**
   * Produces audit-safe registration metadata.
   *
   * @param input Registration input.
   * @returns Audit metadata.
   */
  toAudit(input: RegistrationInput): Record<string, string | undefined> {
    return {
      action: 'BUILDING_COMPANY_REGISTER',
      name: input.name,
      phoneMasked: input.phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2'),
      ref: input.ref,
      socialCreditCodeTail: input.socialCreditCode?.slice(-4),
    };
  }

  /**
   * Returns default tenant isolation scope for the first owner account.
   *
   * @returns Scope defaults.
   */
  defaultScope(): Record<string, string> {
    return { ownerScope: 'tenant', projectScope: 'all', scopeType: 'company' };
  }

  private validate(input: RegistrationInput): void {
    if (input.role !== 'BUILDING_COMPANY_USER' || !input.phone || !input.name) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Building company registration input is incomplete.' });
    }
    const license = this.verifyBusinessLicense(input.socialCreditCode);
    if (input.socialCreditCode && !license.passed) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, details: license, message: 'Business license check failed.' });
    }
  }
}
