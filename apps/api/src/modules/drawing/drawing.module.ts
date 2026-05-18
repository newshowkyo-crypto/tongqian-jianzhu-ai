import { Module } from '@nestjs/common';

import { DrawingController } from './drawing.controller.js';
import { DrawingService } from './drawing.service.js';

@Module({
  controllers: [DrawingController],
  exports: [DrawingService],
  providers: [DrawingService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DrawingModule {}
