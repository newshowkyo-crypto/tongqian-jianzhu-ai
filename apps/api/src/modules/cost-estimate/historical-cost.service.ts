import { Injectable } from '@nestjs/common';

interface HistoricalProjectCost {
  areaSqm: number;
  breakdown: Record<string, number>;
  completedAt: string;
  id: string;
  projectName: string;
  projectType: string;
  region: string;
  tenantId: string;
  totalCostCny: number;
  unitCostCnyPerSqm: number;
}

@Injectable()
export class HistoricalCostService {
  private readonly rows = new Map<string, HistoricalProjectCost>();

  addHistoricalProject(input: Omit<HistoricalProjectCost, 'id' | 'unitCostCnyPerSqm'>): HistoricalProjectCost {
    const row = { ...input, id: crypto.randomUUID(), unitCostCnyPerSqm: Math.round((input.totalCostCny / Math.max(1, input.areaSqm)) * 100) / 100 };
    this.rows.set(row.id, row);
    return row;
  }

  compareWithHistorical(input: { areaSqm: number; projectType: string; region: string; tenantId: string; totalCostCny: number }): { deviation: { current_vs_median: number; highest: number; lowest: number; median: number }; riskLevel: 'green' | 'red' | 'yellow'; similar: HistoricalProjectCost[] } {
    const currentUnit = input.totalCostCny / Math.max(1, input.areaSqm);
    const similar = [...this.rows.values()].filter((row) => row.tenantId === input.tenantId && row.projectType === input.projectType && row.region === input.region).sort((a, b) => a.unitCostCnyPerSqm - b.unitCostCnyPerSqm);
    const units = similar.map((row) => row.unitCostCnyPerSqm);
    const median = units[Math.floor(units.length / 2)] ?? currentUnit;
    const current_vs_median = (currentUnit - median) / Math.max(1, median);
    const riskLevel = current_vs_median < -0.2 ? 'red' : current_vs_median > 0.2 ? 'yellow' : 'green';
    return { deviation: { current_vs_median, highest: Math.max(currentUnit, ...units), lowest: Math.min(currentUnit, ...units), median }, riskLevel, similar };
  }
}
