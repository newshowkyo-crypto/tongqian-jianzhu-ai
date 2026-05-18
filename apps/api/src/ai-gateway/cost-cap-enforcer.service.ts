import { Injectable } from '@nestjs/common';

@Injectable()
export class CostCapEnforcerService {
  shouldDowngrade(projectedDailyCostRmb: number): boolean {
    return projectedDailyCostRmb >= 10;
  }
}
