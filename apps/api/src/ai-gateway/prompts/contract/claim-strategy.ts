import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const contractClaimStrategyPrompt = createConstructionPrompt({
  costCredits: 800,
  description: '索赔策略 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '围绕工期、变更、停窝工、材料涨价和付款延迟形成索赔证据与谈判策略。',
  taskType: AiTaskType.CONTRACT_CLAIM_STRATEGY,
  title: '索赔策略',
});
