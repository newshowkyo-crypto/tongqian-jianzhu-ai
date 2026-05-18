import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const contractReviewProPrompt = createConstructionPrompt({
  costCredits: 1500,
  description: '合同深度审查 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '对复杂建筑合同做深度风险审查，覆盖无限担保、付款拖延、索赔障碍和证据链。',
  taskType: AiTaskType.CONTRACT_REVIEW_PRO,
  title: '合同深度审查',
});
