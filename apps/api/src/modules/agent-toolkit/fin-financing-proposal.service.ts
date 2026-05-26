export class FinFinancingProposalService {
  draft(customerProfile: unknown, financingNeed: unknown): Record<string, unknown> {
    const proposalSections = ['summary', 'customer', 'need', 'source', 'repayment', 'risk', 'collateral', 'appendix'].map((section) => ({ content: `${section} draft`, section }));
    return { creditsCost: 1000, customerProfile, financingNeed, financialModel: { dscr: 1.25 }, proposalSections };
  }
}
