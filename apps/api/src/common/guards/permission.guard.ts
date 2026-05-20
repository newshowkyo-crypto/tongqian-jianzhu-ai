import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { TenantContextService as TenantContextServiceToken, type TenantContextService } from '../context/tenant-context.service.js';
import { REQUIRED_PERMISSION_KEY } from '../decorators/require-permission.decorator.js';

const ROLE_PERMISSION_PREFIXES: Readonly<Record<string, readonly string[]>> = {
  AGENT: ['dispatch:', 'contract:', 'appeal:', 'reputation:'],
  BUILDING_COMPANY_USER: ['contract:', 'subscription:', 'credit:', 'dispatch:', 'data-export:', 'appeal:'],
  GOV_USER: ['contract:', 'data-export:', 'prompt:', 'rule:'],
  PLATFORM: ['tenant:', 'audit:', 'system:', 'data-export:', 'withdrawal:', 'approval:'],
  PLATFORM_OWNER: [''],
};

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
    if (!this.hasPermission([...scope.roles, scope.platformRole].filter(Boolean) as string[], scope.positionTags, required)) {
      throw new ForbiddenException({ code: 'PERM.DENIED', message: 'Permission denied' });
    }
    return true;
  }

  private hasPermission(roles: string[], positionTags: string[], required: string): boolean {
    if (positionTags.includes('OWNER')) return true;
    return roles.some((role) => ROLE_PERMISSION_PREFIXES[role]?.some((prefix) => required.startsWith(prefix)));
  }
}
