import { Module } from '@nestjs/common';

import { OpsToolkitController } from './ops-toolkit.controller.js';
import { OpsToolkitService } from './ops-toolkit.service.js';

@Module({
  controllers: [OpsToolkitController],
  exports: [OpsToolkitService],
  providers: [OpsToolkitService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OpsToolkitModule {}
