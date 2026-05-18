import { Body, Controller, Get, Headers, Inject, Param, Post, Put } from '@nestjs/common';
import type { NotificationChannel, NotificationLevel, NotificationPreferenceView } from '@tongqian/types';

import { NotificationService } from './notification.service.js';

@Controller('api/v1')
export class NotificationController {
  constructor(@Inject(NotificationService) private readonly notifications: NotificationService) {}

  @Post('notifications/send')
  send(@Body() body: { channels?: NotificationChannel[]; eventId: string; payload?: Record<string, unknown>; scenario: string }, @Headers('x-user-id') userId = 'mock-user', @Headers('x-user-role') role: 'GOV_USER' | 'USER' = 'USER'): unknown {
    return { code: 'OK', data: this.notifications.send({ ...body, payload: body.payload ?? {}, role, userId }), message: 'Notification sent', traceId: crypto.randomUUID() };
  }

  @Get('notifications/me')
  list(@Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.notifications.list(userId), message: 'Notifications', traceId: crypto.randomUUID() };
  }

  @Put('notifications/:id/read')
  read(@Param('id') id: string, @Headers('x-user-id') userId = 'mock-user'): unknown {
    return { code: 'OK', data: this.notifications.markRead(userId, id), message: 'Notification read', traceId: crypto.randomUUID() };
  }

  @Put('notifications/preferences')
  preference(@Body() body: Partial<NotificationPreferenceView>, @Headers('x-user-id') userId = 'mock-user', @Headers('x-user-role') role: 'GOV_USER' | 'USER' = 'USER'): unknown {
    return { code: 'OK', data: this.notifications.setPreference(userId, body, role), message: 'Notification preference saved', traceId: crypto.randomUUID() };
  }

  @Get('admin/notifications/stats')
  stats(): unknown {
    return { code: 'OK', data: this.notifications.stats(), message: 'Notification stats', traceId: crypto.randomUUID() };
  }

  @Post('admin/notifications/templates')
  template(@Body() body: { level: NotificationLevel; scenario: string; templates: Partial<Record<NotificationChannel, string>> }): unknown {
    return { code: 'OK', data: this.notifications.upsertTemplate(body), message: 'Notification template saved', traceId: crypto.randomUUID() };
  }
}
