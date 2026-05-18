import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const docReminderLetterPrompt = createConstructionPrompt({
  costCredits: 220,
  description: '催款函 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成克制、有证据、有台阶的工程款催收函和沟通要点。',
  taskType: AiTaskType.OPS_REMINDER_LETTER,
  title: '催款函',
});
