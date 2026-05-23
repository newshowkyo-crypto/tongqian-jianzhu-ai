import { Module } from '@nestjs/common';

import { PromptTestingCurationController } from './prompt-testing-curation.controller.js';
import { PromptTestingCurationService } from './prompt-testing-curation.service.js';

@Module({
  controllers: [PromptTestingCurationController],
  exports: [PromptTestingCurationService],
  providers: [PromptTestingCurationService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PromptTestingCurationModule {}
