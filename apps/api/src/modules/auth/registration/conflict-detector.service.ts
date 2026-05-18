import { Injectable } from '@nestjs/common';

import type { RegistrationRole } from './registration-types.js';

@Injectable()
export class ConflictDetectorService {
  private readonly phoneRoles = new Map<string, RegistrationRole>();

  check(phone: string, targetRole: RegistrationRole): { ok: true } | { action?: string; ok: false; reason: string } {
    const existing = this.phoneRoles.get(phone);
    if (!existing) return { ok: true };
    if (existing === 'GOV_USER') return { ok: false, reason: 'GOV_CANNOT_DUAL_ROLE' };
    if (existing === 'BUILDING_COMPANY_USER' && targetRole === 'AGENT') return { action: 'cs-migration-link', ok: false, reason: 'CONFLICT_COMPANY_TO_AGENT' };
    if (existing === 'AGENT' && targetRole === 'BUILDING_COMPANY_USER') return { action: 'agent-proxy-register', ok: false, reason: 'CONFLICT_AGENT_TO_COMPANY' };
    return { ok: true };
  }

  remember(phone: string, role: RegistrationRole): void {
    this.phoneRoles.set(phone, role);
  }
}
