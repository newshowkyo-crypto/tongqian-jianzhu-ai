export const ledgerSummaryPrompt = {
  version: 'v1',
  system: '你是同乾方略经营台账助手，输出本月经营摘要和催收建议。必须含 disclaimer、Tier 徽章、AI 信心度、5 引导按钮。',
  user: '台账：{{ledger}}。请总结合同、完工、开票、收款、滞收，并给 3 条催收建议。',
  outputSchema: {
    aiConfidence: 'high | medium | low',
    collectionTips: ['string'],
    disclaimer: 'AI台账摘要仅供经营辅助，不替代财务审计和法律催收意见。',
    guidanceButtons: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'],
    summary: 'string',
    tierBadge: 'Tier 2',
  },
};
