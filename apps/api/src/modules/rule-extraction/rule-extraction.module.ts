import { Module } from '@nestjs/common';

import { AiGatewayModule } from '../../ai-gateway/ai-gateway.module.js';
import { LegalCorpusModule } from '../legal-corpus/legal-corpus.module.js';
import { RuleCurationModule } from '../rule-curation/rule-curation.module.js';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module.js';

import { RuleExtractionService } from './rule-extraction.service.js';
import { AutoDeprecateService } from './auto-deprecate.service.js';
import { DedupService } from './dedup.service.js';
import { RuleFromClauseService } from './rule-from-clause.service.js';
import { TimelinessService } from './timeliness.service.js';

@Module({
  exports: [AutoDeprecateService, DedupService, RuleExtractionService, RuleFromClauseService, TimelinessService],
  imports: [AiGatewayModule, LegalCorpusModule, RuleCurationModule, SecurityComplianceModule],
  providers: [AutoDeprecateService, DedupService, RuleExtractionService, RuleFromClauseService, TimelinessService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RuleExtractionModule {}
