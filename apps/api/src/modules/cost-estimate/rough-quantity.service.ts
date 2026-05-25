import { Injectable } from '@nestjs/common';

interface RoughQuantityInput {
  areaSqm: number;
  projectName: string;
  projectType: string;
  structureType: string;
  tenantId: string;
}

interface RoughQuantityItem {
  estimatedCnyPerUnit: number;
  qty: number;
  totalCny: number;
  unit: string;
  workItem: string;
}

const DEFAULT_ITEMS = [
  ['steel', 't', 0.16, 6200],
  ['concrete_foundation', 'm3', 0.4, 560],
  ['masonry', 'm3', 0.8, 420],
  ['roof_panel', 'm2', 1.05, 180],
  ['waterproof', 'm2', 1.5, 85],
  ['floor_hardening', 'm2', 0.95, 120],
  ['doors_windows', 'm2', 0.18, 580],
  ['fire_mep', 'm2', 1, 260],
  ['temporary_facility', 'm2', 0.08, 240],
  ['earthwork', 'm3', 0.65, 48],
] as const;

@Injectable()
export class RoughQuantityService {
  private readonly estimates = new Map<string, RoughQuantityInput & { aiAnalysis: string; id: string; items: RoughQuantityItem[]; totalCny: number }>();

  estimate(input: RoughQuantityInput): RoughQuantityInput & { aiAnalysis: string; id: string; items: RoughQuantityItem[]; totalCny: number } {
    if (input.areaSqm <= 0) throw new Error('QUANTITY.INVALID_AREA');
    const items = DEFAULT_ITEMS.map(([workItem, unit, coefficient, estimatedCnyPerUnit]) => {
      const qty = Number((input.areaSqm * this.coefficient(input.projectType, input.structureType, coefficient)).toFixed(2));
      return { estimatedCnyPerUnit, qty, totalCny: Math.round(qty * estimatedCnyPerUnit), unit, workItem };
    });
    const estimate = {
      ...input,
      aiAnalysis: '粗算量按项目类型 x 结构类型 x 工程量指标系数估算，仅供老板快速判断和造价人员接手复核。',
      id: crypto.randomUUID(),
      items,
      totalCny: items.reduce((sum, item) => sum + item.totalCny, 0),
    };
    this.estimates.set(estimate.id, estimate);
    return estimate;
  }

  private coefficient(projectType: string, structureType: string, base: number): number {
    const typeFactor = projectType === 'hospital' ? 1.18 : projectType === 'dc' ? 1.35 : projectType === 'factory' ? 1 : 1.08;
    const structureFactor = structureType === 'steel' ? 1 : structureType === 'frame_shear' ? 1.12 : structureType === 'prefab' ? 0.92 : 1.05;
    return base * typeFactor * structureFactor;
  }
}
