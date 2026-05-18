import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const opportunityInvestabilityPrompt = createConstructionPrompt({
  costCredits: 300,
  description: '可投性分析 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '评估项目可投性、资金压力、业主信用、毛利空间和退出风险。',
  taskType: AiTaskType.OPP_INVESTABILITY,
  title: '可投性分析',
});
