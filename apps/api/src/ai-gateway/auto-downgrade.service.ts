import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';
import { AiTaskType } from '@tongqian/types';

export interface AutoDowngradeInput {
  readonly currentModel: string;
  readonly dailyCostRmb: number;
  readonly errorRate: number;
  readonly latencyP95Ms: number;
  readonly taskType: AiTaskType;
  readonly tenantId: string;
  readonly traceId: string;
}

export interface AutoDowngradeDecision {
  readonly audit: {
    readonly action: string;
    readonly after: string;
    readonly before: string;
    readonly reason: string;
    readonly tenantId: string;
    readonly traceId: string;
  };
  readonly downgraded: boolean;
  readonly model: 'deepseek-chat' | 'deepseek-reasoner';
  readonly reason: string;
  readonly retryable: boolean;
}

const REASONER_TASKS = new Set<AiTaskType>([
  AiTaskType.CONTRACT_REVIEW_BASIC,
  AiTaskType.CONTRACT_REVIEW_PRO,
  AiTaskType.TENDER_ELIGIBILITY,
  AiTaskType.TENDER_FRAMEWORK,
  AiTaskType.TENDER_SUMMARY,
  AiTaskType.QUAL_CHECKUP,
  AiTaskType.QUAL_UPGRADE_PATH,
  AiTaskType.GOV_POLICY_IMPACT,
  AiTaskType.OPS_POLICY_IMPACT,
]);

const COST_DOWNGRADE_RMB = 10;
const LATENCY_DOWNGRADE_MS = 30_000;
const ERROR_RATE_DOWNGRADE = 0.2;

@Injectable()
export class AutoDowngradeService {
  /**
   * Selects the M3.7 DeepSeek model for a task before runtime signals are applied.
   *
   * @param taskType AI task type from shared contracts.
   * @returns DeepSeek V3 chat for common tasks, DeepSeek Reasoner for high-analysis tasks.
   */
  selectBaseModel(taskType: AiTaskType): 'deepseek-chat' | 'deepseek-reasoner' {
    return REASONER_TASKS.has(taskType) ? 'deepseek-reasoner' : 'deepseek-chat';
  }

  /**
   * Applies BR-904 cost and stability downgrade rules while staying inside DeepSeek.
   *
   * @param input Runtime metrics and tenant context.
   * @returns A deterministic downgrade decision with an audit payload.
   */
  evaluate(input: AutoDowngradeInput): AutoDowngradeDecision {
    this.assertTenantContext(input);
    const baseModel = this.selectBaseModel(input.taskType);
    const shouldDowngrade =
      input.dailyCostRmb >= COST_DOWNGRADE_RMB ||
      input.latencyP95Ms >= LATENCY_DOWNGRADE_MS ||
      input.errorRate >= ERROR_RATE_DOWNGRADE;
    const model = shouldDowngrade ? 'deepseek-chat' : baseModel;
    const reason = this.resolveReason(input, shouldDowngrade);

    return {
      audit: {
        action: 'AI_AUTO_DOWNGRADE_EVALUATED',
        after: model,
        before: input.currentModel,
        reason,
        tenantId: input.tenantId,
        traceId: input.traceId,
      },
      downgraded: shouldDowngrade && input.currentModel !== model,
      model,
      reason,
      retryable: true,
    };
  }

  /**
   * Backward-compatible model selector used by older orchestrator tests.
   *
   * @param model Current model.
   * @param downgrade Whether to force the lowest-cost DeepSeek model.
   * @returns DeepSeek model name.
   */
  chooseModel(model: string, downgrade: boolean): string {
    if (!model.startsWith('deepseek-')) return downgrade ? 'deepseek-chat' : 'deepseek-chat';
    return downgrade ? 'deepseek-chat' : model;
  }

  private assertTenantContext(input: AutoDowngradeInput): void {
    if (!input.tenantId || !input.traceId) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { hasTenantId: Boolean(input.tenantId), hasTraceId: Boolean(input.traceId) },
        message: 'AI downgrade requires tenant and trace context.',
      });
    }
  }

  private resolveReason(input: AutoDowngradeInput, downgraded: boolean): string {
    if (!downgraded) return 'within-cost-and-stability-budget';
    if (input.dailyCostRmb >= COST_DOWNGRADE_RMB) return 'daily-ai-cost-cap';
    if (input.latencyP95Ms >= LATENCY_DOWNGRADE_MS) return 'latency-p95-cap';
    return 'provider-error-rate-cap';
  }
}
