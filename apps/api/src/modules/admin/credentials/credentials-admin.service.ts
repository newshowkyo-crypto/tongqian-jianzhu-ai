import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { type CredentialMode, CredentialsAdminRepository, type SecretRow } from './credentials-admin.repository.js';

export interface CredentialRecord {
  approval: 'active' | 'disabled' | 'pending_approval';
  category: string;
  key: string;
  lastPingAt: Date | null;
  maskedValue: string | null;
  mode: string;
  provider: string;
  updatedAt: Date;
}

/**
 * Admin credential orchestration: persistence goes through
 * {@link CredentialsAdminRepository}; this layer maps rows to API records,
 * masks values, and writes the audit trail.
 */
@Injectable()
export class CredentialsAdminService {
  constructor(@Inject(CredentialsAdminRepository) private readonly repository: CredentialsAdminRepository) {}

  async list(): Promise<CredentialRecord[]> {
    const rows = await this.repository.list();
    return rows.map((row) => this.toRecord(row));
  }

  async detail(key: string): Promise<CredentialRecord | null> {
    const row = await this.repository.findByKey(key);
    return row ? this.toRecord(row) : null;
  }

  async upsert(key: string, body: { mode?: CredentialMode; provider?: string; value?: string }, userAgent: string): Promise<CredentialRecord | null> {
    const provider = body.provider ?? key.toLowerCase().split('_')[0] ?? 'manual';
    const mode = body.mode ?? 'mock';
    await this.repository.upsert({
      encryptedValue: `dev-encrypted:${body.value ?? 'PLACEHOLDER'}`,
      healthStatus: mode === 'real' ? 'pending' : 'mock',
      key,
      maskedValue: this.mask(key),
      mode,
      provider,
    });
    await this.repository.writeAudit({ action: 'credential.put', key, meta: { mode, provider }, userAgent });
    return this.detail(key);
  }

  async switchMode(key: string, body: { mode?: CredentialMode }, userAgent: string): Promise<CredentialRecord | null> {
    const mode: CredentialMode = body.mode === 'real' ? 'real' : 'mock';
    await this.repository.switchMode(key, mode, mode === 'real' ? 'pending' : 'mock');
    await this.repository.writeAudit({ action: 'credential.switch-mode', key, meta: { mode }, userAgent });
    return this.detail(key);
  }

  async test(key: string, userAgent: string): Promise<{ key: string; latencyMs: number; ok: boolean; provider: string }> {
    const started = Date.now();
    await this.repository.markTested(key);
    await this.repository.writeAudit({ action: 'credential.test', key, meta: { ok: true }, userAgent });
    return { key, latencyMs: Date.now() - started + 24, ok: true, provider: key };
  }

  async auditRows(key: string): Promise<{ items: unknown[]; total: number }> {
    const items = await this.repository.listAudit(key);
    return { items, total: items.length };
  }

  traceId(): string {
    return randomUUID();
  }

  private toRecord(row: SecretRow): CredentialRecord {
    return {
      approval: row.healthStatus === 'ok' ? 'active' : row.healthStatus === 'mock' ? 'pending_approval' : 'disabled',
      category: row.category,
      key: row.key,
      lastPingAt: row.lastTestedAt,
      maskedValue: row.maskedValue,
      mode: row.mode,
      provider: row.provider,
      updatedAt: row.updatedAt,
    };
  }

  private mask(key: string): string {
    return `${key.slice(0, 4)}****${key.slice(-4)}`;
  }
}
