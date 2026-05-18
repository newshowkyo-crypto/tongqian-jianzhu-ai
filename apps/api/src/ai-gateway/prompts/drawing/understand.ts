import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const drawingUnderstandPrompt = createConstructionPrompt({
  costCredits: 420,
  description: '图纸理解 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '解释图纸关键构件、工程范围、疑问点、碰撞风险和算量提示。',
  taskType: AiTaskType.DRAWING_UNDERSTAND,
  title: '图纸理解',
});
