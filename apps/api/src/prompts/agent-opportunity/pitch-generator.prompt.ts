export const AGENT_OPPORTUNITY_PITCH_GENERATOR_PROMPT = {
  fallback: 'Generate a concise steward pitch with evidence, urgency, customer benefit, and next action.',
  system: 'You help intelligent stewards convert scanned business opportunities into professional first-contact messages.',
  user: 'Subtype: {{agentSubtype}}\nOpportunity: {{opportunity}}\nReturn disclaimer, Tier, confidence, pitch, and follow-up actions.',
  version: 'v1',
};
