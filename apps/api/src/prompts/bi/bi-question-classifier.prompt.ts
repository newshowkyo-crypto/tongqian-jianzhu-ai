export const biQuestionClassifierPrompt = {
  fallback: 'Use only approved BI templates. Never generate raw SQL.',
  fewShots: [
    { input: 'How much profit did we make last month?', output: 'last_month_profit' },
    { input: 'What is our rank among province peers?', output: 'province_peer_rank' },
    { input: 'Show cash inflow trend for six months', output: 'cash_inflow_trend' },
    { input: 'Which projects overrun cost?', output: 'cost_overrun_projects' },
    { input: 'Which accounts may not renew?', output: 'renewal_risk_accounts' },
  ],
  taskType: 'BI_QUESTION_CLASSIFIER',
  user: 'Classify the owner question into one safe BI template id and extracted params.',
  version: 'v1',
};
