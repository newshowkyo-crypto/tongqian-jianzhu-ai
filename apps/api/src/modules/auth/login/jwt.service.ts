import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

export interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

@Injectable()
export class JwtTokenService {
  private readonly refreshTokens = new Map<string, { expiresAt: number; revokedAt?: number; userId: string }>();

  issue(userId: string): TokenPair {
    const refreshToken = randomUUID();
    const refreshTokenExpiresAt = Date.now() + 30 * 24 * 60 * 60_000;
    this.refreshTokens.set(this.hash(refreshToken), { expiresAt: refreshTokenExpiresAt, userId });
    return {
      accessToken: `mock-jwt.${Buffer.from(userId).toString('base64url')}.${Date.now()}`,
      accessTokenExpiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      refreshToken,
      refreshTokenExpiresAt: new Date(refreshTokenExpiresAt).toISOString(),
    };
  }

  refresh(refreshToken: string): TokenPair {
    const record = this.refreshTokens.get(this.hash(refreshToken));
    if (!record || record.revokedAt || record.expiresAt <= Date.now()) {
      throw new Error('AUTH.TOKEN.EXPIRED');
    }
    return this.issue(record.userId);
  }

  revoke(refreshToken: string): void {
    const record = this.refreshTokens.get(this.hash(refreshToken));
    if (record) {
      record.revokedAt = Date.now();
    }
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
