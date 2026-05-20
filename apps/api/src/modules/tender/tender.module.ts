import { Module } from '@nestjs/common';

import { ReportCenterModule } from '../report-center/report-center.module.js';
import { StorageModule } from '../storage/storage.module.js';

import { TenderController } from './tender.controller.js';
import { TenderService } from './tender.service.js';

@Module({
  controllers: [TenderController],
  exports: [TenderService],
  imports: [ReportCenterModule, StorageModule],
  providers: [TenderService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TenderModule {}
