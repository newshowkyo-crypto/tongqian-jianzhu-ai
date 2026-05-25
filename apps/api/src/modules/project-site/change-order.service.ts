import { Injectable } from '@nestjs/common';

interface ChangeOrderInput {
  contractId: string;
  description: string;
  estimatedCostImpactCny?: number;
  estimatedTimeImpactDays?: number;
  evidenceFiles: string[];
  orderType: string;
  projectId: string;
  status?: string;
  tenantId: string;
  title: string;
}

@Injectable()
export class ChangeOrderService {
  private readonly changes: Array<ChangeOrderInput & { aiRiskAnalysis: string; id: string }> = [];

  create(input: ChangeOrderInput): ChangeOrderInput & { aiRiskAnalysis: string; id: string } {
    const item = { ...input, aiRiskAnalysis: this.risk(input), id: crypto.randomUUID(), status: input.status ?? 'draft' };
    this.changes.push(item);
    return item;
  }

  list(projectId: string): Array<ChangeOrderInput & { aiRiskAnalysis: string; id: string }> {
    return this.changes.filter((item) => item.projectId === projectId);
  }

  private risk(input: ChangeOrderInput): string {
    return input.evidenceFiles.length < 2 ? '证据不足，建议补充签证单、照片和会议纪要。' : '证据链初步完整，建议提交前复核合同变更条款。';
  }
}
