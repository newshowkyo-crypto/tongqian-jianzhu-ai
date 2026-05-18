import { Injectable } from '@nestjs/common';

@Injectable()
export class LadderService {
  onRenewalSuccess(currentCounter: number): { consecutiveMonths: number; discountRate: number } {
    const consecutiveMonths = currentCounter + 1;
    return { consecutiveMonths, discountRate: this.resolveDiscount(consecutiveMonths) };
  }

  reset(): { consecutiveMonths: 0; discountRate: 1 } {
    return { consecutiveMonths: 0, discountRate: 1 };
  }

  resolveDiscount(consecutiveMonths: number): number {
    if (consecutiveMonths >= 12) return 0.7;
    if (consecutiveMonths >= 6) return 0.8;
    if (consecutiveMonths >= 3) return 0.85;
    return 1;
  }
}
