import { Body, Controller, Headers, Inject, Post } from '@nestjs/common';

import { UserInviteService } from './user-invite.service.js';

@Controller('api/v1/users/invite')
export class UserInviteController {
  constructor(@Inject(UserInviteService) private readonly invites: UserInviteService) {}

  @Post()
  invite(@Body() body: { phone: string; positionTags: string[] }, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.invites.invite({ ...body, tenantId }), message: 'Invite created', traceId: crypto.randomUUID() };
  }
}
