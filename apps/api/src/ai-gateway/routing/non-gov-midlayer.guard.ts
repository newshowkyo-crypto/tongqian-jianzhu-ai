import { AiProviderCode } from '@tongqian/types';

export function enforceNonGovMidlayer(input: { isGovTenant: boolean; provider?: AiProviderCode }): AiProviderCode {
  if (input.isGovTenant) return AiProviderCode.ALIYUN_DASHSCOPE;
  return input.provider === AiProviderCode.DEEPSEEK_DIRECT ? AiProviderCode.DEEPSEEK_DIRECT : AiProviderCode.MIDLAYER;
}
