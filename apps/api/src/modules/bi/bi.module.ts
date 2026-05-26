import { Module } from '@nestjs/common';

import { BiController } from './bi.controller.js';
import { BiQueryService } from './bi-query.service.js';

@Module({
  controllers: [BiController],
  exports: [BiQueryService],
  providers: [BiQueryService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BiModule {}
