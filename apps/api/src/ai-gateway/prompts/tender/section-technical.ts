import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderSectionTechnicalPrompt = createConstructionPrompt({
  costCredits: 700,
  description: '技术标章节生成 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成施工部署、进度、质量、安全、环保和重难点响应章节框架。',
  taskType: AiTaskType.TENDER_SECTION_TECHNICAL,
  title: '技术标章节生成',
});
