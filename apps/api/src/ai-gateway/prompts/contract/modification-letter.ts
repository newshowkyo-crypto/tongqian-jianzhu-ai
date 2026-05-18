import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const contractModificationLetterPrompt = createConstructionPrompt({
  costCredits: 500,
  description: '修改建议函 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '把合同风险转化为可发给对方的克制修改建议函和替代表述。',
  taskType: AiTaskType.CONTRACT_MODIFICATION_LETTER,
  title: '修改建议函',
});
