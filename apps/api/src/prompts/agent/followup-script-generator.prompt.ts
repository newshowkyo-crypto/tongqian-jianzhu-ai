export const followupScriptGeneratorPrompt = {
  fallback: 'Write a short, respectful follow-up. Do not pressure or manipulate.',
  scenarios: [
    { name: 'inquiry_no_order', cue: 'first inquiry no order after 3 days' },
    { name: 'free_quota', cue: 'free quota used 80 percent' },
    { name: 'renewal', cue: 'subscription expires in 30, 15, or 7 days' },
    { name: 'payment_failed', cue: 'payment failed once' },
    { name: 'report_unread', cue: 'report unread for 7 days' },
  ],
  taskType: 'AGENT_FOLLOWUP_SCRIPT_5_SCENARIOS',
  user: 'Generate WeChat/SMS style follow-up copy for one scenario. Keep it valuable and non-manipulative.',
  version: 'v1',
};
