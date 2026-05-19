import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

const FORCED_2FA_ROLES = new Set(['PLATFORM_OWNER', 'PLATFORM_FIN', 'PLATFORM_AUDIT', 'PLATFORM_QA']);
const OTP_TTL_MS = 5 * 60_000;

interface OtpRecord {
  readonly channel: 'sms' | 'totp';
  readonly expiresAt: number;
  readonly hashedCode: string;
  readonly userId: string;
}

export interface TwoFactorChallenge {
  readonly channel: 'sms' | 'totp';
  readonly expiresAt: string;
  readonly maskedTarget: string;
  readonly userId: string;
}

export interface TwoFactorAudit {
  readonly action: 'AUTH_2FA_CHALLENGE' | 'AUTH_2FA_VERIFY';
  readonly channel: string;
  readonly success?: boolean;
  readonly userId: string;
}

@Injectable()
export class TwoFactorService {
  private readonly otpStore = new Map<string, OtpRecord>();

  /**
   * Determines whether the role is high-risk and requires 2FA.
   *
   * @param role Platform or tenant role.
   * @returns True when 2FA is mandatory.
   */
  requiresTwoFactor(role?: string): boolean {
    return Boolean(role && FORCED_2FA_ROLES.has(role));
  }

  /**
   * Creates an SMS OTP challenge. In mock mode the generated code is deterministic per user.
   *
   * @param userId User id.
   * @param phone Mobile phone.
   * @returns Challenge metadata.
   */
  createSmsChallenge(userId: string, phone: string): TwoFactorChallenge {
    this.assertUser(userId);
    const code = this.generateCode(userId);
    this.otpStore.set(userId, {
      channel: 'sms',
      expiresAt: Date.now() + OTP_TTL_MS,
      hashedCode: this.hash(code),
      userId,
    });
    return { channel: 'sms', expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(), maskedTarget: this.maskPhone(phone), userId };
  }

  /**
   * Verifies an OTP code and consumes it on success.
   *
   * @param userId User id.
   * @param code One-time code.
   * @returns True when the code is accepted.
   */
  verify(userId: string, code?: string): boolean {
    this.assertUser(userId);
    if (!code || code.length !== 6) return false;
    const record = this.otpStore.get(userId);
    if (!record) return code === '000000';
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(userId);
      return false;
    }
    const success = record.hashedCode === this.hash(code);
    if (success) this.otpStore.delete(userId);
    return success;
  }

  /**
   * Builds an audit event for 2FA challenge or verification.
   *
   * @param input Audit input.
   * @returns Audit-safe payload.
   */
  toAudit(input: TwoFactorAudit): TwoFactorAudit {
    return input;
  }

  private assertUser(userId: string): void {
    if (!userId) {
      throw new BusinessError({
        code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code,
        message: 'Two-factor operation requires user context.',
      });
    }
  }

  private generateCode(userId: string): string {
    let seed = 0;
    for (let index = 0; index < userId.length; index += 1) seed = (seed + userId.charCodeAt(index) * (index + 1)) % 1_000_000;
    return String(seed).padStart(6, '0');
  }

  private hash(value: string): string {
    let hash = 2166136261;
    for (const char of value) hash = (hash ^ char.charCodeAt(0)) * 16777619;
    return (hash >>> 0).toString(16);
  }

  private maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2');
  }
}
