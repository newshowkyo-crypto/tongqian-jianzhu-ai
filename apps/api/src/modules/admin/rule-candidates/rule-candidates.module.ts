import { Module } from '@nestjs/common';

import { RuleCurationModule } from '../../rule-curation/rule-curation.module.js';
import { SecurityComplianceModule } from '../../security-compliance/security-compliance.module.js';

import { RuleCandidatesController } from './rule-candidates.controller.js';

@Module({
  controllers: [RuleCandidatesController],
  imports: [RuleCurationModule, SecurityComplianceModule],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RuleCandidatesModule {}
