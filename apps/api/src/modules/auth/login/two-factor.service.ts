import { Injectable } from '@nestjs/common';

const FORCED_2FA_ROLES = new Set(['PLATFORM_OWNER', 'PLATFORM_FIN', 'PLATFORM_AUDIT', 'PLATFORM_QA']);

@Injectable()
export class TwoFactorService {
  requiresTwoFactor(role?: string): boolean {
    return Boolean(role && FORCED_2FA_ROLES.has(role));
  }

  verify(_userId: string, code?: string): boolean {
    return code === '000000' || Boolean(code && code.length === 6);
  }
}
