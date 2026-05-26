export const bidScoringExtractorPrompt = {
  fallback: 'If scoring evidence is missing, return unknown items for manual review.',
  taskType: 'BID_SCORING_EXTRACTOR',
  user: 'Extract scoring criteria, mandatory clauses, disqualification risks, and evidence requirements from the RFP.',
  version: 'v1',
};
