import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderRiskPrompt = createConstructionPrompt({
  costCredits: 360,
  description: '投标风险审查 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '识别招标文件中的废标、围标嫌疑、异常资质、付款和履约风险。',
  taskType: AiTaskType.TENDER_RISK,
  title: '投标风险审查',
});
