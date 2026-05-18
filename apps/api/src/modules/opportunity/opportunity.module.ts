import { Module } from '@nestjs/common';

import { ReportCenterModule } from '../report-center/report-center.module.js';

import { OpportunityController } from './opportunity.controller.js';
import { OpportunityService } from './opportunity.service.js';

@Module({
  controllers: [OpportunityController],
  exports: [OpportunityService],
  imports: [ReportCenterModule],
  providers: [OpportunityService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OpportunityModule {}
