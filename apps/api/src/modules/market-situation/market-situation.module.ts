import { Module } from '@nestjs/common';

import { AiGatewayModule } from '../../ai-gateway/ai-gateway.module.js';
import { CreditModule } from '../credit/credit.module.js';

import { MarketSituationController } from './market-situation.controller.js';
import { MarketSituationRepository } from './market-situation.repository.js';
import { MarketSituationService } from './market-situation.service.js';

@Module({
  controllers: [MarketSituationController],
  exports: [MarketSituationService],
  imports: [CreditModule, AiGatewayModule],
  providers: [MarketSituationService, MarketSituationRepository],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MarketSituationModule {}
