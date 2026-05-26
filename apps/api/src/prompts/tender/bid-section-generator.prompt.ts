export const bidSectionGeneratorPrompt = {
  fallback: 'Never claim guaranteed winning. Use only verified company evidence and mark gaps.',
  fewShots: [
    { name: 'technical method', input: 'High technical score item', output: 'Write method, resource plan, proof, and review note.' },
    { name: 'business response', input: 'Payment clause', output: 'Respond with compliant terms and cashflow warning.' },
    { name: 'performance evidence', input: 'Similar project required', output: 'Pull database evidence, otherwise mark missing.' },
    { name: 'schedule plan', input: 'Tight delivery', output: 'Offer phased plan and risk buffer.' },
    { name: 'quality assurance', input: 'Acceptance standard', output: 'Map GB standard and inspection records.' },
  ],
  redLines: ['Do not promise guaranteed win', 'Do not fabricate company performance', '禁绝对化，不许写必中或保证中标'],
  taskType: 'BID_SECTION_GENERATOR',
  user: 'Generate one bid section from scoring criteria, RFP RAG hits, company evidence, and quality check output.',
  version: 'v1',
};
