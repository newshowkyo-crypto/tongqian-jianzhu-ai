export const regulationQuickQueryPrompt = {
  fallback: '找不到条文时，说明未命中本地法规库，并建议上传正式文件或人工复核。',
  fewShots: [
    { name: 'quality acceptance', query: '混凝土验收看哪个 GB', answer: '优先检索 GB50204 和 GB50300。' },
    { name: 'fire safety', query: '施工现场消防怎么查', answer: '优先检索 GB50720 和 GB50016。' },
    { name: 'bill pricing', query: '清单计价依据', answer: '优先检索 GB50500。' },
    { name: 'seismic design', query: '抗震设防依据', answer: '优先检索 GB50011。' },
  ],
  taskType: 'REGULATION_QUICK_QUERY',
  user: '根据用户问题检索本地法规元数据，输出命中文件、适用场景、风险提示和复核动作。',
  version: 'v1',
};
