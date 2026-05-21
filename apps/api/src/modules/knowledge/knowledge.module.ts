import { Module } from '@nestjs/common';

import { RagIndexerService } from '../knowledge-system/rag-indexer.service.js';

import { KnowledgeController } from './knowledge.controller.js';
import { KnowledgeService } from './knowledge.service.js';

@Module({
  controllers: [KnowledgeController],
  exports: [KnowledgeService, RagIndexerService],
  providers: [KnowledgeService, RagIndexerService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class KnowledgeModule {}
