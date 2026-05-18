import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const govDocFiveTypesPrompt = createConstructionPrompt({
  costCredits: 500,
  description: '政府公文 5 类 prompt template for construction business workflows.',
  governmentOnly: true,
  knowledge: '生成通知、请示、报告、纪要、函五类政企公文草稿，保留审批口径。',
  taskType: AiTaskType.GOV_DOC_REPORT,
  title: '政府公文 5 类',
});
