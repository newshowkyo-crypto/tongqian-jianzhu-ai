export class TenderProposalDraftService {
  readonly reuse = 'M28 RFP RAG via RfpRagService and tool-registry';

  draft(tenderFileUrl: string): Record<string, unknown> {
    return { chapterDrafts: [{ chapter: 'technical response', content: 'drafted from RFP evidence', status: 'draft' }], creditsCost: 1200, progressPct: 35, scoringPoints: [], tenderFileUrl };
  }
}
