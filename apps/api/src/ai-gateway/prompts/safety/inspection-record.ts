import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const safetyInspectionRecordPrompt = createConstructionPrompt({
  costCredits: 260,
  description: '安全检查记录 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成现场安全检查记录、隐患分级、整改责任和复查闭环。',
  taskType: AiTaskType.SITE_MAJOR_HAZARD,
  title: '安全检查记录',
});
