import { Injectable } from '@nestjs/common';

export interface AdminTenantContext {
  ownerId?: string;
  projectId?: string;
  scopeType: string;
  tenantId: string;
  traceId: string;
  userId: string;
}

export interface AdminListFilters {
  cursor?: string;
  keyword?: string;
  ownerId?: string;
  page?: string;
  pageSize?: string;
  projectId?: string;
  scopeType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  tenantId?: string;
}

export interface AdminResourceRow {
  deletedAt?: string;
  id: string;
  name: string;
  ownerId?: string;
  projectId?: string;
  risk: 'high' | 'low' | 'medium';
  scopeType: string;
  status: 'active' | 'completed' | 'deleted' | 'pending' | 'processing';
  tenantId: string;
  traceId: string;
  updatedAt: string;
}

export interface AdminListResult {
  audit: Record<string, unknown>;
  items: AdminResourceRow[];
  page: number;
  pageSize: number;
  total: number;
  where: Record<string, string | undefined>;
}

@Injectable()
export class AdminResourceService {
  private readonly rows = new Map<string, AdminResourceRow[]>();
  private readonly auditRows: Array<Record<string, unknown>> = [];

  list(module: string, filters: AdminListFilters, ctx: AdminTenantContext): AdminListResult {
    const page = Math.max(1, Number(filters.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize ?? 20)));
    const where = this.whereGuard(filters, ctx);
    const keyword = filters.keyword?.toLowerCase();
    const source = this.ensureRows(module, ctx);
    const filtered = source.filter((row) => {
      const scopeOk = row.tenantId === where.tenantId && row.scopeType === where.scopeType;
      const projectOk = !where.projectId || row.projectId === where.projectId;
      const ownerOk = !where.ownerId || row.ownerId === where.ownerId;
      const statusOk = !filters.status || filters.status === 'all' || row.status === filters.status;
      const keywordOk = !keyword || JSON.stringify(row).toLowerCase().includes(keyword);
      return scopeOk && projectOk && ownerOk && statusOk && keywordOk && !row.deletedAt;
    });
    const sorted = [...filtered].sort((left, right) => this.compareRows(left, right, filters.sortBy ?? 'updatedAt', filters.sortOrder ?? 'desc'));
    const items = sorted.slice((page - 1) * pageSize, page * pageSize);
    this.audit(module, 'list', ctx, { filters, total: filtered.length });
    return { audit: { event: `admin.${module}.list`, traceId: ctx.traceId }, items, page, pageSize, total: filtered.length, where };
  }

  detail(module: string, id: string, ctx: AdminTenantContext): Record<string, unknown> {
    const row = this.find(module, id, ctx);
    this.audit(module, 'detail', ctx, { id });
    return {
      ...row,
      auditTrail: this.auditRows.filter((item) => item.module === module && item.resourceId === id).slice(-20),
      safeguards: this.whereGuard({}, ctx),
    };
  }

  create(module: string, body: Record<string, unknown>, ctx: AdminTenantContext): AdminResourceRow {
    const row: AdminResourceRow = {
      id: `${module}-${crypto.randomUUID().slice(0, 8)}`,
      name: String(body.name ?? `${module} created item`),
      ownerId: ctx.ownerId,
      projectId: ctx.projectId,
      risk: this.normalizeRisk(body.risk),
      scopeType: ctx.scopeType,
      status: 'pending',
      tenantId: ctx.tenantId,
      traceId: ctx.traceId,
      updatedAt: new Date().toISOString(),
    };
    this.rows.set(module, [row, ...this.ensureRows(module, ctx)]);
    this.audit(module, 'create', ctx, { after: row, idempotencyKey: body.idempotencyKey, resourceId: row.id });
    return row;
  }

  update(module: string, id: string, body: Record<string, unknown>, ctx: AdminTenantContext): AdminResourceRow {
    const rows = this.ensureRows(module, ctx);
    const index = rows.findIndex((row) => row.id === id && row.tenantId === ctx.tenantId);
    const before = index >= 0 && rows[index] ? rows[index] : this.find(module, id, ctx);
    const next: AdminResourceRow = {
      ...before,
      name: String(body.name ?? before.name),
      risk: this.normalizeRisk(body.risk ?? before.risk),
      status: this.normalizeStatus(body.status ?? before.status),
      traceId: ctx.traceId,
      updatedAt: new Date().toISOString(),
    };
    rows[index >= 0 ? index : 0] = next;
    this.audit(module, 'update', ctx, { after: next, before, resourceId: id });
    return next;
  }

  softDelete(module: string, id: string, ctx: AdminTenantContext): AdminResourceRow {
    const before = this.find(module, id, ctx);
    const next: AdminResourceRow = { ...before, deletedAt: new Date().toISOString(), status: 'deleted', traceId: ctx.traceId, updatedAt: new Date().toISOString() };
    const rows = this.ensureRows(module, ctx);
    const index = rows.findIndex((row) => row.id === id);
    if (index >= 0) rows[index] = next;
    this.audit(module, 'softDelete', ctx, { after: next, before, resourceId: id });
    return next;
  }

  action(module: string, id: string, action: string, body: Record<string, unknown>, ctx: AdminTenantContext): Record<string, unknown> {
    const row = this.find(module, id, ctx);
    const result = {
      action,
      approvalRequired: ['approve', 'reject', 'refund', 'rollback', 'activate'].includes(action),
      idempotencyKey: body.idempotencyKey ?? `${module}-${id}-${action}`,
      module,
      resourceId: id,
      status: action === 'approve' ? 'completed' : 'processing',
      traceId: ctx.traceId,
    };
    this.audit(module, action, ctx, { after: result, before: row, resourceId: id });
    return result;
  }

  export(module: string, filters: AdminListFilters, ctx: AdminTenantContext): Record<string, unknown> {
    const list = this.list(module, filters, ctx);
    const csv = ['id,name,status,risk,tenantId,scopeType,ownerId,projectId,updatedAt', ...list.items.map((row) => [row.id, row.name, row.status, row.risk, row.tenantId, row.scopeType, row.ownerId ?? '', row.projectId ?? '', row.updatedAt].join(','))].join('\n');
    const result = { csv, filename: `${module}-${Date.now()}.csv`, rowCount: list.items.length, traceId: ctx.traceId };
    this.audit(module, 'export', ctx, { after: { filename: result.filename, rowCount: result.rowCount } });
    return result;
  }

  private ensureRows(module: string, ctx: AdminTenantContext): AdminResourceRow[] {
    const existing = this.rows.get(module);
    if (existing) return existing;
    const seeded: AdminResourceRow[] = [1, 2, 3].map((index) => this.seedRow(module, index, ctx));
    this.rows.set(module, seeded);
    return seeded;
  }

  private find(module: string, id: string, ctx: AdminTenantContext): AdminResourceRow {
    const row = this.ensureRows(module, ctx).find((item) => item.id === id && item.tenantId === ctx.tenantId && !item.deletedAt);
    if (!row) {
      const fallback = this.ensureRows(module, ctx)[0] ?? this.seedRow(module, 1, ctx);
      return { ...fallback, id, name: `${module} fallback detail`, traceId: ctx.traceId };
    }
    return row;
  }

  private whereGuard(filters: AdminListFilters, ctx: AdminTenantContext): Record<string, string | undefined> {
    return {
      ownerId: filters.ownerId ?? ctx.ownerId,
      projectId: filters.projectId ?? ctx.projectId,
      scopeType: filters.scopeType ?? ctx.scopeType,
      tenantId: filters.tenantId ?? ctx.tenantId,
    };
  }

  private seedRow(module: string, index: number, ctx: AdminTenantContext): AdminResourceRow {
    return {
      id: `${module}-${String(index).padStart(3, '0')}`,
      name: `${module} record ${index}`,
      ownerId: index === 3 ? 'audit-bot' : ctx.ownerId,
      projectId: ctx.projectId,
      risk: index === 2 ? 'high' : index === 3 ? 'low' : 'medium',
      scopeType: ctx.scopeType,
      status: index === 1 ? 'active' : index === 2 ? 'processing' : 'completed',
      tenantId: ctx.tenantId,
      traceId: ctx.traceId,
      updatedAt: new Date(Date.now() - index * 3_600_000).toISOString(),
    };
  }

  private audit(module: string, action: string, ctx: AdminTenantContext, payload: Record<string, unknown>): void {
    this.auditRows.push({
      action: `admin.${module}.${action}`,
      at: new Date().toISOString(),
      module,
      resourceId: payload.resourceId,
      tenantId: ctx.tenantId,
      traceId: ctx.traceId,
      userId: ctx.userId,
      ...payload,
    });
  }

  private compareRows(left: AdminResourceRow, right: AdminResourceRow, sortBy: string, sortOrder: 'asc' | 'desc'): number {
    const leftValue = String(left[sortBy as keyof AdminResourceRow] ?? '');
    const rightValue = String(right[sortBy as keyof AdminResourceRow] ?? '');
    return sortOrder === 'asc' ? leftValue.localeCompare(rightValue) : rightValue.localeCompare(leftValue);
  }

  private normalizeRisk(value: unknown): AdminResourceRow['risk'] {
    return value === 'high' || value === 'low' || value === 'medium' ? value : 'medium';
  }

  private normalizeStatus(value: unknown): AdminResourceRow['status'] {
    return value === 'active' || value === 'completed' || value === 'deleted' || value === 'pending' || value === 'processing' ? value : 'processing';
  }
}
