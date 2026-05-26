export function scanFinOpportunities(): Array<{ eventType: string; summary: string }> {
  return ['bank_credit_window', 'psl_lpr', 'abs_reits', 'guarantee_credit', 'operation_anomaly'].map((eventType) => ({ eventType, summary: `FIN opportunity from ${eventType}` }));
}
