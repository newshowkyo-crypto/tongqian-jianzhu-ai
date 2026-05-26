export const POLICY_IMPACT_INTERPRETATION_PROMPT = {
  creditsCost: 100,
  fallback: 'Use China-hosted model routing only and explain impact without sensitive outbound data.',
  provider: 'aliyun-bailian',
  system: 'Interpret infrastructure, debt relief, special bond, and state-owned policy impacts for gov/SOE engineering offices.',
  user: 'Policy: {{policy}}\nReturn disclaimer, Tier, confidence, impact summary, action list, and evidence checklist.',
  version: 'v1',
};
