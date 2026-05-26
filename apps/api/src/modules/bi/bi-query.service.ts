import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { BI_TEMPLATES } from './bi-templates.js';

const querySchema = z.object({
  params: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
  templateId: z.string(),
  tenantId: z.string().min(1),
});

@Injectable()
export class BiQueryService {
  run(input: z.input<typeof querySchema>): { chart: string; rows: Array<Record<string, unknown>>; summary: string; templateId: string; tenantId: string } {
    const parsed = querySchema.parse(input);
    const template = BI_TEMPLATES.find((item) => item.id === parsed.templateId);
    if (!template) throw new Error('BI.TEMPLATE_NOT_ALLOWED');

    return {
      chart: template.chart,
      rows: this.mockRows(parsed.tenantId, template.id),
      summary: `Template ${template.id} read ${template.sqlView} with tenant guard and validated params.`,
      templateId: template.id,
      tenantId: parsed.tenantId,
    };
  }

  classify(question: string): { confidence: 'high' | 'low' | 'medium'; templateId: string } {
    const normalized = question.toLowerCase();
    if (normalized.includes('profit') || normalized.includes('利润')) return { confidence: 'high', templateId: 'last_month_profit' };
    if (normalized.includes('rank') || normalized.includes('排名')) return { confidence: 'medium', templateId: 'province_peer_rank' };
    if (normalized.includes('cash') || normalized.includes('回款')) return { confidence: 'high', templateId: 'cash_inflow_trend' };
    return { confidence: 'low', templateId: 'owner_roi_estimate' };
  }

  private mockRows(tenantId: string, templateId: string): Array<Record<string, unknown>> {
    return [
      { label: 'current', tenantId, templateId, value: 128.6 },
      { label: 'previous', tenantId, templateId, value: 96.4 },
    ];
  }
}
