import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const policyImpactAnalysisPrompt = createConstructionPrompt({
  costCredits: 420,
  description: '政策影响分析 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '分析政策对建筑企业经营、资质、现金流、招投标和项目机会的影响。',
  taskType: AiTaskType.OPS_POLICY_IMPACT,
  title: '政策影响分析',
});
