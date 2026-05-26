import { Injectable } from '@nestjs/common';

type CostCategory = 'laborCost' | 'machineCost' | 'materialCost' | 'mgmtCost' | 'profit';

interface ActualCostInput {
  laborCost: number;
  machineCost: number;
  materialCost: number;
  mgmtCost: number;
  period: string;
  profit: number;
  projectId: string;
  tenantId: string;
}

interface VarianceRow {
  actualAmount: number;
  budgetAmount: number;
  category: CostCategory;
  projectId: string;
  varianceAmount: number;
  varianceRate: number;
}

const records: Array<ActualCostInput & { id: string; totalCost: number }> = [];
const variances: VarianceRow[] = [];

@Injectable()
export class ActualCostService {
  recordMonthly(input: ActualCostInput): ActualCostInput & { id: string; totalCost: number } {
    const totalCost = input.laborCost + input.materialCost + input.machineCost + input.mgmtCost + input.profit;
    const row = { ...input, id: crypto.randomUUID(), totalCost };
    records.push(row);
    return row;
  }

  computeVariance(projectId: string, period: string, budget: Record<CostCategory, number>, tenantId = 'mock-tenant'): VarianceRow[] {
    const actual = records.find((row) => row.projectId === projectId && row.period === period && row.tenantId === tenantId);
    if (!actual) throw new Error('ACTUAL_COST_NOT_FOUND');
    const categories: CostCategory[] = ['laborCost', 'materialCost', 'machineCost', 'mgmtCost', 'profit'];
    const rows = categories.map((category) => {
      const budgetAmount = budget[category] ?? 0;
      const actualAmount = actual[category];
      const varianceAmount = actualAmount - budgetAmount;
      const varianceRate = budgetAmount === 0 ? 0 : Number((varianceAmount / budgetAmount).toFixed(4));
      return { actualAmount, budgetAmount, category, projectId, varianceAmount, varianceRate };
    });
    variances.push(...rows);
    return rows;
  }

  getVarianceTrend(projectId: string): VarianceRow[] {
    return variances.filter((row) => row.projectId === projectId);
  }
}
