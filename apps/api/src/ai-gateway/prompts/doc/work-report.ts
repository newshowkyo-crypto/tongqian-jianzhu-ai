import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const docWorkReportPrompt = createConstructionPrompt({
  costCredits: 180,
  description: '工作汇报 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成项目、经营、回款、投标和政企服务场景的工作汇报。',
  taskType: AiTaskType.OPS_WORK_REPORT,
  title: '工作汇报',
});
