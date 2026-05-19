import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import type { RegistrationRole } from './registration-types.js';

@Injectable()
export class ConflictDetectorService {
  private readonly deviceFingerprints = new Map<string, RegistrationRole>();
  private readonly idCards = new Map<string, RegistrationRole>();
  private readonly ipBuckets = new Map<string, number>();
  private readonly licenses = new Map<string, RegistrationRole>();
  private readonly phoneRoles = new Map<string, RegistrationRole>();

  /**
   * Checks role conflict and anti-abuse dimensions before registration.
   *
   * @param phone Phone number.
   * @param targetRole Requested role.
   * @param signals Optional anti-fraud signals.
   * @returns Conflict decision.
   */
  check(phone: string, targetRole: RegistrationRole, signals: { deviceFingerprint?: string; idCard?: string; ip?: string; licenseNo?: string } = {}): { ok: true } | { action?: string; ok: false; reason: string } {
    const existing = this.phoneRoles.get(phone);
    const abuse = this.detectAbuse(signals, targetRole);
    if (abuse) return { ok: false, reason: abuse };
    if (!existing) return { ok: true };
    if (existing === 'GOV_USER') return { ok: false, reason: 'GOV_CANNOT_DUAL_ROLE' };
    if (existing === 'BUILDING_COMPANY_USER' && targetRole === 'AGENT') return { action: 'cs-migration-link', ok: false, reason: 'CONFLICT_COMPANY_TO_AGENT' };
    if (existing === 'AGENT' && targetRole === 'BUILDING_COMPANY_USER') return { action: 'agent-proxy-register', ok: false, reason: 'CONFLICT_AGENT_TO_COMPANY' };
    return { ok: true };
  }

  remember(phone: string, role: RegistrationRole): void {
    this.phoneRoles.set(phone, role);
  }

  /**
   * Persists anti-abuse dimensions after a successful registration.
   *
   * @param input Registration signal set.
   * @param role Registered role.
   */
  rememberSignals(input: { deviceFingerprint?: string; idCard?: string; ip?: string; licenseNo?: string; phone: string }, role: RegistrationRole): void {
    this.phoneRoles.set(input.phone, role);
    if (input.idCard) this.idCards.set(input.idCard, role);
    if (input.licenseNo) this.licenses.set(input.licenseNo, role);
    if (input.deviceFingerprint) this.deviceFingerprints.set(input.deviceFingerprint, role);
    if (input.ip) this.ipBuckets.set(input.ip, (this.ipBuckets.get(input.ip) ?? 0) + 1);
  }

  /**
   * Throws a BusinessError for controller flows that prefer exception style.
   *
   * @param phone Phone number.
   * @param role Target role.
   * @param signals Fraud signals.
   */
  assertNoConflict(phone: string, role: RegistrationRole, signals: { deviceFingerprint?: string; idCard?: string; ip?: string; licenseNo?: string } = {}): void {
    const result = this.check(phone, role, signals);
    if (!result.ok) {
      throw new BusinessError({ code: ErrorCodes.FRAUD_RISK_DETECTED.code, details: result, message: `Registration conflict: ${result.reason}` });
    }
  }

  private detectAbuse(signals: { deviceFingerprint?: string; idCard?: string; ip?: string; licenseNo?: string }, role: RegistrationRole): string | undefined {
    if (signals.idCard && this.idCards.has(signals.idCard)) return 'CONFLICT_ID_CARD_REUSED';
    if (signals.licenseNo && this.licenses.has(signals.licenseNo) && role !== 'BUILDING_COMPANY_USER') return 'CONFLICT_LICENSE_REUSED';
    if (signals.deviceFingerprint && this.deviceFingerprints.has(signals.deviceFingerprint)) return 'CONFLICT_DEVICE_REUSED';
    if (signals.ip && (this.ipBuckets.get(signals.ip) ?? 0) >= 5) return 'CONFLICT_IP_RATE_LIMIT';
    return undefined;
  }
}
