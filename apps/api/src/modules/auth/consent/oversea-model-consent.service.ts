import { Injectable } from '@nestjs/common';

@Injectable()
export class OverseaModelConsentService {
  private readonly consents = new Set<string>();

  grant(userId: string, version = 'v1'): { granted: true; type: 'oversea_model'; userId: string; version: string } {
    this.consents.add(`${userId}:${version}`);
    return { granted: true, type: 'oversea_model', userId, version };
  }

  hasConsent(userId: string, version = 'v1'): boolean {
    return this.consents.has(`${userId}:${version}`);
  }
}
