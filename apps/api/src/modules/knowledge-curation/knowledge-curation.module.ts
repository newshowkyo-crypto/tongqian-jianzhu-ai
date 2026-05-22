import { Module } from '@nestjs/common';

import { KnowledgeCurationController } from './knowledge-curation.controller.js';
import { KnowledgeCurationService } from './knowledge-curation.service.js';

@Module({
  controllers: [KnowledgeCurationController],
  exports: [KnowledgeCurationService],
  providers: [KnowledgeCurationService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class KnowledgeCurationModule {}
