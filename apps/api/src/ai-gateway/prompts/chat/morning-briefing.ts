import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const morningBriefingPrompt = createConstructionPrompt({
  costCredits: 260,
  description: '早安 AI 简报 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成老板早安简报，覆盖今日机会、风险红灯、审批、现金流、点数和建议动作。',
  taskType: AiTaskType.CHAT_SHORT,
  title: '早安 AI 简报',
});
