export class CustomerBindingService {
  bind(input: { agentId: string; customerTenantId: string; referralCode: string }): Record<string, unknown> {
    return { ...input, bindSourceType: 'referral_link', isPermanent: true };
  }

  createCommission(input: { amount: number; sourceType: string }): Record<string, unknown> {
    const rate = input.sourceType === 'subscription' ? 0.15 : 0.3;
    return { commissionAmount: input.amount * rate, commissionRate: rate, frozenUntilDays: [7, 30, 45], statusFlow: ['frozen', 'settlable', 'withdrawable', 'paid'] };
  }
}
