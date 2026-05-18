import { Module } from '@nestjs/common';

import { UserDevicesModule } from './devices/user-devices.module.js';
import { UserInviteController } from './invite/user-invite.controller.js';
import { UserInviteService } from './invite/user-invite.service.js';
import { PositionTagController } from './position-tag/position-tag.controller.js';
import { PositionTagService } from './position-tag/position-tag.service.js';

@Module({
  controllers: [PositionTagController, UserInviteController],
  imports: [UserDevicesModule],
  providers: [PositionTagService, UserInviteService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UserModule {}
