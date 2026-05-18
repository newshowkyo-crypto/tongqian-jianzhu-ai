import { Injectable } from '@nestjs/common';

import type { AttributionService } from './attribution.service.js';
import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class BuildingCompanyRegistrationService {
  constructor(private readonly attribution: AttributionService) {}

  register(input: RegistrationInput): RegistrationResult {
    const tenantId = crypto.randomUUID();
    this.attribution.bind(tenantId, input.ref);
    return { approvalRequired: false, defaultDashboard: 'owner', status: 'active', tenantId, userId: crypto.randomUUID() };
  }
}
