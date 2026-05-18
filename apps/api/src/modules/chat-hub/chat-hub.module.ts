import { Module } from '@nestjs/common';

import { ChatHubController } from './chat-hub.controller.js';
import { ChatHubService } from './chat-hub.service.js';

@Module({
  controllers: [ChatHubController],
  exports: [ChatHubService],
  providers: [ChatHubService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ChatHubModule {}
