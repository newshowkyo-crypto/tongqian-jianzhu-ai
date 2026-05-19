import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: string;
  deviceId?: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

@Injectable()
export class JwtTokenService {
  private readonly refreshTokens = new Map<string, { deviceId?: string; expiresAt: number; revokedAt?: number; userId: string }>();
  private readonly accessTokens = new Map<string, { deviceId?: string; expiresAt: number; userId: string }>();

  issue(userId: string): TokenPair {
    return this.issueForDevice(userId, undefined);
  }

  /**
   * Issues a 30 minute access token and 30 day refresh token bound to a device fingerprint.
   *
   * @param userId User id.
   * @param deviceId Optional device fingerprint.
   * @returns Token pair.
   */
  issueForDevice(userId: string, deviceId?: string): TokenPair {
    const refreshToken = randomUUID();
    const accessToken = `mock-jwt.${Buffer.from(userId).toString('base64url')}.${Date.now()}`;
    const accessTokenExpiresAt = Date.now() + 30 * 60_000;
    const refreshTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60_000;
    this.refreshTokens.set(this.hash(refreshToken), { deviceId, expiresAt: refreshTokenExpiresAt, userId });
    this.accessTokens.set(this.hash(accessToken), { deviceId, expiresAt: accessTokenExpiresAt, userId });
    return {
      accessToken,
      accessTokenExpiresAt: new Date(accessTokenExpiresAt).toISOString(),
      deviceId,
      refreshToken,
      refreshTokenExpiresAt: new Date(refreshTokenExpiresAt).toISOString(),
    };
  }

  /**
   * Refreshes a token pair, keeping device binding intact.
   *
   * @param refreshToken Refresh token.
   * @param deviceId Optional presented device id.
   * @returns New token pair.
   */
  refresh(refreshToken: string, deviceId?: string): TokenPair {
    const record = this.refreshTokens.get(this.hash(refreshToken));
    if (!record || record.revokedAt || record.expiresAt <= Date.now()) {
      throw this.authError('AUTH.TOKEN.EXPIRED');
    }
    if (record.deviceId && deviceId && record.deviceId !== deviceId) throw this.authError('AUTH.TOKEN.DEVICE_MISMATCH');
    return this.issueForDevice(record.userId, record.deviceId ?? deviceId);
  }

  /**
   * Revokes one refresh token and leaves an audit-ready timestamp.
   *
   * @param refreshToken Refresh token to revoke.
   */
  revoke(refreshToken: string): void {
    const record = this.refreshTokens.get(this.hash(refreshToken));
    if (record) {
      record.revokedAt = Date.now();
    }
  }

  /**
   * Validates an access token for guards and middleware.
   *
   * @param accessToken Access token.
   * @param deviceId Optional device id.
   * @returns User id when token is valid.
   */
  verifyAccess(accessToken: string, deviceId?: string): string {
    const record = this.accessTokens.get(this.hash(accessToken));
    if (!record || record.expiresAt <= Date.now()) throw this.authError('AUTH.TOKEN.EXPIRED');
    if (record.deviceId && deviceId && record.deviceId !== deviceId) throw this.authError('AUTH.TOKEN.DEVICE_MISMATCH');
    return record.userId;
  }

  /**
   * Revokes every token for a user after password reset or device compromise.
   *
   * @param userId User id.
   * @returns Revoked token count.
   */
  revokeUser(userId: string): number {
    let count = 0;
    for (const record of this.refreshTokens.values()) {
      if (record.userId === userId && !record.revokedAt) {
        record.revokedAt = Date.now();
        count += 1;
      }
    }
    return count;
  }

  private authError(code: string): BusinessError {
    return new BusinessError({ code: ErrorCodes.AUTH_LOGIN_PASSWORD_INVALID.code, details: { code }, message: code });
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
