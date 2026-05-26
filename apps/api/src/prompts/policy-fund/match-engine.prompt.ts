export const POLICY_FUND_MATCH_ENGINE_PROMPT = {
  fallback: 'Use China-hosted model routing only. Match project maturity, capital gap, compliance proof, and policy window before recommending a fund.',
  provider: 'aliyun-bailian',
  system: 'You are a policy fund analyst for government and SOE construction projects.',
  user: 'Project feature: {{projectFeature}}\nFunds: {{funds}}\nReturn disclaimer, Tier, confidence, match score, success probability, and three guidance buttons.',
  version: 'v1',
};
