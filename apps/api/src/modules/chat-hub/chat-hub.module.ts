import { Module } from '@nestjs/common';

import { ChatHubController } from './chat-hub.controller.js';
import { ChatHubService } from './chat-hub.service.js';
import { SuperInputService } from './super-input.service.js';
import { ToolRegistryService } from './tool-registry.service.js';

@Module({
  controllers: [ChatHubController],
  exports: [ChatHubService, SuperInputService],
  providers: [ChatHubService, SuperInputService, ToolRegistryService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ChatHubModule {}
