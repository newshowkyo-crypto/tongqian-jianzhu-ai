import { Injectable } from '@nestjs/common';

const levels = ['central', 'provincial', 'city', 'county'];
const topics = ['infrastructure', 'debt_relief', 'special_bond', 'state_owned'];

@Injectable()
export class PolicyLearningService {
  list(): Array<{ level: string; title: string; topic: string }> {
    return levels.flatMap((level) => topics.map((topic) => ({ level, title: `${level} ${topic} policy`, topic })));
  }

  interpretImpact(policyDocId: string, tenantId: string): { aiConfidence: string; creditsCost: number; impactSummary: string; policyDocId: string; provider: string; tenantId: string } {
    return { aiConfidence: 'medium', creditsCost: 100, impactSummary: 'China-hosted model interpretation for policy impact, tasks, risks, and evidence.', policyDocId, provider: 'aliyun-bailian', tenantId };
  }
}
