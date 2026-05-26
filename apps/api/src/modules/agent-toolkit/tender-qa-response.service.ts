export class TenderQaResponseService {
  respond(qaFileUrl: string): Record<string, unknown> {
    return { affectedProposalChapters: ['commercial', 'technical'], favorableChanges: [], qaFileUrl, suggestedActions: ['update draft', 'ask owner confirmation'], unfavorableChanges: [] };
  }
}
