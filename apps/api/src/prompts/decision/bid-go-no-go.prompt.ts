export const bidGoNoGoPrompt = {
  fallback: 'Give cautious options only. The owner makes the final decision.',
  fewShots: [
    { name: 'high fit', input: 'Strong qualification and healthy cashflow', output: 'Usually worth bidding, keep margin guardrail.' },
    { name: 'cash pressure', input: 'Good score but slow payment owner', output: 'Suggest review cashflow and payment guarantees first.' },
    { name: 'weak evidence', input: 'Missing similar performance', output: 'Suggest manual review and partner evidence option.' },
    { name: 'high competition', input: 'Many same-province peers', output: 'Suggest bid only with differentiated method and cost cap.' },
    { name: 'schedule risk', input: 'Tight delivery and current load high', output: 'Suggest cautious bid or negotiate schedule buffer.' },
  ],
  redLines: ['Never say must bid', 'Never say do not bid as an order', 'Final decision remains with the owner'],
  taskType: 'BID_GO_NO_GO',
  user: 'Score feasibility, ROI, risk, competition, and Tongqian stance. Output bid/review/cautious recommendation with Tier 2-3.',
  version: 'v1',
};
