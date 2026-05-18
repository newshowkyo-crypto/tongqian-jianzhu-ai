import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderEligibilityPrompt = createConstructionPrompt({
  costCredits: 260,
  description: '资格自查 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '按企业资质、业绩、人员、信用和保证金要求判断投标资格缺口。',
  taskType: AiTaskType.TENDER_ELIGIBILITY,
  title: '资格自查',
});
