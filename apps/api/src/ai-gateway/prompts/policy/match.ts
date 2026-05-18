import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const policyMatchPrompt = createConstructionPrompt({
  costCredits: 1000,
  description: '政策资金匹配 prompt template for construction business workflows.',
  governmentOnly: true,
  knowledge: '匹配政策资金窗口、申报条件、材料缺口、时间节点和落地路径。',
  taskType: AiTaskType.GOV_POLICY_IMPACT,
  title: '政策资金匹配',
});
