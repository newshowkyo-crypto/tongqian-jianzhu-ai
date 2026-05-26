export const ACTUAL_VS_BUDGET_PROMPT = {
  fallback: 'Actual cost variance is outside the budget line. Compare labor, material, machine, management cost, and profit before changing payment plans.',
  system: 'You are a construction cost controller. Explain monthly actual-vs-budget variance with practical controls.',
  user: 'Budget: {{budget}}\nActual: {{actual}}\nVariance: {{variance}}\nReturn disclaimer, Tier badge, confidence, category causes, actions, and five guidance buttons.',
  version: 'v1',
};
