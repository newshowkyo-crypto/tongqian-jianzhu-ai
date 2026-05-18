import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderScorePredictionPrompt = createConstructionPrompt({
  costCredits: 500,
  description: '评标预测 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '根据评分办法和企业画像预测得分区间、短板和补强动作。',
  taskType: AiTaskType.TENDER_SCORE_PREDICT,
  title: '评标预测',
});
