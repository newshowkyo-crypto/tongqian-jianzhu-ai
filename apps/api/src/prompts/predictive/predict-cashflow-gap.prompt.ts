export const predictCashflowGapPrompt = {
  fallback: 'If data is incomplete, lower confidence and ask for manual cashflow review.',
  redLines: ['Do not say必然', 'Do not say一定', 'Never promise exact future cash position'],
  taskType: 'PREDICT_CASHFLOW_GAP',
  user: 'Predict possible cashflow gap for 7d, 14d, 21d, 30d using receivables, payables, project progress, and financing capacity.',
  version: 'v1',
};
