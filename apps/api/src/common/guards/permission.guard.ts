import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission } from '@tongqian/permissions';

import { TenantContextService as TenantContextServiceToken, type TenantContextService } from '../context/tenant-context.service.js';
import { REQUIRED_PERMISSION_KEY } from '../decorators/require-permission.decorator.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(TenantContextServiceToken) private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string | undefined>(REQUIRED_PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!required) {
      return true;
    }
    const scope = this.tenantContext.get();
    if (!hasPermission([...scope.roles, scope.platformRole].filter(Boolean) as string[], scope.positionTags, required)) {
      throw new ForbiddenException({ code: 'PERM.DENIED', message: 'Permission denied' });
    }
    return true;
  }
}
