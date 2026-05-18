import { Module } from '@nestjs/common';

import { GovSoeController } from './gov-soe.controller.js';
import { GovSoeService } from './gov-soe.service.js';

@Module({
  controllers: [GovSoeController],
  exports: [GovSoeService],
  providers: [GovSoeService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class GovSoeModule {}
