import { Module } from '@nestjs/common';

import { RuleCurationController } from './rule-curation.controller.js';
import { RulesService } from './rules.service.js';

@Module({
  controllers: [RuleCurationController],
  exports: [RulesService],
  providers: [RulesService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RuleCurationModule {}
