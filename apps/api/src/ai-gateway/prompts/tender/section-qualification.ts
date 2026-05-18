import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderSectionQualificationPrompt = createConstructionPrompt({
  costCredits: 520,
  description: '资格标章节生成 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '整理资质、业绩、人员、信用、财务和证明材料清单。',
  taskType: AiTaskType.TENDER_SECTION_QUALIFICATION,
  title: '资格标章节生成',
});
