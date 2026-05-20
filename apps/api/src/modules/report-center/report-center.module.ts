import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module.js';

import { ReportCenterController } from './report-center.controller.js';
import { ReportCenterService } from './report-center.service.js';

@Module({
  controllers: [ReportCenterController],
  exports: [ReportCenterService],
  imports: [StorageModule],
  providers: [ReportCenterService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ReportCenterModule {}
