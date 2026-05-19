import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from '@nestjs/common';
import { z } from 'zod';

import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';

import { PositionTagService } from './position-tag.service.js';

function ApiTags(..._tags: string[]): ClassDecorator { return () => undefined; }
function ApiOperation(_options: { summary: string }): MethodDecorator { return () => undefined; }
const AssignSchema = z.object({ assignedBy: z.string().optional(), tags: z.array(z.string()).min(1) });
const RemoveSchema = z.object({ tag: z.string().min(1) });

@ApiTags('position-tag')
@Controller('api/v1/users/:id/position-tags')
export class PositionTagController {
  constructor(@Inject(PositionTagService) private readonly positionTags: PositionTagService) {}

  @Get()
  @RequirePermission('position-tag:read')
  @ApiOperation({ summary: 'List one user position tags' })
  list(@Param('id') userId: string): unknown {
    return this.ok({ permissionHints: this.positionTags.permissionHints(this.positionTags.get(userId)), tags: this.positionTags.get(userId), userId }, 'Position tags');
  }

  @Get(':tag')
  @RequirePermission('position-tag:read')
  @ApiOperation({ summary: 'Get one position tag assignment state' })
  detail(@Param('id') userId: string, @Param('tag') tag: string): unknown {
    return this.ok({ exists: this.positionTags.get(userId).includes(tag.toUpperCase()), tag, userId }, 'Position tag');
  }

  @Post()
  @RequirePermission('position-tag:create')
  @ApiOperation({ summary: 'Assign position tags to a user' })
  create(@Param('id') userId: string, @Body() body: unknown, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const input = AssignSchema.parse(body);
    return this.ok(this.positionTags.assign(userId, input.tags, tenantId, input.assignedBy), 'Position tags assigned');
  }

  @Patch(':tag')
  @RequirePermission('position-tag:update')
  @ApiOperation({ summary: 'Replace user position tag set' })
  update(@Param('id') userId: string, @Body() body: unknown, @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    const input = AssignSchema.parse(body);
    return this.ok(this.positionTags.assign(userId, input.tags, tenantId, input.assignedBy), 'Position tags updated');
  }

  @Delete(':tag')
  @RequirePermission('position-tag:delete')
  @ApiOperation({ summary: 'Remove one position tag from a user' })
  remove(@Param('id') userId: string, @Body() body: unknown): unknown {
    const input = RemoveSchema.parse(body);
    return this.ok(this.positionTags.remove(userId, input.tag), 'Position tag removed');
  }

  private ok(data: unknown, message: string): { code: 'OK'; data: unknown; message: string; traceId: string } {
    return { code: 'OK', data, message, traceId: crypto.randomUUID() };
  }
}
