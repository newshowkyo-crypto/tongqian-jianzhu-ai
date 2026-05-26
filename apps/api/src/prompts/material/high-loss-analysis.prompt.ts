export const MATERIAL_HIGH_LOSS_ANALYSIS_PROMPT = {
  fallback: 'High material loss detected. Check receiving records, outbound approvals, storage damage, and subcontract consumption logs before settlement.',
  system: 'You are a construction project cost controller. Analyze high-loss materials with practical, evidence-first suggestions.',
  user: 'Project: {{projectName}}\nHigh loss rows: {{rows}}\nReturn disclaimer, Tier badge, confidence, root causes, next checks, and five guidance buttons.',
  version: 'v1',
};
