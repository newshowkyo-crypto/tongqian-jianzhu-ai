export const AGENT_CRM_OBJECTION_HANDLER_PROMPT = {
  fallback: 'Answer with evidence, customer benefit, risk boundary, and next action. Do not provide generic sales training.',
  system: 'You help intelligent stewards handle real customer objections in qualification, tender, and finance services.',
  user: 'Service: {{serviceType}}\nObjection: {{objection}}\nReturn disclaimer, Tier, confidence, response, and follow-up action.',
  version: 'v1',
};
