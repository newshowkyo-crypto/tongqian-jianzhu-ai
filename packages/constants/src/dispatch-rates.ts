export const DEFAULT_DISPATCH_RATES = {
  crossDomainIntroducerRate: 0.05,
  crossDomainServiceProviderRate: 0.95,
  standardPlatformTakeRate: 0,
} as const;

export function seedSystemConfigs() {
  return [
    {
      key: 'dispatch.cross_domain_fee',
      value: DEFAULT_DISPATCH_RATES,
      description: 'Default dispatch split rates.',
      isOverridable: true,
    },
  ] as const;
}
