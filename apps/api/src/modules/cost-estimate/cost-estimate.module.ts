import { Module } from '@nestjs/common';

import { AiGatewayModule } from '../../ai-gateway/ai-gateway.module.js';
import { CostCatalogModule } from '../cost-catalog/cost-catalog.module.js';

import { BudgetEstimatorService } from './budget-estimator.service.js';
import { CarbonEstimatorService } from './carbon-estimator.service.js';
import { CostEstimateController } from './cost-estimate.controller.js';
import { CostEstimateService } from './cost-estimate.service.js';
import { HistoricalCostService } from './historical-cost.service.js';
import { RoughQuantityService } from './rough-quantity.service.js';

@Module({
  controllers: [CostEstimateController],
  exports: [CostEstimateService],
  imports: [AiGatewayModule, CostCatalogModule],
  providers: [BudgetEstimatorService, CarbonEstimatorService, CostEstimateService, HistoricalCostService, RoughQuantityService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CostEstimateModule {}
