import { Module } from '@nestjs/common';

import { ReportCenterModule } from '../report-center/report-center.module.js';
import { RuleCurationModule } from '../rule-curation/rule-curation.module.js';
import { StorageModule } from '../storage/storage.module.js';

import { BidProposalService } from './bid-proposal.service.js';
import { RfpRagService } from './rfp-rag.service.js';
import { TenderController } from './tender.controller.js';
import { TenderService } from './tender.service.js';

@Module({
  controllers: [TenderController],
  exports: [BidProposalService, TenderService],
  imports: [ReportCenterModule, RuleCurationModule, StorageModule],
  providers: [BidProposalService, RfpRagService, TenderService],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TenderModule {}
