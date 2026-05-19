import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

interface LockoutRecord {
  count: number;
  firstFailedAt: number;
  lockedUntil?: number;
}

export interface LockoutSnapshot {
  readonly count: number;
  readonly locked: boolean;
  readonly lockedUntil?: string;
  readonly remainingAttempts: number;
}

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;

@Injectable()
export class LockoutService {
  private readonly attempts = new Map<string, LockoutRecord>();

  /**
   * Throws when a phone is currently locked out.
   *
   * @param phone Login phone.
   */
  assertAllowed(phone: string): void {
    this.assertPhone(phone);
    const record = this.attempts.get(phone);
    if (record?.lockedUntil && record.lockedUntil > Date.now()) {
      throw new BusinessError({
        code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code,
        details: this.snapshot(phone),
        message: 'Login is temporarily locked after repeated failures.',
      });
    }
  }

  /**
   * Records one failed attempt within the 15-minute lockout window.
   *
   * @param phone Login phone.
   * @returns Current lockout snapshot.
   */
  recordFailure(phone: string): LockoutSnapshot {
    this.assertPhone(phone);
    const now = Date.now();
    const current = this.attempts.get(phone);
    const record = !current || now - current.firstFailedAt > WINDOW_MS ? { count: 0, firstFailedAt: now } : current;
    record.count += 1;
    if (record.count >= MAX_FAILURES) record.lockedUntil = now + WINDOW_MS;
    this.attempts.set(phone, record);
    return this.snapshot(phone);
  }

  /**
   * Clears lockout state after a successful login or admin reset.
   *
   * @param phone Login phone.
   */
  reset(phone: string): void {
    this.assertPhone(phone);
    this.attempts.delete(phone);
  }

  /**
   * Returns current lockout state for audit and admin support.
   *
   * @param phone Login phone.
   * @returns Lockout snapshot.
   */
  snapshot(phone: string): LockoutSnapshot {
    const record = this.attempts.get(phone);
    const locked = Boolean(record?.lockedUntil && record.lockedUntil > Date.now());
    return {
      count: record?.count ?? 0,
      locked,
      lockedUntil: record?.lockedUntil ? new Date(record.lockedUntil).toISOString() : undefined,
      remainingAttempts: Math.max(0, MAX_FAILURES - (record?.count ?? 0)),
    };
  }

  /**
   * Returns all currently locked phones in masked form for security dashboards.
   *
   * @returns Masked phone list and lock expiry.
   */
  listLocked(): Array<{ lockedUntil: string; phoneMasked: string }> {
    const now = Date.now();
    return [...this.attempts.entries()]
      .filter(([, record]) => Boolean(record.lockedUntil && record.lockedUntil > now))
      .map(([phone, record]) => ({
        lockedUntil: new Date(record.lockedUntil ?? now).toISOString(),
        phoneMasked: phone.replace(/(\d{3})\d{4}(\d{4})/u, '$1****$2'),
      }));
  }

  private assertPhone(phone: string): void {
    if (!/^1[3-9]\d{9}$/u.test(phone)) {
      throw new BusinessError({
        code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code,
        details: { phoneMasked: phone.slice(0, 3) },
        message: 'Login phone format is invalid.',
      });
    }
  }
}
