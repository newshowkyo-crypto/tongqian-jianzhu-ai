export interface GovAuditRecord {
  action: string;
  fieldScope: string[];
  ip: string;
  retentionYears: number;
  tenantId: string;
  userId: string;
}

export class GovAuditService {
  readonly retentionYears = 6;

  record(input: Omit<GovAuditRecord, 'retentionYears'>): GovAuditRecord {
    return { ...input, retentionYears: this.retentionYears };
  }

  fieldIsolation(fields: string[]): { fields: string[]; retentionYears: number } {
    return { fields, retentionYears: this.retentionYears };
  }
}
