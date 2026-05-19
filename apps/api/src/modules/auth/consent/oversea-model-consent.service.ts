import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface ConsentRecord {
  readonly grantedAt: string;
  readonly ip?: string;
  readonly userAgent?: string;
  readonly userId: string;
  readonly version: string;
}

export interface ConsentAudit {
  readonly action: 'AUTH_OVERSEA_CONSENT_GRANT' | 'AUTH_OVERSEA_CONSENT_REVOKE';
  readonly userId: string;
  readonly version: string;
}

@Injectable()
export class OverseaModelConsentService {
  private readonly consents = new Map<string, ConsentRecord>();

  /**
   * Grants explicit overseas model consent for non-government users.
   *
   * @param userId User id.
   * @param version Consent text version.
   * @param meta Request metadata.
   * @returns Consent record.
   */
  grant(userId: string, version = 'v1', meta: { ip?: string; userAgent?: string } = {}): ConsentRecord & { granted: true; type: 'oversea_model' } {
    this.assertUser(userId);
    const record: ConsentRecord = { grantedAt: new Date().toISOString(), ip: meta.ip, userAgent: meta.userAgent, userId, version };
    this.consents.set(this.key(userId, version), record);
    return { ...record, granted: true, type: 'oversea_model' };
  }

  /**
   * Checks whether the user has granted the requested consent version.
   *
   * @param userId User id.
   * @param version Consent version.
   * @returns True when consent exists.
   */
  hasConsent(userId: string, version = 'v1'): boolean {
    return this.consents.has(this.key(userId, version));
  }

  /**
   * Revokes consent for a user/version pair.
   *
   * @param userId User id.
   * @param version Consent version.
   * @returns Audit event.
   */
  revoke(userId: string, version = 'v1'): ConsentAudit {
    this.assertUser(userId);
    this.consents.delete(this.key(userId, version));
    return { action: 'AUTH_OVERSEA_CONSENT_REVOKE', userId, version };
  }

  /**
   * Lists consent versions for admin audit.
   *
   * @param userId User id.
   * @returns Consent records.
   */
  list(userId: string): ConsentRecord[] {
    this.assertUser(userId);
    return [...this.consents.values()].filter((record) => record.userId === userId);
  }

  /**
   * Builds a compliance decision for model routing.
   *
   * @param input Role and consent context.
   * @returns Whether an overseas provider may be considered.
   */
  canUseOverseasModel(input: { isGovernmentTenant?: boolean; userId: string; version?: string }): { allowed: boolean; reason: string } {
    if (input.isGovernmentTenant) return { allowed: false, reason: 'government-domestic-model-only' };
    return this.hasConsent(input.userId, input.version) ? { allowed: true, reason: 'consent-granted' } : { allowed: false, reason: 'consent-missing' };
  }

  private key(userId: string, version: string): string {
    return `${userId}:${version}`;
  }

  private assertUser(userId: string): void {
    if (!userId) {
      throw new BusinessError({
        code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code,
        message: 'Overseas model consent requires user context.',
      });
    }
  }
}
