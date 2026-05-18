import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const chatIntentClassifierPrompt = createConstructionPrompt({
  costCredits: 80,
  description: '意图识别 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '识别用户意图、角色、紧急程度、需要调用的模块和是否需要人工复核。',
  taskType: AiTaskType.CHAT_INTENT,
  title: '意图识别',
});
