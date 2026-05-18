import { Module } from '@nestjs/common';

import { UserDevicesController } from './user-devices.controller.js';
import { UserDevicesService } from './user-devices.service.js';

@Module({
  controllers: [UserDevicesController],
  providers: [UserDevicesService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserDevicesModule {}
