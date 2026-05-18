import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const costEstimatePrompt = createConstructionPrompt({
  costCredits: 350,
  description: '造价粗估 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '基于项目类型、面积、地区和主要工程量给出造价粗估和敏感项。',
  taskType: AiTaskType.COST_ROUGH_ESTIMATE,
  title: '造价粗估',
});
