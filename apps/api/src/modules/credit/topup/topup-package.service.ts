import { Injectable } from '@nestjs/common';
import { DEFAULT_CREDIT_PACKAGES } from '@tongqian/constants';
import { BusinessError, ErrorCodes } from '@tongqian/errors';

export interface TopupPackage {
  readonly bonusCredits: number;
  readonly code: string;
  readonly credits: number;
  readonly labelKey: string;
  readonly priceCny: number;
  readonly totalCredits: number;
}

@Injectable()
export class TopupPackageService {
  /**
   * Lists the four standard top-up packages with bonus credits.
   *
   * @returns Enriched top-up packages.
   */
  list(): TopupPackage[] {
    return DEFAULT_CREDIT_PACKAGES.map((pkg) => this.enrich(pkg));
  }

  /**
   * Gets one package by code.
   *
   * @param code Package code.
   * @returns Enriched package.
   */
  get(code: string): TopupPackage {
    const pkg = this.list().find((item) => item.code === code);
    if (!pkg) throw new BusinessError({ code: ErrorCodes.CREDIT_INSUFFICIENT.code, details: { code }, message: 'Credit top-up package is invalid.' });
    return pkg;
  }

  /**
   * Calculates payable amount and effective unit price.
   *
   * @param code Package code.
   * @returns Checkout quote.
   */
  quote(code: string): { bonusCredits: number; code: string; effectiveFenPerCredit: number; payableCny: number; totalCredits: number } {
    const pkg = this.get(code);
    return {
      bonusCredits: pkg.bonusCredits,
      code: pkg.code,
      effectiveFenPerCredit: Math.round((pkg.priceCny * 100) / pkg.totalCredits),
      payableCny: pkg.priceCny,
      totalCredits: pkg.totalCredits,
    };
  }

  /**
   * Selects the recommended package by monthly AI usage.
   *
   * @param monthlyCredits Expected monthly credits.
   * @returns Recommended package.
   */
  recommend(monthlyCredits: number): TopupPackage {
    if (!Number.isFinite(monthlyCredits) || monthlyCredits <= 0) return this.get('topup_100');
    const sorted = this.list().sort((a, b) => a.totalCredits - b.totalCredits);
    return sorted.find((pkg) => pkg.totalCredits >= monthlyCredits) ?? this.get('topup_5000');
  }

  /**
   * Builds payment metadata without storing payment credentials in frontend.
   *
   * @param code Package code.
   * @param tenantId Tenant id.
   * @returns Payment metadata.
   */
  paymentMetadata(code: string, tenantId: string): Record<string, number | string> {
    if (!tenantId) throw new BusinessError({ code: ErrorCodes.TENANT_NOT_FOUND.code, message: 'Top-up requires tenant scope.' });
    const pkg = this.get(code);
    return {
      code: pkg.code,
      orderSubject: `credit-topup-${pkg.code}`,
      priceCny: pkg.priceCny,
      tenantId,
      totalCredits: pkg.totalCredits,
    };
  }

  /**
   * Returns audit metadata for package changes and checkout.
   *
   * @param code Package code.
   * @param operatorId Operator id.
   * @returns Audit row.
   */
  toAudit(code: string, operatorId: string): Record<string, number | string> {
    const pkg = this.get(code);
    return {
      action: 'CREDIT_TOPUP_PACKAGE_SELECTED',
      bonusCredits: pkg.bonusCredits,
      code: pkg.code,
      operatorId,
      priceCny: pkg.priceCny,
      totalCredits: pkg.totalCredits,
    };
  }

  private enrich(pkg: { code: string; credits: number; priceCny: number }): TopupPackage {
    const bonusRate = this.bonusRate(pkg.priceCny);
    const bonusCredits = Math.floor(pkg.credits * bonusRate);
    return {
      bonusCredits,
      code: pkg.code,
      credits: pkg.credits,
      labelKey: `credit.topup.${pkg.code}`,
      priceCny: pkg.priceCny,
      totalCredits: pkg.credits + bonusCredits,
    };
  }

  private bonusRate(priceCny: number): number {
    if (priceCny >= 5000) return 0.18;
    if (priceCny >= 2000) return 0.12;
    if (priceCny >= 1000) return 0.08;
    return 0;
  }
}
