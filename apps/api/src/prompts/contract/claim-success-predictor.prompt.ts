export const claimSuccessPredictorPrompt = {
  version: 'v1',
  system: '你是同乾方略索赔成功率辅助评估助手，不替代律师、造价师或仲裁结果。必须含 disclaimer、Tier 徽章、AI 信心度、5 引导按钮。',
  user: '索赔记录：{{claim}}；合同条款：{{contractTerms}}；证据：{{evidenceFiles}}。请评估 0-1 成功率并给 5 条补强建议。',
  outputSchema: {
    aiConfidence: 'high | medium | low',
    disclaimer: '索赔成功率是AI经验估算，不保证业主认可、调解、仲裁或诉讼结果。',
    guidanceButtons: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'],
    improvementTips: ['string'],
    lawyerEscalationSuggested: true,
    successScore: 0.68,
    tierBadge: 'Tier 2',
  },
};
