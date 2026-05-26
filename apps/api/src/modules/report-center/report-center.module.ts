import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module.js';

import { AutoSummaryService } from './auto-summary.service.js';
import { QualityCheckService } from './quality-check.service.js';
import { ReportCenterController } from './report-center.controller.js';
import { ReportCenterService } from './report-center.service.js';
import { ReportExportService } from './report-export.service.js';

@Module({
  controllers: [ReportCenterController],
  exports: [QualityCheckService, ReportCenterService, ReportExportService],
  imports: [StorageModule],
  providers: [AutoSummaryService, QualityCheckService, ReportCenterService, ReportExportService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReportCenterModule {}
