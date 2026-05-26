import { Module } from '@nestjs/common';

import { MaterialController } from './material.controller.js';
import { MaterialService } from './material.service.js';

@Module({
  controllers: [MaterialController],
  exports: [MaterialService],
  providers: [MaterialService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MaterialModule {}
