export function scanTenderOpportunities(): Array<{ eventType: string; summary: string }> {
  return ['province_tender', 'major_project', 'special_bond_project', 'lost_bid_company', 'qualification_change'].map((eventType) => ({ eventType, summary: `TENDER opportunity from ${eventType}` }));
}
