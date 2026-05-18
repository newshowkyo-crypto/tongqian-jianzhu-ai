import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const qualificationCheckupPrompt = createConstructionPrompt({
  costCredits: 300,
  description: '资质体检 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '检查企业资质、人员证书、业绩、社保、设备和信用动态风险。',
  taskType: AiTaskType.QUAL_CHECKUP,
  title: '资质体检',
});
