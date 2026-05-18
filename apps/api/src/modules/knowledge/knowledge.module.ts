import { Module } from '@nestjs/common';

import { KnowledgeController } from './knowledge.controller.js';
import { KnowledgeService } from './knowledge.service.js';

@Module({
  controllers: [KnowledgeController],
  exports: [KnowledgeService],
  providers: [KnowledgeService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class KnowledgeModule {}
