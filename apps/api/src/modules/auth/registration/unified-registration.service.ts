import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { AgentRegistrationService } from './agent-registration.service.js';
import { BuildingCompanyRegistrationService } from './building-company-registration.service.js';
import { ConflictDetectorService } from './conflict-detector.service.js';
import { DomainRouterService } from './domain-router.service.js';
import { GovRegistrationService } from './gov-registration.service.js';
import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class UnifiedRegistrationService {
  constructor(
    @Inject(AgentRegistrationService)
    private readonly agentRegistration: AgentRegistrationService,
    @Inject(BuildingCompanyRegistrationService)
    private readonly buildingRegistration: BuildingCompanyRegistrationService,
    @Inject(ConflictDetectorService)
    private readonly conflictDetector: ConflictDetectorService,
    @Inject(DomainRouterService)
    private readonly domainRouter: DomainRouterService,
    @Inject(GovRegistrationService)
    private readonly govRegistration: GovRegistrationService,
  ) {}

  register(input: RegistrationInput): RegistrationResult {
    const role = this.domainRouter.resolve(input.domain) ?? input.role;
    const conflict = this.conflictDetector.check(input.phone, role, this.extractSignals(input));
    if (!conflict.ok) {
      throw new BusinessError({ code: ErrorCodes.FRAUD_RISK_DETECTED.code, details: conflict, message: `AUTH.REGISTER.${conflict.reason}` });
    }

    const result = this.dispatchByRole({ ...input, role });

    this.conflictDetector.rememberSignals({ ...this.extractSignals(input), phone: input.phone }, role);
    return result;
  }

  /**
   * Previews the registration route without creating a user.
   *
   * @param input Registration input.
   * @returns Resolved role and next onboarding route.
   */
  previewRoute(input: RegistrationInput): { conflict?: string; dashboard: string; role: RegistrationInput['role']; source: 'domain' | 'form' } {
    const role = this.domainRouter.resolve(input.domain) ?? input.role;
    const conflict = this.conflictDetector.check(input.phone, role, this.extractSignals(input));
    return {
      conflict: conflict.ok ? undefined : conflict.reason,
      dashboard: role === 'AGENT' ? '/agent/dashboard' : role === 'GOV_USER' ? '/gov/funds' : '/dashboard',
      role,
      source: this.domainRouter.resolve(input.domain) ? 'domain' : 'form',
    };
  }

  /**
   * Routes registration input to one of the four public registration surfaces.
   *
   * @param input Registration input.
   * @returns Registration result.
   */
  dispatchByRole(input: RegistrationInput): RegistrationResult {
    if (input.role === 'AGENT') return this.agentRegistration.register(input);
    if (input.role === 'GOV_USER') return this.govRegistration.register(input);
    if (input.role === 'PLATFORM') {
      throw new BusinessError({ code: ErrorCodes.PERM_ACTION_DENIED.code, details: { role: input.role }, message: 'Platform user registration requires admin approval.' });
    }
    return this.buildingRegistration.register(input);
  }

  private extractSignals(input: RegistrationInput): { deviceFingerprint?: string; idCard?: string; ip?: string; licenseNo?: string } {
    const extra = input as RegistrationInput & { deviceFingerprint?: string; idCard?: string; ip?: string; licenseNo?: string };
    return {
      deviceFingerprint: extra.deviceFingerprint,
      idCard: extra.idCard,
      ip: extra.ip,
      licenseNo: extra.licenseNo,
    };
  }
}
