import { Injectable } from '@nestjs/common';

import type { AgentRegistrationService } from './agent-registration.service.js';
import type { BuildingCompanyRegistrationService } from './building-company-registration.service.js';
import type { ConflictDetectorService } from './conflict-detector.service.js';
import type { DomainRouterService } from './domain-router.service.js';
import type { GovRegistrationService } from './gov-registration.service.js';
import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class UnifiedRegistrationService {
  constructor(
    private readonly agentRegistration: AgentRegistrationService,
    private readonly buildingRegistration: BuildingCompanyRegistrationService,
    private readonly conflictDetector: ConflictDetectorService,
    private readonly domainRouter: DomainRouterService,
    private readonly govRegistration: GovRegistrationService,
  ) {}

  register(input: RegistrationInput): RegistrationResult {
    const role = this.domainRouter.resolve(input.domain) ?? input.role;
    const conflict = this.conflictDetector.check(input.phone, role);
    if (!conflict.ok) {
      throw new Error(`AUTH.REGISTER.${conflict.reason}`);
    }

    const result =
      role === 'AGENT' ? this.agentRegistration.register({ ...input, role }) : role === 'GOV_USER' ? this.govRegistration.register({ ...input, role }) : this.buildingRegistration.register({ ...input, role });

    this.conflictDetector.remember(input.phone, role);
    return result;
  }
}
