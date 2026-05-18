import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const chatKpiQueryPrompt = createConstructionPrompt({
  costCredits: 180,
  description: '内部数据问答 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '结合平台 KPI、回款、项目、点数、机会、风险红灯和订阅数据回答经营问题。',
  taskType: AiTaskType.CHAT_KPI_QUERY,
  title: '内部数据问答',
});
