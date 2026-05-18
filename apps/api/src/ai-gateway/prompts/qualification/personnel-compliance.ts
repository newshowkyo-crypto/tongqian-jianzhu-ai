import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const qualificationPersonnelCompliancePrompt = createConstructionPrompt({
  costCredits: 360,
  description: '人员合规 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '核验建造师、职称、技工、三类人员和社保一致性风险。',
  taskType: AiTaskType.QUAL_DYNAMIC_REVIEW,
  title: '人员合规',
});
