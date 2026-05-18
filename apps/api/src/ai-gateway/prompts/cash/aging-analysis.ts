import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const cashAgingAnalysisPrompt = createConstructionPrompt({
  costCredits: 280,
  description: '应收账龄分析 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '分析工程款账龄、回款优先级、催收证据和现金流风险。',
  taskType: AiTaskType.CASH_AGING_ANALYSIS,
  title: '应收账龄分析',
});
