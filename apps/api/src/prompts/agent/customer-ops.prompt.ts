export const customerOpsPrompt = {
  fallback: 'Generate practical copy that creates value and avoids pressure.',
  fewShots: [
    { type: 'moments', input: 'Share policy opportunity', output: 'Short professional post with one actionable insight.' },
    { type: 'holiday', input: 'Mid-autumn greeting', output: 'Warm greeting plus one useful business reminder.' },
    { type: 'followUp', input: 'Customer asked about cashflow', output: 'Follow up with report value and next action.' },
    { type: 'renewal', input: 'Subscription expires soon', output: 'Renewal reminder tied to saved time and risk control.' },
  ],
  taskType: 'AGENT_CUSTOMER_OPS_4_TYPES',
  user: 'Generate customer operation copy for moments, holiday, followUp, or renewal.',
  version: 'v1',
};
