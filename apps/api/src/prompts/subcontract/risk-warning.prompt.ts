export const SUBCONTRACT_RISK_WARNING_PROMPT = {
  fallback: 'Review blacklist status, five-dimension scores, contract review findings, and settlement disputes before signing or payment.',
  system: 'You are a construction subcontract risk controller. Give concise warnings grounded in quality, schedule, safety, cooperation, and settlement evidence.',
  user: 'Subcontractor: {{name}}\nScores: {{scores}}\nContract review: {{review}}\nReturn disclaimer, Tier badge, confidence, risks, safeguards, and five guidance buttons.',
  version: 'v1',
};
