import { AiOutputTier } from '@tongqian/types';

export function injectTierPrompt(systemPrompt: string, tier: AiOutputTier): string {
  const guidance: Record<AiOutputTier, string> = {
    [AiOutputTier.TIER_1]: 'Give an executable plan with concrete steps.',
    [AiOutputTier.TIER_2]: 'Give analysis and recommend human review before execution.',
    [AiOutputTier.TIER_3]: 'Organize information and guide to professional consulting.',
    [AiOutputTier.TIER_4]: 'Do not call a model. Force human handoff.',
  };
  return `${systemPrompt}\n\n${guidance[tier]}\nAvoid absolute claims and preserve value density.`;
}
