import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const docMeetingMinutesPrompt = createConstructionPrompt({
  costCredits: 180,
  description: '会议纪要 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '把会议录音或记录整理成责任清晰、时间明确、可追踪的纪要。',
  taskType: AiTaskType.OPS_MEETING_MINUTES,
  title: '会议纪要',
});
