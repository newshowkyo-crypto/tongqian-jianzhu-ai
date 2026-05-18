import { Body, Controller, Inject, Param, Post } from '@nestjs/common';

import { PositionTagService } from './position-tag.service.js';

@Controller('api/v1/users/:id/position-tags')
export class PositionTagController {
  constructor(@Inject(PositionTagService) private readonly positionTags: PositionTagService) {}

  @Post()
  assign(@Param('id') userId: string, @Body() body: { tags: string[] }): unknown {
    return { code: 'OK', data: this.positionTags.assign(userId, body.tags), message: 'Position tags assigned', traceId: crypto.randomUUID() };
  }
}
