import { Injectable } from '@nestjs/common';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

@Injectable()
export class DiscountRebateService {
  /**
   * Converts discounted monthly payment into rebate credits.
   *
   * @param monthlyPriceCny Plan monthly price.
   * @param discountRate Discount rate.
   * @returns Rebate credits.
   */
  calculateCredits(monthlyPriceCny: number, discountRate: number): number {
    this.validate(monthlyPriceCny, discountRate);
    return Math.max(0, Math.round(monthlyPriceCny * (1 - discountRate) * 100));
  }

  /**
   * Resolves discount rate by consecutive paid months.
   *
   * @param consecutiveMonths Consecutive successful renewals.
   * @returns Discount rate.
   */
  resolveRate(consecutiveMonths: number): number {
    if (consecutiveMonths >= 12) return 0.7;
    if (consecutiveMonths >= 6) return 0.8;
    if (consecutiveMonths >= 3) return 0.85;
    return 1;
  }

  /**
   * Builds an invoice rebate preview.
   *
   * @param monthlyPriceCny Plan monthly price.
   * @param consecutiveMonths Consecutive paid months.
   * @returns Preview detail.
   */
  preview(monthlyPriceCny: number, consecutiveMonths: number): { discountRate: number; payableCny: number; rebateCredits: number; savedCny: number } {
    const discountRate = this.resolveRate(consecutiveMonths);
    this.validate(monthlyPriceCny, discountRate);
    const payableCny = Math.round(monthlyPriceCny * discountRate * 100) / 100;
    return { discountRate, payableCny, rebateCredits: this.calculateCredits(monthlyPriceCny, discountRate), savedCny: monthlyPriceCny - payableCny };
  }

  /**
   * Verifies the ladder discount is monotonic as renewal count increases.
   *
   * @param months Renewal month samples.
   * @returns True when later months never produce worse customer discount.
   */
  isMonotonic(months: number[]): boolean {
    const rates = months.map((month) => this.resolveRate(month));
    return rates.every((rate, index) => index === 0 || rate <= (rates[index - 1] ?? 1));
  }

  /**
   * Returns audit metadata for monthly rebate issuance.
   *
   * @param tenantId Tenant id.
   * @param consecutiveMonths Consecutive paid months.
   * @returns Audit row.
   */
  toAudit(tenantId: string, consecutiveMonths: number): Record<string, number | string> {
    if (!tenantId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Rebate requires tenant scope.' });
    return { action: 'SUB_DISCOUNT_REBATE', consecutiveMonths, discountRate: this.resolveRate(consecutiveMonths), tenantId };
  }

  /**
   * Lists visible ladder bands for billing configuration review.
   *
   * @returns Discount ladder bands.
   */
  bands(): Array<{ discountRate: number; minMonths: number; stage: string }> {
    return [
      { discountRate: 1, minMonths: 0, stage: 'S0' },
      { discountRate: 0.85, minMonths: 3, stage: 'S2' },
      { discountRate: 0.8, minMonths: 6, stage: 'S3' },
      { discountRate: 0.7, minMonths: 12, stage: 'S4' },
    ];
  }

  private validate(monthlyPriceCny: number, discountRate: number): void {
    if (!Number.isFinite(monthlyPriceCny) || monthlyPriceCny < 0 || discountRate <= 0 || discountRate > 1) {
      throw new BusinessError({ code: ErrorCodes.SUB_PLAN_UNAVAILABLE.code, message: 'Subscription discount input is invalid.' });
    }
  }
}
