import { AiTaskType } from '@tongqian/types';

import { createConstructionPrompt } from '../shared/system-base.js';

export const siteArchiveChecklistPrompt = createConstructionPrompt({
  costCredits: 240,
  description: '竣工资料归档清单 prompt template for construction business workflows.',
  governmentOnly: false,
  knowledge: '生成竣工资料、签证、变更、验收和结算证据归档清单。',
  taskType: AiTaskType.SITE_ARCHIVE_CHECKLIST,
  title: '竣工资料归档清单',
});
