import { Module } from '@nestjs/common';

import { CostCatalogService } from './cost-catalog.service.js';

@Module({
  exports: [CostCatalogService],
  providers: [CostCatalogService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CostCatalogModule {}
