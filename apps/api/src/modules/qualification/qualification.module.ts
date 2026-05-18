import { Module } from '@nestjs/common';

import { ReportCenterModule } from '../report-center/report-center.module.js';

import { QualificationController } from './qualification.controller.js';
import { QualificationService } from './qualification.service.js';

@Module({
  controllers: [QualificationController],
  exports: [QualificationService],
  imports: [ReportCenterModule],
  providers: [QualificationService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class QualificationModule {}
