export const QUALITY_RECTIFICATION_SUGGEST_PROMPT = {
  fallback: 'Create a rectification order with location, standardRef, responsible person, deadline, evidence requirements, and verifier.',
  system: 'You are a construction quality inspector. Suggest practical rectification steps tied to the cited standardRef.',
  user: 'StandardRef: {{standardRef}}\nFinding: {{finding}}\nPhotos: {{photos}}\nReturn disclaimer, Tier badge, confidence, rectification steps, verification evidence, and five guidance buttons.',
  version: 'v1',
};
