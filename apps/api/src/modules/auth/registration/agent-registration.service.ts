import { Injectable } from '@nestjs/common';

import type { RegistrationInput, RegistrationResult } from './registration-types.js';

@Injectable()
export class AgentRegistrationService {
  register(_input: RegistrationInput): RegistrationResult {
    return { approvalRequired: true, defaultDashboard: 'agent', status: 'pending_review', tenantId: crypto.randomUUID(), userId: crypto.randomUUID() };
  }

  passTraining(agentId: string): { agentId: string; reputationLevel: 'LV2'; score: 500; status: 'active' } {
    return { agentId, reputationLevel: 'LV2', score: 500, status: 'active' };
  }
}
