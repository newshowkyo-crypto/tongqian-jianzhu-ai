import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface CostMeterInput {
  readonly cacheHit: boolean;
  readonly credits: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly provider?: string;
  readonly taskType?: string;
  readonly tenantId?: string;
  readonly traceId?: string;
  readonly userId?: string;
}

export interface CostMeterResult {
  readonly creditsRevenueRmb: number;
  readonly grossMargin: number;
  readonly profitRmb: number;
  readonly totalCostRmb: number;
}

export interface CostSnapshot {
  readonly calls: number;
  readonly totalCostRmb: number;
  readonly totalProfitRmb: number;
  readonly warning: 'br901-margin-low' | 'ok';
}

const INPUT_TOKEN_RMB = 0.000001;
const OUTPUT_TOKEN_RMB = 0.000002;
const CACHE_DISCOUNT = 0.1;
const MIN_GROSS_MARGIN = 0.7;

@Injectable()
export class CostMeterService {
  private totalRmb = 0;
  private totalProfitRmb = 0;
  private calls = 0;

  /**
   * Tracks provider cost, customer credit revenue, and BR-901 margin.
   *
   * @param input Token usage and credit charge.
   * @returns Cost and profit result.
   */
  track(input: CostMeterInput): CostMeterResult {
    this.assertInput(input);
    const totalCostRmb = this.calculateProviderCost(input);
    const creditsRevenueRmb = input.credits / 100;
    const profitRmb = Number((creditsRevenueRmb - totalCostRmb).toFixed(6));
    const grossMargin = creditsRevenueRmb <= 0 ? 0 : Number((profitRmb / creditsRevenueRmb).toFixed(4));
    this.totalRmb += totalCostRmb;
    this.totalProfitRmb += profitRmb;
    this.calls += 1;
    return { creditsRevenueRmb, grossMargin, profitRmb, totalCostRmb };
  }

  /**
   * Returns the in-memory cost snapshot used by admin dashboards and tests.
   *
   * @returns Cost snapshot.
   */
  profitMargin(): CostSnapshot {
    const revenue = this.totalRmb + this.totalProfitRmb;
    const margin = revenue <= 0 ? 1 : this.totalProfitRmb / revenue;
    return {
      calls: this.calls,
      totalCostRmb: Number(this.totalRmb.toFixed(6)),
      totalProfitRmb: Number(this.totalProfitRmb.toFixed(6)),
      warning: margin < MIN_GROSS_MARGIN ? 'br901-margin-low' : 'ok',
    };
  }

  /**
   * Builds a stable audit payload without storing raw prompt text.
   *
   * @param input Meter input.
   * @param result Meter result.
   * @returns Audit-safe object.
   */
  toAudit(input: CostMeterInput, result: CostMeterResult): Record<string, string | number | boolean | undefined> {
    return {
      cacheHit: input.cacheHit,
      credits: input.credits,
      grossMargin: result.grossMargin,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      provider: input.provider,
      taskType: input.taskType,
      tenantId: input.tenantId,
      totalCostRmb: result.totalCostRmb,
      traceId: input.traceId,
      userId: input.userId,
    };
  }

  private assertInput(input: CostMeterInput): void {
    if (input.credits < 0 || input.inputTokens < 0 || input.outputTokens < 0) {
      throw new BusinessError({
        code: ErrorCodes.AI_GATEWAY_UNAVAILABLE.code,
        details: { credits: input.credits, inputTokens: input.inputTokens, outputTokens: input.outputTokens },
        message: 'AI cost meter received negative usage.',
      });
    }
  }

  private calculateProviderCost(input: CostMeterInput): number {
    const raw = input.inputTokens * INPUT_TOKEN_RMB + input.outputTokens * OUTPUT_TOKEN_RMB;
    return Number((input.cacheHit ? raw * CACHE_DISCOUNT : raw).toFixed(6));
  }
}
