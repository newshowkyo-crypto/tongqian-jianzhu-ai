export const intentToPlanPrompt = {
  fallback: 'Select one approved workflow template and never invent tool names.',
  templates: ['bulk_collection', 'bid_prep', 'qual_renew', 'customer_dd', 'opp_mining'],
  taskType: 'WORKFLOW_INTENT_TO_PLAN',
  user: 'Convert owner intent into ordered tool steps using the M28 tool registry. Return params, failure policy, and final summary format.',
  version: 'v1',
};
