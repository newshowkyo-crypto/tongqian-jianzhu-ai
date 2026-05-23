import { Module } from '@nestjs/common';

import { SystemConfigController } from './system-config.controller.js';
import { SystemConfigService } from './system-config.service.js';

@Module({
  controllers: [SystemConfigController],
  exports: [SystemConfigService],
  providers: [SystemConfigService],
})
export class SystemConfigModule {
  readonly name = 'system-config';
}
