import { Module } from '@nestjs/common';

import { AiGatewayModule } from '../../ai-gateway/ai-gateway.module.js';
import { RuleCurationModule } from '../rule-curation/rule-curation.module.js';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module.js';

import { RuleExtractionService } from './rule-extraction.service.js';

@Module({
  exports: [RuleExtractionService],
  imports: [AiGatewayModule, RuleCurationModule, SecurityComplianceModule],
  providers: [RuleExtractionService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RuleExtractionModule {}
