export function scanQualOpportunities(): Array<{ eventType: string; summary: string }> {
  return ['qualification_status', 'dynamic_check', 'registered_architect', 'certificate_expiry', 'failed_notice'].map((eventType) => ({ eventType, summary: `QUAL opportunity from ${eventType}` }));
}
