import { Module } from '@nestjs/common';

import { ActualCostController } from './actual-cost.controller.js';
import { ActualCostService } from './actual-cost.service.js';

@Module({
  controllers: [ActualCostController],
  exports: [ActualCostService],
  providers: [ActualCostService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ActualCostModule {}
