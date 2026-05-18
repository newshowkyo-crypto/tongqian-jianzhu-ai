import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const contractReviewBasicPrompt = createConstructionPrompt({
  costCredits: 300,
  description: '合同基础审查 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '识别施工合同付款、验收、违约、质保、担保和争议解决中的基础风险。',
  taskType: AiTaskType.CONTRACT_REVIEW_BASIC,
  title: '合同基础审查',
});
