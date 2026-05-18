import { Module } from '@nestjs/common';

import { ReportCenterModule } from '../report-center/report-center.module.js';

import { RiskReviewController } from './risk-review.controller.js';
import { RiskReviewService } from './risk-review.service.js';

@Module({
  controllers: [RiskReviewController],
  exports: [RiskReviewService],
  imports: [ReportCenterModule],
  providers: [RiskReviewService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RiskReviewModule {}
