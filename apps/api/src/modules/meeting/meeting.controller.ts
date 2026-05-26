import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';

import { MeetingService } from './meeting.service.js';

@Controller('api/v1/meetings')
export class MeetingController {
  constructor(@Inject(MeetingService) private readonly meetings: MeetingService) {}

  @Post()
  submitTranscript(@Body() body: { projectId?: string; title: string; transcript: string }, @Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') ownerId = 'mock-user'): unknown {
    return { code: 'OK', data: this.meetings.submitTranscript({ ...body, ownerId, tenantId }), message: 'Meeting transcript saved', traceId: crypto.randomUUID() };
  }

  @Post(':id/minute')
  generateMinute(@Param('id') id: string): unknown {
    return { code: 'OK', data: this.meetings.generateMinute(id), message: 'Meeting minute generated', traceId: crypto.randomUUID() };
  }

  @Get('todos')
  todos(@Headers('x-tenant-id') tenantId = 'mock-tenant', @Headers('x-user-id') ownerId = 'mock-user'): unknown {
    return { code: 'OK', data: this.meetings.listMyTodos(tenantId, ownerId), message: 'My todos', traceId: crypto.randomUUID() };
  }
}
