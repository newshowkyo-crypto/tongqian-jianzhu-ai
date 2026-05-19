import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface TenantContext {
  ownerId?: string;
  platformRole?: string;
  positionTags: string[];
  projectId?: string;
  roles: string[];
  scopeType: string;
  tenantId: string;
  traceId: string;
  userId: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  /**
   * Returns current tenant context or raises a business error.
   *
   * @returns Tenant context.
   */
  get(): TenantContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Tenant context is missing.' });
    }
    return context;
  }

  /**
   * Runs a handler under validated tenant context.
   *
   * @param context Tenant context.
   * @param handler Handler.
   * @returns Handler result.
   */
  run<T>(context: TenantContext, handler: () => T): T {
    this.validate(context);
    return this.storage.run(context, handler);
  }

  /**
   * Returns the mandatory four-layer WHERE guard for repository calls.
   *
   * @param overrides Optional project or owner overrides after permission checks.
   * @returns Repository where guard.
   */
  whereGuard(overrides: Partial<Pick<TenantContext, 'ownerId' | 'projectId' | 'scopeType'>> = {}): Record<string, string | undefined> {
    const context = this.get();
    return {
      ownerId: overrides.ownerId ?? context.ownerId,
      projectId: overrides.projectId ?? context.projectId,
      scopeType: overrides.scopeType ?? context.scopeType,
      tenantId: context.tenantId,
    };
  }

  /**
   * Checks whether current context has one of required roles.
   *
   * @param roles Required roles.
   * @returns True when authorized.
   */
  hasRole(...roles: string[]): boolean {
    const context = this.get();
    return roles.some((role) => context.roles.includes(role));
  }

  /**
   * Requires a role and throws a permission error when missing.
   *
   * @param roles Required roles.
   */
  requireRole(...roles: string[]): void {
    if (!this.hasRole(...roles)) throw new BusinessError({ code: ErrorCodes.PERM_ACTION_DENIED.code, message: 'Required tenant role is missing.' });
  }

  /**
   * Builds audit actor metadata for write actions.
   *
   * @returns Audit actor row.
   */
  auditActor(): Record<string, string | undefined> {
    const context = this.get();
    return {
      ownerId: context.ownerId,
      platformRole: context.platformRole,
      projectId: context.projectId,
      tenantId: context.tenantId,
      traceId: context.traceId,
      userId: context.userId,
    };
  }

  private validate(context: TenantContext): void {
    if (!context.tenantId || !context.userId || !context.traceId || !context.scopeType) {
      throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Tenant context requires tenant, user, trace and scope.' });
    }
    if (!Array.isArray(context.roles) || !Array.isArray(context.positionTags)) {
      throw new BusinessError({ code: ErrorCodes.PERM_ACTION_DENIED.code, message: 'Tenant context roles are invalid.' });
    }
  }
}
