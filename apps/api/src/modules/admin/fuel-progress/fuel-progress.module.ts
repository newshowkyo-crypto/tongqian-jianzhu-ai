import { Module } from '@nestjs/common';

import { KnowledgeCurationModule } from '../../knowledge-curation/knowledge-curation.module.js';
import { PromptTestingCurationModule } from '../../prompt-testing-curation/prompt-testing-curation.module.js';
import { RuleCurationModule } from '../../rule-curation/rule-curation.module.js';

import { FuelProgressController } from './fuel-progress.controller.js';
import { FuelProgressService } from './fuel-progress.service.js';

@Module({
  controllers: [FuelProgressController],
  exports: [FuelProgressService],
  imports: [RuleCurationModule, KnowledgeCurationModule, PromptTestingCurationModule],
  providers: [FuelProgressService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FuelProgressModule {}
