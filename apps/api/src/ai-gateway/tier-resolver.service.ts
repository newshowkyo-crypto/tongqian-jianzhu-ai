import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import type { AiOutputTier, PromptTemplate, TierContext } from '@tongqian/types';

@Injectable()
export class TierResolverService {
  /**
   * Resolves the output tier by combining prompt-specific logic with BR-321 guardrails.
   *
   * @param template Prompt template.
   * @param context Amount, role, urgency, and legal risk context.
   * @returns Tier 1-4.
   */
  resolve(template: PromptTemplate, context: TierContext): AiOutputTier {
    this.assertContext(context);
    const defaultTier = this.resolveByBusinessRules(context);
    const promptTier = template.tier(context);
    return Math.max(defaultTier, promptTier) as AiOutputTier;
  }

  /**
   * Resolves BR-321 without a prompt template for routing previews and tests.
   *
   * @param context Tier context.
   * @returns Tier 1-4.
   */
  resolveByBusinessRules(context: TierContext): AiOutputTier {
    this.assertContext(context);
    if (context.hasLegalRisk) return 4;
    const amount = context.amount ?? 0;
    if (amount >= 50_000_000) return 3;
    if (amount >= 10_000_000) return 2;
    return 1;
  }

  /**
   * Builds the role-specific next-step count expected by required output elements.
   *
   * @param role User role.
   * @returns Required button count for the role.
   */
  requiredButtonCount(role: string | undefined): number {
    if (role === 'agent') return 3;
    if (role === 'gov') return 3;
    if (role === 'employee') return 2;
    return 5;
  }

  private assertContext(context: TierContext): void {
    if (context.amount !== undefined && context.amount < 0) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { amount: context.amount },
        message: 'AI tier context amount cannot be negative.',
      });
    }
  }
}
