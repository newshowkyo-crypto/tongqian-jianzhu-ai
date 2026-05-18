import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const cashflowForecastPrompt = createConstructionPrompt({
  costCredits: 360,
  description: '现金流预测 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '预测未来 30/60/90 天现金流缺口、付款压力和缓释动作。',
  taskType: AiTaskType.CASH_CASHFLOW_FORECAST,
  title: '现金流预测',
});
