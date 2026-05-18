import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';

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

  get(): TenantContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new Error('TENANT.CONTEXT.MISSING');
    }
    return context;
  }

  run<T>(context: TenantContext, handler: () => T): T {
    return this.storage.run(context, handler);
  }
}
