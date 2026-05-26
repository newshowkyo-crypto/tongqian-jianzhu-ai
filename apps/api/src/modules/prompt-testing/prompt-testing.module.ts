import { Module } from '@nestjs/common';

import { GoldenRunnerService } from './golden-runner.service.js';
import { PromptTestingController } from './prompt-testing.controller.js';

@Module({
  controllers: [PromptTestingController],
  exports: [GoldenRunnerService],
  providers: [GoldenRunnerService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PromptTestingModule {}
