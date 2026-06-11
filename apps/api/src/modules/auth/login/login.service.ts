import { Inject, Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

import { AuthAccountRepository, type AuthAccountRecord } from '../auth-account.repository.js';

import { JwtTokenService } from './jwt.service.js';
import type { TokenPair } from './jwt.service.js';
import { LockoutService } from './lockout.service.js';
import { TwoFactorService } from './two-factor.service.js';

export interface LoginInput {
  deviceId?: string;
  ip?: string;
  password?: string;
  phone: string;
  smsCode?: string;
  twoFactorCode?: string;
}

@Injectable()
export class LoginService {
  private readonly allowedCidrs = new Map<string, string[]>([['PLATFORM_OWNER', ['127.0.0.1', '::1']]]);
  private readonly lastLogin = new Map<string, { city?: string; deviceId?: string; ip?: string; loginAt: number }>();

  constructor(
    @Inject(AuthAccountRepository)
    private readonly accounts: AuthAccountRepository,
    @Inject(JwtTokenService)
    private readonly jwt: JwtTokenService,
    @Inject(LockoutService)
    private readonly lockout: LockoutService,
    @Inject(TwoFactorService)
    private readonly twoFactor: TwoFactorService,
  ) {}

  async login(input: LoginInput): Promise<TokenPair & { defaultDashboard: string; tenantId: string; userId: string }> {
    this.lockout.assertAllowed(input.phone);
    const account = await this.accounts.findByPhone(input.phone);
    if (!account || account.status !== 'active') {
      this.lockout.recordFailure(input.phone);
      throw this.authError('AUTH.LOGIN.PASSWORD_INVALID', { phoneMasked: this.maskPhone(input.phone) });
    }
    if (account.tenantStatus !== 'active' && account.tenantStatus !== 'training' && account.tenantStatus !== 'pending_review') {
      this.lockout.recordFailure(input.phone);
      throw this.authError('AUTH.LOGIN.TENANT_INACTIVE', { tenantId: account.tenantId, tenantStatus: account.tenantStatus });
    }
    const risk = this.assessLoginRisk(input);
    if (!this.verifyCredential(account, input)) {
      this.lockout.recordFailure(input.phone);
      throw this.authError('AUTH.LOGIN.PASSWORD_INVALID', { phoneMasked: this.maskPhone(input.phone) });
    }
    if (risk.requiresTwoFactor && !this.twoFactor.verify(input.phone, input.twoFactorCode)) {
      throw this.authError('AUTH.2FA.INVALID', { risk });
    }
    this.lockout.reset(input.phone);
    this.lastLogin.set(input.phone, { deviceId: input.deviceId, ip: input.ip, loginAt: Date.now() });
    return { ...this.jwt.issueForDevice(account.userId, input.deviceId), defaultDashboard: account.defaultDashboard, tenantId: account.tenantId, userId: account.userId };
  }

  /**
   * Assesses login risk with IP allow-list, device binding, and remote-login signals.
   *
   * @param input Login request.
   * @returns Risk decision for the login step.
   */
  assessLoginRisk(input: LoginInput): { reasons: string[]; requiresTwoFactor: boolean } {
    const reasons: string[] = [];
    const platformOwner = input.phone.startsWith('platform');
    if (platformOwner && !this.isIpAllowed('PLATFORM_OWNER', input.ip)) reasons.push('ip-not-allowlisted');
    const previous = this.lastLogin.get(input.phone);
    if (previous?.deviceId && input.deviceId && previous.deviceId !== input.deviceId) reasons.push('new-device');
    if (previous?.ip && input.ip && previous.ip !== input.ip) reasons.push('remote-ip-change');
    if (this.twoFactor.requiresTwoFactor('PLATFORM_OWNER') && platformOwner) reasons.push('platform-owner-policy');
    return { reasons, requiresTwoFactor: reasons.length > 0 };
  }

  /**
   * Records an operator-approved IP allow-list entry.
   *
   * @param role Role name.
   * @param ip IP address.
   * @returns Updated IP list.
   */
  addIpAllowList(role: string, ip: string): string[] {
    const list = this.allowedCidrs.get(role) ?? [];
    if (!list.includes(ip)) list.push(ip);
    this.allowedCidrs.set(role, list);
    return list;
  }

  private isIpAllowed(role: string, ip?: string): boolean {
    const allowed = this.allowedCidrs.get(role);
    if (!allowed || allowed.length === 0 || !ip) return true;
    return allowed.includes(ip);
  }

  private authError(code: string, details: Record<string, unknown>): BusinessError {
    return new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, details: { ...details, code }, message: code });
  }

  private maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2');
  }

  private verifyCredential(account: AuthAccountRecord, input: LoginInput): boolean {
    if (input.password && this.accounts.verifyPassword(account.passwordHash, input.password)) return true;
    if (input.smsCode) {
      if (process.env.NODE_ENV === 'production') return false;
      return this.twoFactor.verify(account.userId, input.smsCode);
    }
    return false;
  }
}
