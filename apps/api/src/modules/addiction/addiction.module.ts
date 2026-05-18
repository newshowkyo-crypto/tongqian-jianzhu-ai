import { Module } from '@nestjs/common';

import { AddictionController } from './addiction.controller.js';
import { AddictionService } from './addiction.service.js';

@Module({
  controllers: [AddictionController],
  exports: [AddictionService],
  providers: [AddictionService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AddictionModule {}
