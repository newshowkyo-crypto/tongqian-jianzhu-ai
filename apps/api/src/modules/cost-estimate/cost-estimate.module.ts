import { Module } from '@nestjs/common';

import { CostEstimateController } from './cost-estimate.controller.js';
import { CostEstimateService } from './cost-estimate.service.js';

@Module({
  controllers: [CostEstimateController],
  exports: [CostEstimateService],
  providers: [CostEstimateService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CostEstimateModule {}
