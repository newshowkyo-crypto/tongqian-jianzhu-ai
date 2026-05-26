import { Injectable } from '@nestjs/common';

type MovementType = 'adjustment' | 'inbound' | 'outbound' | 'scrap';

interface MaterialRow {
  actualQty: number;
  avgUnitCost: number;
  id: string;
  lossRate: number;
  name: string;
  plannedQty: number;
  projectId: string;
  tenantId: string;
  unit: string;
}

interface StockMovementRow {
  createdAt: Date;
  materialId: string;
  projectId: string;
  qty: number;
  tenantId: string;
  type: MovementType;
  unitPrice?: number;
}

const materials = new Map<string, MaterialRow>();
const movements: StockMovementRow[] = [];

@Injectable()
export class MaterialService {
  create(input: { actualQty?: number; avgUnitCost?: number; id?: string; name: string; plannedQty: number; projectId: string; tenantId: string; unit: string }): MaterialRow {
    const row: MaterialRow = { actualQty: input.actualQty ?? 0, avgUnitCost: input.avgUnitCost ?? 0, id: input.id ?? crypto.randomUUID(), lossRate: 0, name: input.name, plannedQty: input.plannedQty, projectId: input.projectId, tenantId: input.tenantId, unit: input.unit };
    materials.set(row.id, row);
    return row;
  }

  inbound(projectId: string, materialId: string, qty: number, unitPrice = 0, tenantId = 'mock-tenant'): MaterialRow {
    const row = this.ensureMaterial(projectId, materialId, tenantId);
    row.actualQty += qty;
    row.avgUnitCost = row.avgUnitCost === 0 ? unitPrice : (row.avgUnitCost + unitPrice) / 2;
    movements.push({ createdAt: new Date(), materialId, projectId, qty, tenantId, type: 'inbound', unitPrice });
    return row;
  }

  outbound(projectId: string, materialId: string, qty: number, tenantId = 'mock-tenant'): MaterialRow {
    const row = this.ensureMaterial(projectId, materialId, tenantId);
    if (row.actualQty < qty) throw new Error('MATERIAL_STOCK_NOT_ENOUGH');
    row.actualQty -= qty;
    movements.push({ createdAt: new Date(), materialId, projectId, qty, tenantId, type: 'outbound' });
    return row;
  }

  monthlyCheck(projectId: string, results: Array<{ actualQty: number; materialId: string; theoreticalQty: number }>, tenantId = 'mock-tenant'): MaterialRow[] {
    return results.map((item) => {
      const row = this.ensureMaterial(projectId, item.materialId, tenantId);
      const lossQty = item.theoreticalQty - item.actualQty;
      row.actualQty = item.actualQty;
      row.lossRate = item.theoreticalQty <= 0 ? 0 : Number((lossQty / item.theoreticalQty).toFixed(4));
      movements.push({ createdAt: new Date(), materialId: item.materialId, projectId, qty: lossQty, tenantId, type: 'adjustment' });
      return row;
    });
  }

  getHighLossList(tenantId: string): MaterialRow[] {
    return [...materials.values()].filter((row) => row.tenantId === tenantId && row.lossRate > 0.05);
  }

  private ensureMaterial(projectId: string, materialId: string, tenantId: string): MaterialRow {
    const row = materials.get(materialId) ?? this.create({ id: materialId, name: 'Unregistered material', plannedQty: 0, projectId, tenantId, unit: 'unit' });
    if (row.projectId !== projectId || row.tenantId !== tenantId) throw new Error('MATERIAL_SCOPE_MISMATCH');
    return row;
  }
}
