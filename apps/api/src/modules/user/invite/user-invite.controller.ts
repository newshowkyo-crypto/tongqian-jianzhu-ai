import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from '@nestjs/common';
import { z } from 'zod';

import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';

import { UserInviteService } from './user-invite.service.js';

function ApiTags(..._tags: string[]): ClassDecorator { return () => undefined; }
function ApiOperation(_options: { summary: string }): MethodDecorator { return () => undefined; }
const InviteSchema = z.object({ inviterUserId: z.string().optional(), phone: z.string().regex(/^1[3-9]\d{9}$/u), positionTags: z.array(z.string()).min(1) });
const AcceptSchema = z.object({ userId: z.string().min(1) });

@ApiTags('user-invite')
@Controller('api/v1/user-invites')
export class UserInviteController {
  constructor(@Inject(UserInviteService) private readonly invites: UserInviteService) {}

  @Get()
  @RequirePermission('user-invite:read')
  @ApiOperation({ summary: 'List tenant user invites' })
  list(@Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return this.ok(this.invites.list(tenantId), 'Invites');
  }

  @Get(':id')
  @RequirePermission('user-invite:read')
  @ApiOperation({ summary: 'Get invite detail' })
  detail(@Param('id') id: string): unknown {
    return this.ok(this.invites.get(id), 'Invite');
  }

  @Post()
  @RequirePermission('user-invite:create')
  @ApiOperation({ summary: 'Create user invite with reward estimate' })
  create(@Body() body: unknown, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const input = InviteSchema.parse(body);
    return this.ok(this.invites.invite({ ...input, tenantId }), 'Invite created');
  }

  @Patch(':id')
  @RequirePermission('user-invite:update')
  @ApiOperation({ summary: 'Accept invite or update invite state' })
  update(@Param('id') id: string, @Body() body: unknown): unknown {
    const input = AcceptSchema.parse(body);
    return this.ok(this.invites.accept(id, input.userId), 'Invite accepted');
  }

  @Delete(':id')
  @RequirePermission('user-invite:delete')
  @ApiOperation({ summary: 'Cancel invite while retaining audit trace' })
  remove(@Param('id') id: string): unknown {
    return this.ok({ ...this.invites.get(id), status: 'canceled' }, 'Invite canceled');
  }

  private ok(data: unknown, message: string): { code: 'OK'; data: unknown; message: string; traceId: string } {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}
