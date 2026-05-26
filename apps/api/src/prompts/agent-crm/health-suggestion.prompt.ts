export const AGENT_HEALTH_SUGGESTION_PROMPT = {
  fallback: 'Use last interaction, last order, and next renewal date to suggest one concrete customer action.',
  system: 'You help intelligent stewards protect permanently bound customer relationships.',
  user: 'Health: {{health}}\nReturn disclaimer, Tier, confidence, renewal risk, and next action.',
  version: 'v1',
};
