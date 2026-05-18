import { Module } from '@nestjs/common';

import { AdminOpsController } from './admin-ops.controller.js';
import { AdminOpsService } from './admin-ops.service.js';

@Module({
  controllers: [AdminOpsController],
  exports: [AdminOpsService],
  providers: [AdminOpsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AdminOpsModule {}
