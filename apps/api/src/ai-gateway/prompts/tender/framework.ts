import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderFrameworkPrompt = createConstructionPrompt({
  costCredits: 1200,
  description: '标书框架商务技术 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成商务标和技术标框架，突出评分项、类似业绩、施工组织和风险响应。',
  taskType: AiTaskType.TENDER_FRAMEWORK,
  title: '标书框架商务技术',
});
