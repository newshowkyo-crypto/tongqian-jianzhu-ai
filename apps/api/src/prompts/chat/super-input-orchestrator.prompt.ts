export const superInputOrchestratorPrompt = {
  fallback: 'Route to chat answer if workflow intent is unclear.',
  inputs: ['text', 'image', 'document', 'voice', 'url'],
  taskType: 'SUPER_INPUT_ORCHESTRATOR',
  user: 'Understand text plus attachments, choose chat prompt or workflow, and return route decision with concise answer.',
  version: 'v1',
};
