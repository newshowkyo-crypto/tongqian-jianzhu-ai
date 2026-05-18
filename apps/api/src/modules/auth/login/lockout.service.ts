import { Injectable } from '@nestjs/common';

@Injectable()
export class LockoutService {
  private readonly attempts = new Map<string, { count: number; lockedUntil?: number }>();

  assertAllowed(phone: string): void {
    const record = this.attempts.get(phone);
    if (record?.lockedUntil && record.lockedUntil > Date.now()) {
      throw new Error('AUTH.LOGIN.LOCKED_OUT');
    }
  }

  recordFailure(phone: string): void {
    const record = this.attempts.get(phone) ?? { count: 0 };
    record.count += 1;
    if (record.count >= 5) {
      record.lockedUntil = Date.now() + 15 * 60_000;
    }
    this.attempts.set(phone, record);
  }

  reset(phone: string): void {
    this.attempts.delete(phone);
  }
}
