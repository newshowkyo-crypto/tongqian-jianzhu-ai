import { Global, Module } from '@nestjs/common';

import { TenantContextService } from './tenant-context.service.js';

/**
 * Global tenant context module. Exposes the single shared {@link TenantContextService}
 * for all modules to access tenant context information.
 */
@Global()
@Module({
  exports: [TenantContextService],
  providers: [TenantContextService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TenantContextModule {}
