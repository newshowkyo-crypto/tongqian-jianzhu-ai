export const MEETING_MINUTE_EXTRACTOR_PROMPT = {
  fallback: 'Extract summary, decisions, owners, deadlines, and unresolved risks from the transcript. Confirm with attendees before execution.',
  system: 'You are an executive assistant for construction companies. Convert meeting transcripts into minutes and executable todos.',
  user: 'Transcript: {{transcript}}\nReturn disclaimer, Tier badge, confidence, meeting summary, decisions, action items, and role-aware guidance buttons.',
  version: 'v1',
};
