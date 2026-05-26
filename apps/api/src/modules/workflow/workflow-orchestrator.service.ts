import { Injectable } from '@nestjs/common';

import { ToolRegistryService } from '../chat-hub/tool-registry.service.js';

const templates = {
  bid_prep: ['list_my_tenders', 'search_rfp_chunks', 'query_qualification'],
  bulk_collection: ['query_aging_analysis', 'list_my_contracts_by_status', 'query_dispatch_orders'],
  customer_dd: ['query_top_risks', 'search_rules', 'query_ai_reports_recent'],
  opp_mining: ['list_my_tenders', 'query_kpi_dashboard', 'query_project_progress'],
  qual_renew: ['query_qualification', 'query_dispatch_orders', 'query_ai_reports_recent'],
} as const;

@Injectable()
export class WorkflowOrchestratorService {
  constructor(private readonly tools: ToolRegistryService) {}

  async run(input: { intent: string; tenantId: string; type: keyof typeof templates; userId: string }): Promise<Record<string, unknown>> {
    const steps = templates[input.type].map((toolName, index) => ({ orderIndex: index + 1, params: this.paramsFor(toolName), status: 'pending', toolName }));
    const outputs = [];
    for (const step of steps) {
      try {
        const output = await this.tools.invoke(step.toolName, step.params, { tenantId: input.tenantId, userId: input.userId });
        outputs.push({ ...step, output, status: 'done' });
      } catch (error) {
        outputs.push({ ...step, errorMessage: error instanceof Error ? error.message : String(error), status: 'failed' });
      }
    }
    return { id: crypto.randomUUID(), intent: input.intent, plan: steps, result: outputs, status: outputs.some((item) => item.status === 'failed') ? 'failed' : 'done', type: input.type };
  }

  private paramsFor(toolName: string): Record<string, unknown> {
    if (toolName === 'list_my_contracts_by_status') return { status: 'active' };
    if (toolName === 'query_aging_analysis') return { days: 90 };
    if (toolName === 'search_rfp_chunks') return { query: 'scoring criteria', tenderId: 'default' };
    if (toolName === 'search_rules') return { keyword: 'risk' };
    return {};
  }
}
