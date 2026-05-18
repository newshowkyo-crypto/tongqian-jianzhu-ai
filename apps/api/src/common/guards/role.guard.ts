import type { CanActivate, ExecutionContext} from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';

import type { TenantContextService } from '../context/tenant-context.service.js';
import { REQUIRED_ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(REQUIRED_ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) {
      return true;
    }
    const scope = this.tenantContext.get();
    if (!required.some((role) => scope.roles.includes(role) || scope.platformRole === role)) {
      throw new ForbiddenException({ code: 'PERM.ROLE_DENIED', message: 'Role denied' });
    }
    return true;
  }
}
