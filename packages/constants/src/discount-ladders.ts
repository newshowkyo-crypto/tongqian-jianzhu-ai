export const DEFAULT_DISCOUNT_LADDERS = [
  { kind: 'consecutive_months', minMonths: 1, maxMonths: 3, discountRate: 1 },
  { kind: 'prepaid_months', months: 6, discountRate: 0.88 },
  { kind: 'prepaid_months', months: 12, discountRate: 0.8 },
  { kind: 'prepaid_months', months: 24, discountRate: 0.75 },
] as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'subscription.discount_ladders',
      value: DEFAULT_DISCOUNT_LADDERS,
      description: 'Subscription ladder discount defaults.',
      isOverridable: true,
    },
  ] as const;
}
