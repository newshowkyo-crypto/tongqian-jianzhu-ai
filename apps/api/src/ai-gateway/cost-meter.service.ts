import { Injectable } from '@nestjs/common';

@Injectable()
export class CostMeterService {
  private totalRmb = 0;

  track(input: { cacheHit: boolean; credits: number; inputTokens: number; outputTokens: number }): { profitRmb: number; totalCostRmb: number } {
    const totalCostRmb = input.cacheHit ? 0 : (input.inputTokens * 0.000001 + input.outputTokens * 0.000002);
    this.totalRmb += totalCostRmb;
    return { profitRmb: input.credits / 100 - totalCostRmb, totalCostRmb };
  }

  profitMargin(): { totalRmb: number } {
    return { totalRmb: this.totalRmb };
  }
}
