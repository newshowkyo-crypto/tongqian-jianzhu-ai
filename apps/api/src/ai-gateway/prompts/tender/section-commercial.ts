import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderSectionCommercialPrompt = createConstructionPrompt({
  costCredits: 650,
  description: '商务标章节生成 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成报价说明、偏差表、合同响应、企业实力和商务承诺章节框架。',
  taskType: AiTaskType.TENDER_SECTION_COMMERCIAL,
  title: '商务标章节生成',
});
