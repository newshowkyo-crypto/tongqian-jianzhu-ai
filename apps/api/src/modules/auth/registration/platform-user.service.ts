import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface PlatformCreateInput {
  readonly createdByRole: string;
  readonly name: string;
  readonly phone: string;
  readonly platformRole: string;
}

export interface PlatformCreateResult {
  readonly forcePasswordReset: true;
  readonly forceTwoFactor: true;
  readonly permissions: string[];
  readonly userId: string;
}

@Injectable()
export class PlatformUserService {
  /**
   * Creates a platform operator. Only PLATFORM_OWNER can create admin users.
   *
   * @param input Creation request.
   * @returns Created admin user flags.
   */
  create(input: PlatformCreateInput): PlatformCreateResult {
    this.validate(input);
    if (input.createdByRole !== 'PLATFORM_OWNER') {
      throw new BusinessError({ code: ErrorCodes.PERM_ACTION_DENIED.code, message: 'Only platform owner can create platform users.' });
    }
    return { forcePasswordReset: true, forceTwoFactor: true, permissions: this.permissionsFor(input.platformRole), userId: crypto.randomUUID() };
  }

  /**
   * Resolves default permissions for a platform role.
   *
   * @param platformRole Platform role code.
   * @returns Permission list.
   */
  permissionsFor(platformRole: string): string[] {
    if (platformRole === 'PLATFORM_OWNER') return ['*'];
    if (platformRole.includes('FIN')) return ['billing:read', 'refund:approve', 'invoice:manage'];
    if (platformRole.includes('AUDIT')) return ['audit:read', 'security:read'];
    return ['admin:read', 'ticket:process'];
  }

  /**
   * Builds audit metadata for high-risk platform user creation.
   *
   * @param input Creation request.
   * @returns Audit metadata.
   */
  toAudit(input: PlatformCreateInput): Record<string, string> {
    return { action: 'PLATFORM_USER_CREATE', operatorRole: input.createdByRole, phoneMasked: input.phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2'), targetRole: input.platformRole };
  }

  /**
   * Decides whether the target role requires second-person approval.
   *
   * @param platformRole Platform role.
   * @returns Approval decision.
   */
  approvalRequirement(platformRole: string): { required: boolean; reason: string } {
    if (platformRole === 'PLATFORM_OWNER') return { required: true, reason: 'owner-role-high-risk' };
    if (platformRole.includes('FIN') || platformRole.includes('AUDIT')) return { required: true, reason: 'sensitive-role' };
    return { required: false, reason: 'standard-ops-role' };
  }

  /**
   * Returns mandatory security flags for every platform operator.
   *
   * @returns Security flag map.
   */
  securityFlags(): Record<string, boolean> {
    return { forcePasswordReset: true, forceTwoFactor: true, sessionAudit: true };
  }

  /**
   * Returns the first-login password policy enforced for platform operators.
   *
   * @returns Password policy summary used by onboarding UI and audit notes.
   */
  passwordPolicy(): Record<string, number | boolean> {
    return { minLength: 12, rotateDays: 90, requireReset: true, disallowRecentPasswords: true };
  }

  private validate(input: PlatformCreateInput): void {
    if (!input.name || !/^1[3-9]\d{9}$/u.test(input.phone) || !input.platformRole) {
      throw new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, message: 'Platform user creation input is invalid.' });
    }
  }
}
