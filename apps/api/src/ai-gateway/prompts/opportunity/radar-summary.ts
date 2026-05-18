import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const opportunityRadarSummaryPrompt = createConstructionPrompt({
  costCredits: 180,
  description: '机会推送速读 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '压缩机会雷达结果，指出匹配原因、竞争强度、行动窗口和证据缺口。',
  taskType: AiTaskType.OPP_PEER_RADAR,
  title: '机会推送速读',
});
