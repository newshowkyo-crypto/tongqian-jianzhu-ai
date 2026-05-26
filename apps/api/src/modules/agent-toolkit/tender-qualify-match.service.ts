export class TenderQualifyMatchService {
  compare(tenderFileUrl: string): Record<string, unknown> {
    return { customerMatchResult: { gaps: [], pass: true }, extractedCriteria: { financial: [], performance: [], personnel: [], threshold: [] }, tenderFileUrl };
  }
}
