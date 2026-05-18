import { Module } from '@nestjs/common';

import { ApprovalModule } from '../approval/approval.module.js';

import { DataExportController } from './data-export.controller.js';
import { DataExportService } from './data-export.service.js';

@Module({
  controllers: [DataExportController],
  imports: [ApprovalModule],
  providers: [DataExportService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DataExportModule {}
