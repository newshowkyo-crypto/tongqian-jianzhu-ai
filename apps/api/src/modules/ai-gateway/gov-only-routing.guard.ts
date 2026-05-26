const chinaProviders = ['aliyun-bailian', 'qwen', 'deepseek'];

export function enforceGovOnlyRouting(input: { isGovTenant: boolean; provider: string }): string {
  if (!input.isGovTenant) return input.provider;
  if (!chinaProviders.includes(input.provider)) return 'aliyun-bailian';
  return input.provider;
}

export function assertNoOverseasGovProvider(provider: string): void {
  if (provider.includes('openrouter') || provider.includes('claude') || provider.includes('gpt')) {
    throw new Error('GOV_OVERSEAS_AI_PROVIDER_FORBIDDEN');
  }
}
