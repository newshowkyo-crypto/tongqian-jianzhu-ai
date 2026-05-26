import { createCipheriv, createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { SystemConfigService } from '../../system-config/system-config.service.js';

type CredentialMode = 'mock' | 'real';

interface CredentialAudit {
  action: string;
  after?: unknown;
  at: string;
  before?: unknown;
  operator: string;
  reason?: string;
}

interface CredentialDefinition {
  group: 'ai' | 'collector' | 'notification' | 'payment' | 'storage';
  key: string;
  provider: string;
}

const definitions: CredentialDefinition[] = [
  { group: 'payment', key: 'WECHAT_PAY_MCH_ID', provider: 'wechat-pay' },
  { group: 'payment', key: 'WECHAT_PAY_API_KEY', provider: 'wechat-pay' },
  { group: 'payment', key: 'WECHAT_PAY_CERT_PATH', provider: 'wechat-pay' },
  { group: 'notification', key: 'WECHAT_MP_APP_ID', provider: 'wechat-mp' },
  { group: 'notification', key: 'WECHAT_MP_APP_SECRET', provider: 'wechat-mp' },
  { group: 'notification', key: 'WECHAT_WORK_AGENT_ID', provider: 'wechat-work' },
  { group: 'notification', key: 'WECHAT_WORK_SECRET', provider: 'wechat-work' },
  { group: 'payment', key: 'ALIPAY_APP_ID', provider: 'alipay' },
  { group: 'payment', key: 'ALIPAY_PRIVATE_KEY', provider: 'alipay' },
  { group: 'storage', key: 'ALIYUN_OSS_ACCESS_KEY_ID', provider: 'aliyun-oss' },
  { group: 'storage', key: 'ALIYUN_OSS_ACCESS_KEY_SECRET', provider: 'aliyun-oss' },
  { group: 'storage', key: 'ALIYUN_OSS_BUCKET', provider: 'aliyun-oss' },
  { group: 'storage', key: 'ALIYUN_OSS_REGION', provider: 'aliyun-oss' },
  { group: 'collector', key: 'ALIYUN_OCR_ENABLED', provider: 'aliyun-ocr' },
  { group: 'collector', key: 'ALIYUN_DOCMIND_ENABLED', provider: 'aliyun-docmind' },
  { group: 'collector', key: 'ALIYUN_SLS_PROJECT', provider: 'aliyun-sls' },
  { group: 'collector', key: 'ALIYUN_SLS_LOGSTORE', provider: 'aliyun-sls' },
  { group: 'collector', key: 'ALIYUN_SLS_ENDPOINT', provider: 'aliyun-sls' },
  { group: 'notification', key: 'ALIYUN_SMS_ACCESS_KEY_ID', provider: 'aliyun-sms' },
  { group: 'notification', key: 'ALIYUN_SMS_ACCESS_KEY_SECRET', provider: 'aliyun-sms' },
  { group: 'notification', key: 'ALIYUN_SMS_SIGN_NAME', provider: 'aliyun-sms' },
  { group: 'ai', key: 'DASHVECTOR_API_KEY', provider: 'dashvector' },
  { group: 'collector', key: 'TIANYANCHA_API_KEY', provider: 'tianyancha' },
  { group: 'storage', key: 'ICP_RECORD_NO', provider: 'miit' },
  { group: 'ai', key: 'ALIYUN_DASHSCOPE_API_KEY', provider: 'dashscope' },
  { group: 'ai', key: 'MIDLAYER_API_KEY', provider: 'midlayer' },
  { group: 'ai', key: 'MIDLAYER_BASE_URL', provider: 'midlayer' },
  { group: 'ai', key: 'DEEPSEEK_API_KEY', provider: 'deepseek' },
];

@Injectable()
export class CredentialsService {
  private readonly audit = new Map<string, CredentialAudit[]>();
  private readonly health = new Map<string, { lastTestAt?: string; latencyMs?: number; ok: boolean; reason?: string }>();
  private readonly modes = new Map<string, CredentialMode>();

  constructor(private readonly configs: SystemConfigService) {}

  async list(): Promise<Array<CredentialDefinition & { audit: CredentialAudit[]; healthCheck: { lastTestAt?: string; latencyMs?: number; ok: boolean; reason?: string }; lastSwitchAt?: string; mode: CredentialMode }>> {
    return definitions.map((item) => {
      const rows = this.audit.get(item.key) ?? [];
      return {
        ...item,
        audit: rows.slice(-3).reverse(),
        healthCheck: this.health.get(item.key) ?? { ok: false, reason: 'not_tested' },
        lastSwitchAt: [...rows].reverse().find((row) => row.action === 'credential.switch')?.at,
        mode: this.modes.get(item.key) ?? 'mock',
      };
    });
  }

  async save(key: string, input: { reason: string; value: string }): Promise<{ key: string; saved: true }> {
    this.assertKnown(key);
    this.configs.set({
      description: `encrypted credential ${key}`,
      key: `system_configs.credentials.${key}`,
      value: this.encrypt(input.value),
    });
    this.record(key, { action: 'credential.upsert', operator: 'platform-owner', reason: input.reason });
    return { key, saved: true };
  }

  async test(key: string): Promise<{ latencyMs: number; ok: boolean; reason?: string }> {
    this.assertKnown(key);
    const started = Date.now();
    const result = await this.realProviderTest(key);
    const healthCheck = { ...result, latencyMs: Date.now() - started };
    this.health.set(key, { ...healthCheck, lastTestAt: new Date().toISOString() });
    this.record(key, { action: 'credential.test', after: healthCheck, operator: 'platform-owner' });
    return healthCheck;
  }

  async switchMode(key: string, input: { to: CredentialMode }): Promise<{ key: string; mode: CredentialMode }> {
    this.assertKnown(key);
    const before = this.modes.get(key) ?? 'mock';
    if (input.to === 'real' && !this.health.get(key)?.ok) {
      const retest = await this.test(key);
      if (!retest.ok) {
        return { key, mode: before };
      }
    }
    this.modes.set(key, input.to);
    this.record(key, { action: 'credential.switch', after: input.to, before, operator: 'platform-owner' });
    return { key, mode: input.to };
  }

  auditRows(key: string, limit = 20): CredentialAudit[] {
    this.assertKnown(key);
    return (this.audit.get(key) ?? []).slice(-limit).reverse();
  }

  private assertKnown(key: string): void {
    if (!definitions.some((item) => item.key === key)) {
      throw new Error(`Unknown credential key ${key}`);
    }
  }

  private encrypt(value: string): { authTag: string; iv: string; value: string } {
    const secret = process.env.MASTER_ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? 'local-development-master-secret';
    const key = createHash('sha256').update(secret).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return { authTag: cipher.getAuthTag().toString('base64'), iv: iv.toString('base64'), value: encrypted.toString('base64') };
  }

  private async realProviderTest(key: string): Promise<{ ok: boolean; reason?: string }> {
    const token = process.env[key];
    if (!token) return { ok: false, reason: `${key}_missing` };
    try {
      if (key === 'DEEPSEEK_API_KEY') await fetch('https://api.deepseek.com/v1/models', { headers: { Authorization: `Bearer ${token}` } });
      else if (key === 'MIDLAYER_API_KEY') await fetch(`${process.env.MIDLAYER_BASE_URL ?? 'https://midlayer.invalid'}/models`, { headers: { Authorization: `Bearer ${token}` } });
      else if (key === 'MIDLAYER_BASE_URL') return { ok: token.startsWith('https://') };
      else if (key === 'ALIYUN_DASHSCOPE_API_KEY') await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', { headers: { Authorization: `Bearer ${token}` } });
      else if (key.includes('WECHAT_MP')) await fetch('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=placeholder&secret=placeholder');
      else return { ok: false, reason: 'provider_requires_full_credential_pair' };
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error instanceof Error ? error.message : 'provider_request_failed' };
    }
  }

  private record(key: string, event: Omit<CredentialAudit, 'at'>): void {
    const rows = this.audit.get(key) ?? [];
    rows.push({ ...event, at: new Date().toISOString() });
    this.audit.set(key, rows);
  }
}
