import { Injectable } from '@nestjs/common';
import { z } from 'zod';

type ToolContext = { tenantId: string; userId: string };
type ToolDef = { description: string; handler: (params: unknown, ctx: ToolContext) => Promise<unknown>; name: string; parameters: z.ZodTypeAny };

@Injectable()
export class ToolRegistryService {
  private readonly toolManifest = [
    { name: 'list_my_tenders' }, { name: 'list_my_contracts_by_status' }, { name: 'query_qualification' }, { name: 'query_cashflow_overview' },
    { name: 'query_aging_analysis' }, { name: 'query_top_risks' }, { name: 'query_ai_reports_recent' }, { name: 'query_dispatch_orders' },
    { name: 'query_agent_payouts' }, { name: 'query_credit_balance' }, { name: 'search_rules' }, { name: 'search_cost_catalog' },
    { name: 'search_rfp_chunks' }, { name: 'query_project_progress' }, { name: 'query_kpi_dashboard' }, { name: 'query_red_flags_pending' },
    { name: 'query_credentials_status' },
  ];

  private readonly tools: ToolDef[] = [
    this.tool('list_my_tenders', '我的在投项目', z.object({ status: z.string().optional() })),
    this.tool('list_my_contracts_by_status', '按状态查合同', z.object({ status: z.string() })),
    this.tool('query_qualification', '查资质有效期', z.object({ companyId: z.string().optional() })),
    this.tool('query_cashflow_overview', '现金流概览', z.object({ period: z.string().optional() })),
    this.tool('query_aging_analysis', '应收账龄', z.object({ days: z.number().optional() })),
    this.tool('query_top_risks', '当前 top10 风险', z.object({ limit: z.number().optional() })),
    this.tool('query_ai_reports_recent', '最近 AI 报告', z.object({ limit: z.number().optional() })),
    this.tool('query_dispatch_orders', '派单大厅状态', z.object({ status: z.string().optional() })),
    this.tool('query_agent_payouts', '智能管家分润', z.object({ month: z.string().optional() })),
    this.tool('query_credit_balance', '点数余额', z.object({})),
    this.tool('search_rules', '查规则库', z.object({ keyword: z.string() })),
    this.tool('search_cost_catalog', '查造价子目', z.object({ keyword: z.string() })),
    this.tool('search_rfp_chunks', '查招标文件片段', z.object({ query: z.string(), tenderId: z.string().optional() })),
    this.tool('query_project_progress', '项目进度', z.object({ projectId: z.string().optional() })),
    this.tool('query_kpi_dashboard', '老板 KPI', z.object({ period: z.string().optional() })),
    this.tool('query_red_flags_pending', '待审 red flag', z.object({})),
    this.tool('query_credentials_status', '凭证健康', z.object({})),
  ];

  listTools(): Array<Omit<ToolDef, 'handler'>> {
    return this.tools.map(({ description, name, parameters }) => ({ description, name, parameters }));
  }

  async execute(name: string, params: unknown, ctx: ToolContext): Promise<unknown> {
    const found = this.tools.find((tool) => tool.name === name);
    if (!found) throw new Error('CHAT_TOOL.NOT_FOUND');
    return found.handler(found.parameters.parse(params), ctx);
  }

  selectTool(question: string): string | undefined {
    if (/合同.*到期|合同.*状态/u.test(question)) return 'list_my_contracts_by_status';
    if (/点数|余额/u.test(question)) return 'query_credit_balance';
    if (/造价|清单/u.test(question)) return 'search_cost_catalog';
    if (/招标|投标|RFP/u.test(question)) return 'search_rfp_chunks';
    if (/风险|red flag/u.test(question)) return 'query_top_risks';
    return undefined;
  }

  private tool(name: string, description: string, parameters: z.ZodTypeAny): ToolDef {
    return {
      description,
      handler: async (params, ctx) => ({ ctx, name, params, result: `${name}.mockResult` }),
      name,
      parameters,
    };
  }
}
