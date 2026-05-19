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

  /**
   * Returns the next-step hint aligned with BR-321 tier boundaries.
   *
   * @param tier AI output tier.
   * @returns Required next-step hint.
   */
  nextStepHint(tier: AiOutputTier): 'apply-human-review' | 'apply-tongqian-consult' | 'mandatory-human-takeover' | 'use-directly' {
    if (tier === 4) return 'mandatory-human-takeover';
    if (tier === 3) return 'apply-tongqian-consult';
    if (tier === 2) return 'apply-human-review';
    return 'use-directly';
  }

  /**
   * Checks tier monotonicity for property-based tests and startup diagnostics.
   *
   * @param amounts Ordered project amounts.
   * @returns True when tier never decreases as amount increases.
   */
  isMonotonicForAmounts(amounts: number[]): boolean {
    let previous: AiOutputTier = 1;
    for (const amount of amounts) {
      const tier = this.resolveByBusinessRules({ amount });
      if (tier < previous) return false;
      previous = tier;
    }
    return true;
  }

  /**
   * Produces compact diagnostics for admin Prompt tests.
   *
   * @param context Tier context.
   * @returns Tier, hint, and required button count.
   */
  explain(context: TierContext): { buttons: number; hint: string; tier: AiOutputTier } {
    const tier = this.resolveByBusinessRules(context);
    return { buttons: this.requiredButtonCount(context.role), hint: this.nextStepHint(tier), tier };
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
