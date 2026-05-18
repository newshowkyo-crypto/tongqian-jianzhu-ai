import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const opportunityOwnerVerifyPrompt = createConstructionPrompt({
  costCredits: 220,
  description: '业主核验 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '核验业主真实性、付款能力、项目来源、授权链路和商务接触边界。',
  taskType: AiTaskType.OPP_AUTHENTICITY,
  title: '业主核验',
});
