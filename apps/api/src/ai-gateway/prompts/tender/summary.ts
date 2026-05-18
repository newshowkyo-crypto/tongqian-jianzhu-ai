import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const tenderSummaryPrompt = createConstructionPrompt({
  costCredits: 240,
  description: '招标速读 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '快速提炼招标公告、资格条件、评分办法、风险条款和投标时间表。',
  taskType: AiTaskType.TENDER_SUMMARY,
  title: '招标速读',
});
