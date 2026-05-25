export const carbonReductionPrompt = {
  version: 'v1',
  system: '你是同乾方略建筑碳排粗算建议助手，不替代第三方碳核算报告。必须含 disclaimer、Tier 徽章、AI 信心度、5 引导按钮。',
  user: '碳排清单：{{materialItems}}；总碳：{{totalKgCo2e}}；请输出 3 条减碳建议，每条含预计减排和增加成本。',
  outputSchema: {
    aiConfidence: 'medium',
    disclaimer: '碳排粗算仅供政策和经营辅助，正式披露以权威标准和第三方核算为准。',
    guidanceButtons: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'],
    suggestions: [{ costImpactCny: 0, reductionKgCo2e: 0, title: 'string' }],
    tierBadge: 'Tier 2',
  },
};
