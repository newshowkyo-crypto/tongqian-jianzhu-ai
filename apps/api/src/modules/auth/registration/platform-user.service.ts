import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformUserService {
  create(input: { createdByRole: string; name: string; phone: string; platformRole: string }): { forcePasswordReset: true; forceTwoFactor: true; userId: string } {
    if (input.createdByRole !== 'PLATFORM_OWNER') {
      throw new Error('PERM.DENIED');
    }
    return { forcePasswordReset: true, forceTwoFactor: true, userId: crypto.randomUUID() };
  }
}
