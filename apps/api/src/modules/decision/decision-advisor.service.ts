import { Injectable } from '@nestjs/common';

@Injectable()
export class DecisionAdvisorService {
  advise(tenderId: string, tenantId: string): Record<string, unknown> {
    const score = 76;
    return {
      confidence: 'medium',
      disclaimer: 'AI advice is for business reference. The owner keeps final decision authority.',
      guidanceButtons: ['Execute myself', 'Apply steward', 'Apply Tongqian consulting', 'Manual review', 'Expert consult'],
      recommendation: score >= 80 ? 'usually_bid' : score >= 60 ? 'review_before_bid' : 'usually_skip_or_partner',
      score,
      tenderId,
      tenantId,
      tierBadge: 3,
      dimensions: {
        cashflow: 68,
        competition: 62,
        qualification: 88,
        roi: 74,
        schedule: 80,
      },
    };
  }
}
