import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const qualificationUpgradePathPrompt = createConstructionPrompt({
  costCredits: 900,
  description: '资质升级路径 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '规划资质升级路径、人员补齐、业绩准备、材料窗口和时间成本。',
  taskType: AiTaskType.QUAL_UPGRADE_PATH,
  title: '资质升级路径',
});
