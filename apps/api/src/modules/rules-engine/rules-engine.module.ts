import { Module } from '@nestjs/common';

import { RulesEngineController } from './rules-engine.controller.js';
import { RulesEngineService } from './rules-engine.service.js';

@Module({
  controllers: [RulesEngineController],
  exports: [RulesEngineService],
  providers: [RulesEngineService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RulesEngineModule {}
