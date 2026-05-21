import type { NestMiddleware } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';

import { TenantContextService } from '../context/tenant-context.service.js';

interface HeaderRequest {
  headers: Record<string, string | string[] | undefined>;
}

type HeaderResponse = object;
type NextFunction = () => void;

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    @Inject(TenantContextService)
    private readonly tenantContext: TenantContextService,
  ) {}

  use(request: HeaderRequest, _response: HeaderResponse, next: NextFunction): void {
    const roles = String(request.headers['x-roles'] ?? request.headers['x-role'] ?? 'BUILDING_COMPANY_USER')
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);

    this.tenantContext.run(
      {
        ownerId: request.headers['x-owner-id']?.toString(),
        platformRole: request.headers['x-platform-role']?.toString(),
        positionTags: String(request.headers['x-position-tags'] ?? 'OWNER')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        projectId: request.headers['x-project-id']?.toString(),
        roles,
        scopeType: request.headers['x-scope-type']?.toString() ?? 'tenant',
        tenantId: request.headers['x-tenant-id']?.toString() ?? 'mock-tenant',
        traceId: request.headers['x-trace-id']?.toString() ?? crypto.randomUUID(),
        userId: request.headers['x-user-id']?.toString() ?? 'mock-user',
      },
      next,
    );
  }
}
