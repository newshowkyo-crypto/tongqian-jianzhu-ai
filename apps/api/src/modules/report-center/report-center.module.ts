import { Module } from '@nestjs/common';

import { ReportCenterController } from './report-center.controller.js';
import { ReportCenterService } from './report-center.service.js';

@Module({
  controllers: [ReportCenterController],
  exports: [ReportCenterService],
  providers: [ReportCenterService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReportCenterModule {}
