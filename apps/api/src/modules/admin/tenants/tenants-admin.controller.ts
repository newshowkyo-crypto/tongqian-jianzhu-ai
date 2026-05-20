import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import { TenantContextService, type TenantContext } from '../../../common/context/tenant-context.service.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { JwtGuard } from '../../../common/guards/jwt.guard.js';
import { PermissionGuard } from '../../../common/guards/permission.guard.js';
import { SecurityComplianceService } from '../../security-compliance/security-compliance.service.js';
import { AdminResourceService, type AdminListFilters, type AdminTenantContext } from '../admin-resource.service.js';

type AdminRequest = {
  headers: Record<string, string | string[] | undefined>;
  tenantContext?: Partial<TenantContext>;
};

function ApiTags(..._tags: string[]): ClassDecorator { return () => undefined; }
function ApiOperation(_options: { summary: string }): MethodDecorator { return () => undefined; }

@ApiTags('admin-tenants')
@Controller('api/v1/admin/tenants')
@UseGuards(JwtGuard, PermissionGuard)
@RequirePermission('')
export class TenantsAdminController {
  constructor(
    @Inject(AdminResourceService) private readonly service: AdminResourceService,
    @Inject(SecurityComplianceService) private readonly audit: SecurityComplianceService,
    @Inject(TenantContextService) private readonly tenantContext: TenantContextService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List tenants admin records with pagination, sorting, search and four-layer WHERE guards' })
  async list(@Query() filters: AdminListFilters, @Req() req: AdminRequest): Promise<unknown> {
    const ctx = this.ctx(req);
    const data = this.service.list('tenants', filters, ctx);
    this.writeAudit('list', ctx, { filters, where: data.where });
    return this.ok(data, 'tenants list');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Read one tenants admin record inside the current tenant boundary' })
  async detail(@Param('id') id: string, @Req() req: AdminRequest): Promise<unknown> {
    const ctx = this.ctx(req);
    const data = this.service.detail('tenants', id, ctx);
    this.writeAudit('detail', ctx, { resourceId: id });
    return this.ok(data, 'tenants detail');
  }

  @Post()
  @RequirePermission('')
  @ApiOperation({ summary: 'Create a tenants admin record through an auditable approval-safe path' })
  async create(@Body() dto: Record<string, unknown>, @Headers('idempotency-key') idempotencyKey: string | undefined, @Req() req: AdminRequest): Promise<unknown> {
    const ctx = this.ctx(req);
    const data = this.service.create('tenants', { ...dto, idempotencyKey }, ctx);
    this.writeAudit('create', ctx, { after: data, idempotencyKey, resourceId: data.id });
    return this.ok(data, 'tenants created');
  }

  @Patch(':id')
  @RequirePermission('')
  @ApiOperation({ summary: 'Update a tenants admin record while preserving before and after audit evidence' })
  async update(@Param('id') id: string, @Body() dto: Record<string, unknown>, @Req() req: AdminRequest): Promise<unknown> {
    const ctx = this.ctx(req);
    const before = this.service.detail('tenants', id, ctx);
    const data = this.service.update('tenants', id, dto, ctx);
    this.writeAudit('update', ctx, { after: data, before, resourceId: id });
    return this.ok(data, 'tenants updated');
  }

  @Delete(':id')
  @RequirePermission('')
  @ApiOperation({ summary: 'Soft delete a tenants admin record without deleting audit history' })
  async softDelete(@Param('id') id: string, @Req() req: AdminRequest): Promise<unknown> {
    const ctx = this.ctx(req);
    const data = this.service.softDelete('tenants', id, ctx);
    this.writeAudit('softDelete', ctx, { after: data, resourceId: id });
    return this.ok(data, 'tenants deleted');
  }

  @Post('export')
  @RequirePermission('')
  @ApiOperation({ summary: 'Export filtered tenants admin records as CSV with immutable audit metadata' })
  async export(@Query() filters: AdminListFilters, @Req() req: AdminRequest): Promise<unknown> {
    const ctx = this.ctx(req);
    const data = this.service.export('tenants', filters, ctx);
    this.writeAudit('export', ctx, { after: data });
    return this.ok(data, 'tenants export');
  }

  @Post(':id/:action')
  @RequirePermission('')
  @ApiOperation({ summary: 'Run a tenants row action such as approve, reject, refund, rollback or activate' })
  async action(@Param('id') id: string, @Param('action') action: string, @Body() dto: Record<string, unknown>, @Req() req: AdminRequest): Promise<unknown> {
    const ctx = this.ctx(req);
    const data = this.service.action('tenants', id, action, dto, ctx);
    this.writeAudit(action, ctx, { after: data, resourceId: id });
    return this.ok(data, 'tenants action');
  }

  private ctx(req: AdminRequest): AdminTenantContext {
    const header = (name: string, fallback: string): string => {
      const value = req.headers[name];
      return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
    };
    try {
      const active = this.tenantContext.get();
      return { ownerId: active.ownerId, projectId: active.projectId, scopeType: active.scopeType, tenantId: active.tenantId, traceId: active.traceId, userId: active.userId };
    } catch {
      return {
        ownerId: header('x-owner-id', 'platform-owner'),
        projectId: header('x-project-id', 'admin-console'),
        scopeType: header('x-scope-type', 'platform'),
        tenantId: header('x-tenant-id', 'platform-tenant'),
        traceId: header('x-trace-id', crypto.randomUUID()),
        userId: header('x-user-id', 'platform-owner'),
      };
    }
  }

  private writeAudit(action: string, ctx: AdminTenantContext, payload: Record<string, unknown>): void {
    this.audit.audit({ action: 'admin.tenants.' + action, after: payload.after as Record<string, unknown> | undefined, before: payload.before as Record<string, unknown> | undefined, resource: 'admin/tenants', resourceId: String(payload.resourceId ?? ''), tenantId: ctx.tenantId, traceId: ctx.traceId, userId: ctx.userId });
  }

  private ok(data: unknown, message: string): { code: 'OK'; data: unknown; message: string; traceId: string } {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}