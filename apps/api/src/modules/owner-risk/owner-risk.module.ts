import { Module } from '@nestjs/common';

import { AiGatewayModule } from '../../ai-gateway/ai-gateway.module.js';
import { CreditModule } from '../credit/credit.module.js';

import { OwnerRiskController } from './owner-risk.controller.js';
import { OwnerRiskRepository } from './owner-risk.repository.js';
import { OwnerRiskService } from './owner-risk.service.js';

@Module({
  controllers: [OwnerRiskController],
  exports: [OwnerRiskService],
  imports: [CreditModule, AiGatewayModule],
  providers: [OwnerRiskService, OwnerRiskRepository],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class OwnerRiskModule {}
