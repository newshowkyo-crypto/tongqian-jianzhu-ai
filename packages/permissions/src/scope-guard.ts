import type { ScopeContext, ScopeWhere } from '@tongqian/types';

export function buildScopeWhere(context: ScopeContext): ScopeWhere {
  return {
    tenant_id: context.tenantId,
    scope_type: context.scopeType,
    deleted_at: null,
    project_id: context.projectId,
    owner_id: context.ownerOnly ? context.userId : context.ownerId,
  };
}

export function isOwnerScoped(context: ScopeContext): boolean {
  return context.ownerOnly === true || context.ownerId !== undefined;
}
