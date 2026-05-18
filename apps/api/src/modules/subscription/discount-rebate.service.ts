import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscountRebateService {
  calculateCredits(monthlyPriceCny: number, discountRate: number): number {
    return Math.max(0, Math.round(monthlyPriceCny * (1 - discountRate) * 100));
  }
}
