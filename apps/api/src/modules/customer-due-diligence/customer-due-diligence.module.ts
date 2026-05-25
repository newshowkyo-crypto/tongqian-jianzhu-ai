import { Module } from '@nestjs/common';

import { DueDiligenceController } from './due-diligence.controller.js';
import { DueDiligenceService } from './due-diligence.service.js';

@Module({
  controllers: [DueDiligenceController],
  exports: [DueDiligenceService],
  providers: [DueDiligenceService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CustomerDueDiligenceModule {}
