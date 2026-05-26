import { Module } from '@nestjs/common';

import { DecisionAdvisorService } from './decision-advisor.service.js';
import { DecisionController } from './decision.controller.js';

@Module({
  controllers: [DecisionController],
  exports: [DecisionAdvisorService],
  providers: [DecisionAdvisorService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DecisionModule {}
