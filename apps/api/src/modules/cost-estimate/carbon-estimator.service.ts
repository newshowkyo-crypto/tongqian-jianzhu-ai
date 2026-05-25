import { Injectable } from '@nestjs/common';

interface CarbonItem {
  factor: number;
  material: string;
  qty: number;
  totalKgCo2e: number;
  unit: string;
}

const FACTORS: Record<string, number> = {
  concrete: 310,
  glass: 1800,
  masonry: 220,
  rebar: 2150,
  steel: 2350,
};

@Injectable()
export class CarbonEstimatorService {
  estimate(input: { areaSqm: number; materialItems: Array<{ material: string; qty: number; unit: string }>; projectName: string; tenantId: string }): { aiSuggestions: Array<{ costImpactCny: number; reductionKgCo2e: number; title: string }>; benchmarkPerSqmKgCo2e: number; deviationPct: number; disclaimer: string; id: string; materialItems: CarbonItem[]; perSqmKgCo2e: number; totalKgCo2e: number } {
    const materialItems = input.materialItems.map((item) => {
      const factor = FACTORS[item.material] ?? 500;
      return { ...item, factor, totalKgCo2e: Math.round(item.qty * factor) };
    });
    const totalKgCo2e = materialItems.reduce((sum, item) => sum + item.totalKgCo2e, 0);
    const perSqmKgCo2e = Number((totalKgCo2e / Math.max(input.areaSqm, 1)).toFixed(2));
    const benchmarkPerSqmKgCo2e = 680;
    return {
      aiSuggestions: [
        { costImpactCny: 80000, reductionKgCo2e: Math.round(totalKgCo2e * 0.06), title: '采用低碳混凝土替代部分 C30' },
        { costImpactCny: 120000, reductionKgCo2e: Math.round(totalKgCo2e * 0.04), title: '提高装配式构件比例' },
        { costImpactCny: 180000, reductionKgCo2e: Math.round(totalKgCo2e * 0.05), title: '评估光伏屋顶和余热回收' },
      ],
      benchmarkPerSqmKgCo2e,
      deviationPct: Number(((perSqmKgCo2e - benchmarkPerSqmKgCo2e) / benchmarkPerSqmKgCo2e).toFixed(3)),
      disclaimer: '碳排粗算仅供政策和经营辅助，碳因子需以后续权威数据集替换。',
      id: crypto.randomUUID(),
      materialItems,
      perSqmKgCo2e,
      totalKgCo2e,
    };
  }
}
