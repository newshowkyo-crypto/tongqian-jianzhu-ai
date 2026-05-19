import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import type { AiTaskType } from '@tongqian/types';

export interface CostCapInput {
  readonly creditsToCharge: number;
  readonly projectedDailyCostRmb: number;
  readonly taskType: AiTaskType | string;
  readonly tenantId: string;
  readonly traceId: string;
  readonly userId: string;
}

export interface CostCapDecision {
  readonly action: 'allow' | 'downgrade' | 'review';
  readonly audit: {
    readonly action: string;
    readonly resource: string;
    readonly tenantId: string;
    readonly traceId: string;
    readonly userId: string;
  };
  readonly message: string;
  readonly projectedDailyCostRmb: number;
}

const USER_DAILY_DOWNGRADE_RMB = 10;
const TENANT_MONTHLY_REVIEW_RMB = 1_000;
const MIN_CREDITS = 1;

@Injectable()
export class CostCapEnforcerService {
  /**
   * Evaluates BR-904 for a single AI call before provider invocation.
   *
   * @param input Cost projection with tenant/user/trace context.
   * @returns Allow, downgrade, or review decision.
   */
  evaluate(input: CostCapInput): CostCapDecision {
    this.assertContext(input);
    const action = this.resolveAction(input.projectedDailyCostRmb);
    return {
      action,
      audit: {
        action: `AI_COST_CAP_${action.toUpperCase()}`,
        resource: String(input.taskType),
        tenantId: input.tenantId,
        traceId: input.traceId,
        userId: input.userId,
      },
      message: this.resolveMessage(action),
      projectedDailyCostRmb: input.projectedDailyCostRmb,
    };
  }

  /**
   * Keeps compatibility with the original boolean downgrade hook.
   *
   * @param projectedDailyCostRmb Projected user daily AI cost in RMB.
   * @returns True when the request should fall back to `deepseek-chat`.
   */
  shouldDowngrade(projectedDailyCostRmb: number): boolean {
    return projectedDailyCostRmb >= USER_DAILY_DOWNGRADE_RMB;
  }

  /**
   * Calculates RMB estimate from token usage for OpenAI-compatible providers.
   *
   * @param usage Input/output token counts.
   * @returns Conservative RMB estimate for redline checks.
   */
  estimateRmb(usage: { inputTokens: number; outputTokens: number }): number {
    const inputCost = Math.max(0, usage.inputTokens) * 0.000001;
    const outputCost = Math.max(0, usage.outputTokens) * 0.000002;
    return Number((inputCost + outputCost).toFixed(6));
  }

  private assertContext(input: CostCapInput): void {
    if (!input.tenantId || !input.userId || !input.traceId || input.creditsToCharge < MIN_CREDITS) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: {
          creditsToCharge: input.creditsToCharge,
          hasTenantId: Boolean(input.tenantId),
          hasTraceId: Boolean(input.traceId),
          hasUserId: Boolean(input.userId),
        },
        message: 'AI cost cap requires tenant, user, trace, and positive credits.',
      });
    }
  }

  private resolveAction(projectedDailyCostRmb: number): CostCapDecision['action'] {
    if (projectedDailyCostRmb >= TENANT_MONTHLY_REVIEW_RMB) return 'review';
    if (projectedDailyCostRmb >= USER_DAILY_DOWNGRADE_RMB) return 'downgrade';
    return 'allow';
  }

  private resolveMessage(action: CostCapDecision['action']): string {
    if (action === 'review') return '成本已进入人工复核阈值，建议关注租户级 AI 成本。';
    if (action === 'downgrade') return '成本已进入自动降级阈值，通常做法是切换到 DeepSeek Chat。';
    return '成本处于预算内，参考行业惯例继续按主模型执行。';
  }
}
