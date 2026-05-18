import type { TenantContext } from '../../common/context/tenant-context.service.js';

export interface ScopedWhere {
  deletedAt?: null;
  ownerId?: string;
  projectId?: string;
  scopeType: string;
  tenantId: string;
}

export abstract class BaseRepository {
  protected withScope<TWhere extends Record<string, unknown>>(context: TenantContext, where: TWhere): TWhere & ScopedWhere {
    return {
      ...where,
      deletedAt: null,
      ownerId: context.ownerId,
      projectId: context.projectId,
      scopeType: context.scopeType,
      tenantId: context.tenantId,
    };
  }
}
