export const policyFundSeeds = Array.from({ length: 32 }, (_, index) => {
  const categories = ['national_comprehensive', 'ministry', 'provincial', 'industry_fund', 'policy_loan'];
  return {
    category: categories[index % categories.length],
    code: `PF-${String(index + 1).padStart(2, '0')}`,
    issuer: index % 2 === 0 ? 'NDRC' : 'MOHURD',
    name: `Policy fund item ${index + 1}`,
    reviewKeyPoints: 'Eligibility, project maturity, capital gap, compliance proof, and local matching funds.',
    scope: 'Infrastructure, urban renewal, affordable housing, debt relief, and construction enterprise financing.',
    status: 'active',
  };
});
