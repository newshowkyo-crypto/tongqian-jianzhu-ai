import { Module } from '@nestjs/common';

import { StorageModule } from '../storage/storage.module.js';

import { DrawingController } from './drawing.controller.js';
import { DrawingService } from './drawing.service.js';

@Module({
  controllers: [DrawingController],
  exports: [DrawingService],
  imports: [StorageModule],
  providers: [DrawingService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DrawingModule {}
