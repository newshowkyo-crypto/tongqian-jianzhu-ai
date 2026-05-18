import { Inject, Injectable } from '@nestjs/common';

import { JwtTokenService } from './jwt.service.js';
import type { TokenPair } from './jwt.service.js';
import { LockoutService } from './lockout.service.js';
import { TwoFactorService } from './two-factor.service.js';

export interface LoginInput {
  password?: string;
  phone: string;
  smsCode?: string;
  twoFactorCode?: string;
}

@Injectable()
export class LoginService {
  constructor(
    @Inject(JwtTokenService)
    private readonly jwt: JwtTokenService,
    @Inject(LockoutService)
    private readonly lockout: LockoutService,
    @Inject(TwoFactorService)
    private readonly twoFactor: TwoFactorService,
  ) {}

  login(input: LoginInput): TokenPair & { defaultDashboard: string } {
    this.lockout.assertAllowed(input.phone);
    if (!input.password && !input.smsCode) {
      this.lockout.recordFailure(input.phone);
      throw new Error('AUTH.LOGIN.PASSWORD_INVALID');
    }
    if (this.twoFactor.requiresTwoFactor('PLATFORM_OWNER') && input.phone.startsWith('platform') && !this.twoFactor.verify(input.phone, input.twoFactorCode)) {
      throw new Error('AUTH.2FA.INVALID');
    }
    this.lockout.reset(input.phone);
    return { ...this.jwt.issue(input.phone), defaultDashboard: this.defaultDashboard(input.phone) };
  }

  private defaultDashboard(phone: string): string {
    if (phone.includes('finance')) return 'finance';
    if (phone.includes('pm')) return 'pm';
    if (phone.includes('tender')) return 'tender_writer';
    return 'owner';
  }
}
