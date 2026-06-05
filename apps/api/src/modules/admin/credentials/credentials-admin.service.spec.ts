import assert from 'node:assert/strict';
import test from 'node:test';
import 'reflect-metadata';

import type { CredentialAuditRow, CredentialMode, SecretRow } from './credentials-admin.repository.js';
import { CredentialsAdminService } from './credentials-admin.service.js';

function secretRow(overrides: Partial<SecretRow> = {}): SecretRow {
  return {
    category: 'ai',
    healthStatus: 'ok',
    key: 'DEEPSEEK_API_KEY',
    lastSwitchedAt: new Date('2026-06-01T00:00:00.000Z'),
    lastTestedAt: new Date('2026-06-02T00:00:00.000Z'),
    maskedValue: 'DEEP****_KEY',
    mode: 'real',
    provider: 'deepseek',
    updatedAt: new Date('2026-06-03T00:00:00.000Z'),
    ...overrides,
  };
}

/** Captures repository calls so we can assert orchestration + audit writes. */
class FakeRepository {
  rows: SecretRow[] = [secretRow()];
  audit: CredentialAuditRow[] = [];
  upserts: Array<Record<string, unknown>> = [];
  switches: Array<{ healthStatus: string; key: string; mode: CredentialMode }> = [];
  tested: string[] = [];
  audits: Array<{ action: string; key: string; meta: Record<string, unknown> }> = [];

  async list(): Promise<SecretRow[]> {
    return this.rows;
  }

  async findByKey(key: string): Promise<SecretRow | null> {
    return this.rows.find((r) => r.key === key) ?? null;
  }

  async upsert(input: { encryptedValue: string; healthStatus: string; key: string; maskedValue: string; mode: CredentialMode; provider: string }): Promise<void> {
    this.upserts.push(input);
    this.rows = [secretRow({ healthStatus: input.healthStatus, key: input.key, maskedValue: input.maskedValue, mode: input.mode, provider: input.provider })];
  }

  async switchMode(keyOrProvider: string, mode: CredentialMode, healthStatus: string): Promise<void> {
    this.switches.push({ healthStatus, key: keyOrProvider, mode });
    this.rows = this.rows.map((r) => (r.key === keyOrProvider || r.provider === keyOrProvider ? { ...r, healthStatus, mode } : r));
  }

  async markTested(keyOrProvider: string): Promise<void> {
    this.tested.push(keyOrProvider);
  }

  async listAudit(key: string): Promise<CredentialAuditRow[]> {
    return this.audit.filter((a) => a.resourceId === key);
  }

  async writeAudit(input: { action: string; key: string; meta: Record<string, unknown> }): Promise<void> {
    this.audits.push({ action: input.action, key: input.key, meta: input.meta });
    this.audit.unshift({ action: input.action, createdAt: new Date(), id: `audit-${this.audit.length}`, meta: input.meta, resourceId: input.key, traceId: 'trace-1' });
  }
}

function build(): { repo: FakeRepository; service: CredentialsAdminService } {
  const repo = new FakeRepository();
  const service = new CredentialsAdminService(repo as unknown as never);
  return { repo, service };
}

test('list maps secret rows to credential records with approval derived from health', async () => {
  const { service } = build();
  const records = await service.list();
  assert.equal(records.length, 1);
  assert.equal(records[0]?.key, 'DEEPSEEK_API_KEY');
  assert.equal(records[0]?.approval, 'active');
  assert.equal(records[0]?.maskedValue, 'DEEP****_KEY');
});

test('detail returns null for unknown key and a record for a known key', async () => {
  const { service } = build();
  assert.equal(await service.detail('UNKNOWN_KEY'), null);
  const record = await service.detail('DEEPSEEK_API_KEY');
  assert.equal(record?.provider, 'deepseek');
});

test('upsert persists through repository, masks value, and writes an audit row', async () => {
  const { repo, service } = build();
  const record = await service.upsert('NEW_PROVIDER_KEY', { mode: 'real', value: 'super-secret' }, 'tester');
  assert.equal(repo.upserts.length, 1);
  assert.equal(repo.upserts[0]?.mode, 'real');
  assert.notEqual(repo.upserts[0]?.encryptedValue, 'super-secret');
  assert.equal(repo.audits[0]?.action, 'credential.put');
  assert.equal(record?.mode, 'real');
});

test('switchMode normalizes invalid modes to mock and audits the change', async () => {
  const { repo, service } = build();
  await service.switchMode('DEEPSEEK_API_KEY', { mode: 'bogus' as CredentialMode }, 'tester');
  assert.equal(repo.switches[0]?.mode, 'mock');
  assert.equal(repo.switches[0]?.healthStatus, 'mock');
  assert.equal(repo.audits[0]?.action, 'credential.switch-mode');
});

test('test path marks tested, audits, and returns ok latency', async () => {
  const { repo, service } = build();
  const result = await service.test('DEEPSEEK_API_KEY', 'tester');
  assert.deepEqual(repo.tested, ['DEEPSEEK_API_KEY']);
  assert.equal(result.ok, true);
  assert.ok(result.latencyMs >= 0);
  assert.equal(repo.audits[0]?.action, 'credential.test');
});

test('auditRows returns items and total for a key', async () => {
  const { repo, service } = build();
  await service.upsert('DEEPSEEK_API_KEY', { mode: 'mock' }, 'tester');
  const result = await service.auditRows('DEEPSEEK_API_KEY');
  assert.equal(result.total, repo.audit.filter((a) => a.resourceId === 'DEEPSEEK_API_KEY').length);
  assert.ok(result.total >= 1);
});
