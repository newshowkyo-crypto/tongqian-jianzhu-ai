import { Module } from '@nestjs/common';

import { QualityController } from './quality.controller.js';
import { QualityService } from './quality.service.js';

@Module({
  controllers: [QualityController],
  exports: [QualityService],
  providers: [QualityService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class QualityModule {}
