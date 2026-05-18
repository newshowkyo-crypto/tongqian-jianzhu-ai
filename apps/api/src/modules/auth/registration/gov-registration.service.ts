import { Injectable } from '@nestjs/common';

import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class GovRegistrationService {
  register(_input: RegistrationInput): RegistrationResult {
    return { approvalRequired: true, defaultDashboard: 'owner', status: 'pending_review', tenantId: crypto.randomUUID(), userId: crypto.randomUUID() };
  }
}
