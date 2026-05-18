import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const chatGeneralPrompt = createConstructionPrompt({
  costCredits: 120,
  description: 'AI 老板助理通用 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '围绕老板日常经营问答、待办拆解、风险提示、跨模块导航和下一步动作给出简洁建议。',
  taskType: AiTaskType.CHAT_LONG,
  title: 'AI 老板助理通用',
});
