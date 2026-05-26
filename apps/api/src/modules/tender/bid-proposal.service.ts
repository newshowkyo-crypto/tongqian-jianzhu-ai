import { Inject, Injectable } from '@nestjs/common';

import { QualityCheckService } from '../report-center/quality-check.service.js';
import { ReportExportService } from '../report-center/report-export.service.js';

import { RfpRagService } from './rfp-rag.service.js';

type BidProposalView = {
  confidence: 'medium';
  disclaimer: string;
  exportFormat?: 'docx';
  guidanceButtons: string[];
  id: string;
  sections: Array<{ content: string; key: string; title: string }>;
  tenderId: string;
  tierBadge: 3;
};

@Injectable()
export class BidProposalService {
  constructor(
    @Inject(RfpRagService) private readonly rfpRag: RfpRagService,
    @Inject(QualityCheckService) private readonly qualityCheck: QualityCheckService,
    @Inject(ReportExportService) private readonly reportExport: ReportExportService,
  ) {}

  create(tenderId: string, tenantId: string): BidProposalView {
    const clauses = this.rfpRag.keyClauses(tenderId);
    const sections = ['business-response', 'technical-method', 'risk-control', 'schedule-plan', 'service-commitment'].map((key) => ({
      content: `Draft ${key} from scoring criteria, company evidence database, and ${clauses.length} RFP clauses for tenant ${tenantId}.`,
      key,
      title: key.replaceAll('-', ' '),
    }));
    const report = { confidence: 'medium', disclaimer: 'Owner must verify before submission.', guidanceButtons: this.ownerButtons(), sections, tier: 3 };
    const quality = this.qualityCheck.check(report);
    return {
      confidence: 'medium',
      disclaimer: quality.passed ? 'AI draft requires final legal and tender team review.' : `Review issues: ${quality.qualityIssues.join(',')}`,
      guidanceButtons: this.ownerButtons(),
      id: crypto.randomUUID(),
      sections,
      tenderId,
      tierBadge: 3,
    };
  }

  exportDocx(proposalId: string): { bytes: number; format: 'docx'; proposalId: string } {
    const docx = this.reportExport.export(proposalId, 'docx');
    return { bytes: docx.buffer.length, format: docx.format as 'docx', proposalId };
  }

  private ownerButtons(): string[] {
    return ['Execute myself', 'Apply steward', 'Apply Tongqian consulting', 'Manual review', 'Expert consult'];
  }
}
