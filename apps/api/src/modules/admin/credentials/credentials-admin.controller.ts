import { Body, Controller, Get, Inject, Param, Post, Put, Req, UseGuards } from '@nestjs/common';

import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { JwtGuard } from '../../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';

import type { CredentialMode } from './credentials-admin.repository.js';
import { CredentialsAdminService } from './credentials-admin.service.js';

type AdminRequest = { headers: Record<string, string | string[] | undefined> };

interface ResponseEnvelope {
  code: 0;
  data: unknown;
  message: string;
  traceId: string;
}

@Controller('api/v1/admin/credentials')
@UseGuards(JwtGuard, PermissionGuard)
export class CredentialsAdminController {
  constructor(@Inject(CredentialsAdminService) private readonly service: CredentialsAdminService) {}

  @Get()
  @RequirePermission('system-config:view')
  async list(): Promise<ResponseEnvelope> {
    return this.ok(await this.service.list(), 'credentials list');
  }

  @Get(':key')
  @RequirePermission('system-config:view')
  async detail(@Param('key') key: string): Promise<ResponseEnvelope> {
    return this.ok(await this.service.detail(key), 'credential detail');
  }

  @Put(':key')
  @RequirePermission('system-config:edit')
  async put(@Param('key') key: string, @Body() body: { mode?: CredentialMode; provider?: string; value?: string }, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    return this.ok(await this.service.upsert(key, body, this.userAgent(req)), 'credential detail');
  }

  @Post(':key/switch-mode')
  @RequirePermission('system-config:edit')
  async switchMode(@Param('key') key: string, @Body() body: { mode?: CredentialMode }, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    return this.ok(await this.service.switchMode(key, body, this.userAgent(req)), 'credential detail');
  }

  @Post(':key/test')
  @RequirePermission('system-config:view')
  async test(@Param('key') key: string, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    return this.ok(await this.service.test(key, this.userAgent(req)), 'credential ping');
  }

  @Get(':key/audit')
  @RequirePermission('audit-log:view')
  async auditRows(@Param('key') key: string): Promise<ResponseEnvelope> {
    return this.ok(await this.service.auditRows(key), 'credential audit');
  }

  @Post()
  @RequirePermission('system-config:edit')
  async saveLegacy(@Body() body: { key: string; mode?: CredentialMode; provider?: string; value?: string }, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    return this.put(body.key, body, req);
  }

  @Post(':provider/ping')
  @RequirePermission('system-config:view')
  async pingLegacy(@Param('provider') provider: string, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    return this.test(provider, req);
  }

  @Post(':provider/activate')
  @RequirePermission('system-config:edit')
  async activateLegacy(@Param('provider') provider: string, @Req() req: AdminRequest): Promise<ResponseEnvelope> {
    return this.switchMode(provider, { mode: 'real' }, req);
  }

  private userAgent(req: AdminRequest): string {
    const value = req.headers['x-user-id'];
    return Array.isArray(value) ? value[0] ?? 'platform-owner' : value ?? 'platform-owner';
  }

  private ok(data: unknown, message: string): ResponseEnvelope {
    return { code: 0, data, message, traceId: this.service.traceId() };
  }
}
