import { Body, Controller, Get, Headers, Inject, Param, Post } from '@nestjs/common';
import type { ChatChannel, ChatContext } from '@tongqian/types';

import { ChatHubService } from './chat-hub.service.js';

@Controller('api/v1')
export class ChatHubController {
  constructor(@Inject(ChatHubService) private readonly chat: ChatHubService) {}

  @Post('chat/conversations')
  create(@Body() body: { channel?: ChatChannel; title?: string }, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.chat.createConversation(this.ctx(tenantId, userId, body.channel ?? 'web'), body.title), message: 'Chat conversation created', traceId: crypto.randomUUID() };
  }

  @Get('chat/conversations/me')
  list(@Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.chat.listConversations(this.ctx(tenantId, userId, 'web')), message: 'Chat conversations', traceId: crypto.randomUUID() };
  }

  @Post('chat/conversations/:id/messages')
  send(@Param('id') id: string, @Body() body: { channel?: ChatChannel; content: string }, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.chat.sendMessage({ content: body.content, conversationId: id, ctx: this.ctx(tenantId, userId, body.channel ?? 'web') }), message: 'Chat message sent', traceId: crypto.randomUUID() };
  }

  @Get('chat/conversations/:id/messages')
  messages(@Param('id') id: string, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): unknown {
    return { code: 'OK', data: this.chat.listMessages(id, this.ctx(tenantId, userId, 'web')), message: 'Chat messages', traceId: crypto.randomUUID() };
  }

  @Get('chat/conversations/:id/stream')
  stream(@Param('id') id: string, @Headers('x-user-id') userId = 'mock-user', @Headers('x-tenant-id') tenantId = 'mock-tenant'): string {
    return this.chat.streamSnapshot(id, this.ctx(tenantId, userId, 'web'));
  }

  @Post('chat/channels/wechat/webhook')
  wechat(@Body() body: { content: string; openId: string; tenantId?: string; userId?: string }): unknown {
    return { code: 'OK', data: this.chat.ingestChannel({ channel: 'wechat', content: body.content, externalId: body.openId, tenantId: body.tenantId, userId: body.userId }), message: 'Wechat message accepted', traceId: crypto.randomUUID() };
  }

  @Post('chat/channels/work-wechat/webhook')
  workWechat(@Body() body: { content: string; tenantId?: string; userId?: string; workUserId: string }): unknown {
    return { code: 'OK', data: this.chat.ingestChannel({ channel: 'work_wechat', content: body.content, externalId: body.workUserId, tenantId: body.tenantId, userId: body.userId }), message: 'Work wechat message accepted', traceId: crypto.randomUUID() };
  }

  @Post('openapi/chat')
  openApi(@Body() body: { content: string; externalId?: string; tenantId?: string; userId?: string }): unknown {
    return { code: 'OK', data: this.chat.ingestChannel({ channel: 'api', content: body.content, externalId: body.externalId ?? 'openapi', tenantId: body.tenantId, userId: body.userId }), message: 'Open API chat accepted', traceId: crypto.randomUUID() };
  }

  private ctx(tenantId: string, userId: string, channel: ChatChannel): ChatContext {
    return { channel, scopeType: 'tenant', tenantId, userId };
  }
}
