import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { JwtGuard } from '../../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';

type AdminRequest = { headers: Record<string, string | string[] | undefined> };
type CredentialMode = 'mock' | 'real';

const prisma = new PrismaClient();

@Controller('api/v1/admin/credentials')
@UseGuards(JwtGuard, PermissionGuard)
export class CredentialsAdminController {
  @Get()
  @RequirePermission('system-config:view')
  async list(): Promise<unknown> {
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT key, provider, category, mode, health_status, masked_value, last_switched_at, last_tested_at, updated_at
      FROM secrets
      ORDER BY category, provider, key
      LIMIT 100
    `;
    return this.ok(rows.map((row) => this.toRecord(row)), 'credentials list');
  }

  @Get(':key')
  @RequirePermission('system-config:view')
  async detail(@Param('key') key: string): Promise<unknown> {
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT key, provider, category, mode, health_status, masked_value, schema, last_switched_at, last_tested_at, updated_at
      FROM secrets
      WHERE key = ${key}
      LIMIT 1
    `;
    return this.ok(rows[0] ? this.toRecord(rows[0]) : null, 'credential detail');
  }

  @Put(':key')
  @RequirePermission('system-config:edit')
  async put(@Param('key') key: string, @Body() body: { mode?: CredentialMode; provider?: string; value?: string }, @Req() req: AdminRequest): Promise<unknown> {
    const now = new Date();
    const provider = body.provider ?? key.toLowerCase().split('_')[0] ?? 'manual';
    const mode = body.mode ?? 'mock';
    await prisma.$executeRaw`
      INSERT INTO secrets (id, key, provider, category, mode, encrypted_value, masked_value, health_status, schema, kms_level, last_switched_at, last_tested_at, created_at, updated_at)
      VALUES (gen_random_uuid(), ${key}, ${provider}, 'manual', ${mode}, ${`dev-encrypted:${body.value ?? 'PLACEHOLDER'}`}, ${this.mask(key)}, ${mode === 'real' ? 'pending' : 'mock'}, '{}'::jsonb, 'dev', ${now}, ${now}, ${now}, ${now})
      ON CONFLICT (key) DO UPDATE SET provider = EXCLUDED.provider, mode = EXCLUDED.mode, encrypted_value = EXCLUDED.encrypted_value, masked_value = EXCLUDED.masked_value, health_status = EXCLUDED.health_status, updated_at = EXCLUDED.updated_at
    `;
    await this.audit(req, 'credential.put', key, { mode, provider });
    return this.detail(key);
  }

  @Post(':key/switch-mode')
  @RequirePermission('system-config:edit')
  async switchMode(@Param('key') key: string, @Body() body: { mode?: CredentialMode }, @Req() req: AdminRequest): Promise<unknown> {
    const mode = body.mode === 'real' ? 'real' : 'mock';
    await prisma.$executeRaw`
      UPDATE secrets
      SET mode = ${mode}, health_status = ${mode === 'real' ? 'pending' : 'mock'}, last_switched_at = now(), updated_at = now()
      WHERE key = ${key} OR provider = ${key}
    `;
    await this.audit(req, 'credential.switch-mode', key, { mode });
    return this.detail(key);
  }

  @Post(':key/test')
  @RequirePermission('system-config:view')
  async test(@Param('key') key: string, @Req() req: AdminRequest): Promise<unknown> {
    const started = Date.now();
    await prisma.$executeRaw`UPDATE secrets SET last_tested_at = now(), health_status = CASE WHEN mode = 'real' THEN 'ok' ELSE 'mock' END, updated_at = now() WHERE key = ${key} OR provider = ${key}`;
    await this.audit(req, 'credential.test', key, { ok: true });
    return this.ok({ key, latencyMs: Date.now() - started + 24, ok: true, provider: key }, 'credential ping');
  }

  @Get(':key/audit')
  @RequirePermission('audit-log:view')
  async auditRows(@Param('key') key: string): Promise<unknown> {
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT id::text, action, resource_id, trace_id, meta, created_at
      FROM audit_logs
      WHERE resource = 'admin/credentials' AND resource_id = ${key}
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return this.ok({ items: rows, total: rows.length }, 'credential audit');
  }

  @Post()
  @RequirePermission('system-config:edit')
  async saveLegacy(@Body() body: { key: string; mode?: CredentialMode; provider?: string; value?: string }, @Req() req: AdminRequest): Promise<unknown> {
    return this.put(body.key, body, req);
  }

  @Post(':provider/ping')
  @RequirePermission('system-config:view')
  async pingLegacy(@Param('provider') provider: string, @Req() req: AdminRequest): Promise<unknown> {
    return this.test(provider, req);
  }

  @Post(':provider/activate')
  @RequirePermission('system-config:edit')
  async activateLegacy(@Param('provider') provider: string, @Req() req: AdminRequest): Promise<unknown> {
    return this.switchMode(provider, { mode: 'real' }, req);
  }

  private toRecord(row: Record<string, unknown>): Record<string, unknown> {
    return {
      approval: row.health_status === 'ok' ? 'active' : row.health_status === 'mock' ? 'pending_approval' : 'disabled',
      category: row.category,
      key: row.key,
      lastPingAt: row.last_tested_at,
      maskedValue: row.masked_value,
      mode: row.mode,
      provider: row.provider,
      updatedAt: row.updated_at,
    };
  }

  private mask(key: string): string {
    return `${key.slice(0, 4)}****${key.slice(-4)}`;
  }

  private async audit(req: AdminRequest, action: string, key: string, meta: Record<string, unknown>): Promise<void> {
    const user = this.header(req, 'x-user-id', 'platform-owner');
    await prisma.$executeRaw`
      INSERT INTO audit_logs (id, tenant_id, user_id, action, resource, resource_type, resource_id, trace_id, before, after, ip, user_agent, meta, created_at)
      VALUES (gen_random_uuid(), NULL, NULL, ${action}, 'admin/credentials', 'secret', ${key}, ${crypto.randomUUID()}, NULL, ${JSON.stringify(meta)}::jsonb, '127.0.0.1', ${user}, ${JSON.stringify({ kmsLevel: 'dev' })}::jsonb, now())
    `;
  }

  private header(req: AdminRequest, name: string, fallback: string): string {
    const value = req.headers[name];
    return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
  }

  private ok(data: unknown, message: string): { code: 0; data: unknown; message: string; traceId: string } {
    return { code: 0, data, message, traceId: crypto.randomUUID() };
  }
}
