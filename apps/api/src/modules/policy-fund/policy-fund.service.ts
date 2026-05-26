import { Injectable } from '@nestjs/common';

interface MatchInput {
  projectFeature: Record<string, unknown>;
  tenantId: string;
  userId: string;
}

const policyFundSeeds = Array.from({ length: 32 }, (_, index) => {
  const categories = ['national_comprehensive', 'ministry', 'provincial', 'industry_fund', 'policy_loan'];
  return {
    category: categories[index % categories.length],
    code: `PF-${String(index + 1).padStart(2, '0')}`,
    name: `Policy fund item ${index + 1}`,
    status: 'active',
  };
});

@Injectable()
export class PolicyFundService {
  listFunds(category?: string): typeof policyFundSeeds {
    return category ? policyFundSeeds.filter((fund) => fund.category === category) : policyFundSeeds;
  }

  computeMatch(input: MatchInput): Array<{ applyPath: string[]; code: string; matchScore: number; successProbability: number }> {
    return this.matchEngine(input).slice(0, 6);
  }

  matchEngine(input: MatchInput): Array<{ applyPath: string[]; code: string; matchScore: number; successProbability: number }> {
    const text = JSON.stringify(input.projectFeature).toLowerCase();
    return policyFundSeeds.map((fund, index) => {
      const base = text.includes('infrastructure') || text.includes('renewal') ? 78 : 62;
      return { applyPath: ['eligibility check', 'material pack', 'department submission', 'result follow-up'], code: fund.code, matchScore: Math.min(96, base + (index % 9)), successProbability: Math.min(88, base - 8 + (index % 7)) };
    });
  }

  subscribe(userId: string, fundId: string): { fundId: string; notifyChannels: string[]; userId: string } {
    return { fundId, notifyChannels: ['station', 'sms', 'wechat', 'email'], userId };
  }

  remind(): Array<{ code: string; daysBeforeDeadline: number[]; message: string }> {
    return policyFundSeeds.slice(0, 8).map((fund) => ({ code: fund.code, daysBeforeDeadline: [30, 14, 7, 1], message: 'Policy fund window reminder' }));
  }
}
