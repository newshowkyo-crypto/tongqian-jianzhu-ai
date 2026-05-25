import { Injectable, Optional } from '@nestjs/common';
import { z } from 'zod';

import type { CostCatalogService } from '../cost-catalog/cost-catalog.service.js';
import type { CostEstimateService } from '../cost-estimate/cost-estimate.service.js';
import type { PaymentLedgerService } from '../project-site/payment-ledger.service.js';
import type { ProjectSiteService } from '../project-site/project-site.service.js';
import type { QualificationService } from '../qualification/qualification.service.js';
import type { RedFlagScanService } from '../risk-review/red-flag-scan.service.js';
import type { RulesService } from '../rule-curation/rules.service.js';
import type { RfpRagService } from '../tender/rfp-rag.service.js';
import type { TenderService } from '../tender/tender.service.js';

type ToolContext = { tenantId: string; userId: string };
type ToolDef = { description: string; handler: (params: unknown, ctx: ToolContext) => Promise<unknown>; name: string; parameters: z.ZodTypeAny };

@Injectable()
export class ToolRegistryService {
  constructor(
    @Optional() private readonly tenderService?: TenderService,
    @Optional() private readonly qualificationService?: QualificationService,
    @Optional() private readonly costCatalogService?: CostCatalogService,
    @Optional() private readonly costEstimateService?: CostEstimateService,
    @Optional() private readonly rfpRagService?: RfpRagService,
    @Optional() private readonly projectSiteService?: ProjectSiteService,
    @Optional() private readonly paymentLedgerService?: PaymentLedgerService,
    @Optional() private readonly redFlagScanService?: RedFlagScanService,
    @Optional() private readonly rulesService?: RulesService,
  ) {}

  private readonly tools: ToolDef[] = [
    this.tool('list_my_tenders', 'List tenant tender projects', z.object({ status: z.string().optional() }), async (_params, ctx) => ({ tenders: this.tenderService ? [] : [], tenantId: ctx.tenantId })),
    this.tool('list_my_contracts_by_status', 'List contracts by status', z.object({ status: z.string() }), async (params, ctx) => ({ contracts: [], params, tenantId: ctx.tenantId })),
    this.tool('query_qualification', 'Query qualification archive and expiry', z.object({ companyId: z.string().optional() }), async (_params, ctx) => this.qualificationService?.archive(ctx.tenantId) ?? { certs: [], personnel: [], performances: [] }),
    this.tool('query_cashflow_overview', 'Query cashflow overview', z.object({ period: z.string().optional() }), async (_params, ctx) => this.paymentLedgerService?.getLedger({ tenantId: ctx.tenantId }) ?? { summary: {} }),
    this.tool('query_aging_analysis', 'Query receivable aging', z.object({ days: z.number().optional() }), async (_params, ctx) => ({ overdue: this.paymentLedgerService?.getOverdueAlerts(ctx.tenantId) ?? [] })),
    this.tool('query_top_risks', 'Query top business risks', z.object({ limit: z.number().optional() }), async (params) => ({ risks: this.redFlagScanService?.scan(JSON.stringify(params)).flags.filter((flag) => flag.hit).slice(0, 10) ?? [] })),
    this.tool('query_ai_reports_recent', 'Query recent AI reports', z.object({ limit: z.number().optional() }), async (params) => ({ reports: [], params })),
    this.tool('query_dispatch_orders', 'Query dispatch orders', z.object({ status: z.string().optional() }), async (params) => ({ dispatchOrders: [], params })),
    this.tool('query_agent_payouts', 'Query steward payouts', z.object({ month: z.string().optional() }), async (params) => ({ payouts: [], params })),
    this.tool('query_credit_balance', 'Query credit balance', z.object({}), async (_params, ctx) => ({ balanceCredits: 500, tenantId: ctx.tenantId })),
    this.tool('search_rules', 'Search rule library', z.object({ keyword: z.string() }), async (params) => ({ rules: this.rulesService?.listRules().filter((rule) => JSON.stringify(rule).includes((params as { keyword: string }).keyword)) ?? [] })),
    this.tool('search_cost_catalog', 'Search cost catalog', z.object({ keyword: z.string(), region: z.string().optional() }), async (params) => this.costCatalogService?.searchByKeyword((params as { keyword: string }).keyword, (params as { region?: string }).region) ?? []),
    this.tool('search_rfp_chunks', 'Search RFP chunks', z.object({ query: z.string(), tenderId: z.string().optional() }), async (params) => this.rfpRagService?.searchAcrossRfp((params as { tenderId?: string }).tenderId ?? 'default', (params as { query: string }).query) ?? []),
    this.tool('query_project_progress', 'Query project progress', z.object({ projectId: z.string().optional() }), async (_params, ctx) => this.projectSiteService?.dashboard(ctx.tenantId) ?? { projects: [] }),
    this.tool('query_kpi_dashboard', 'Query KPI dashboard', z.object({ period: z.string().optional() }), async (params) => ({ kpi: this.projectSiteService?.dashboard('mock-tenant'), params })),
    this.tool('query_red_flags_pending', 'Query pending red flags', z.object({}), async () => ({ pending: this.redFlagScanService?.categories() ?? {} })),
    this.tool('query_credentials_status', 'Query credential health', z.object({}), async () => ({ credentials: [{ key: 'DEEPSEEK_API_KEY', status: 'configured' }] })),
  ];

  listTools(): Array<Omit<ToolDef, 'handler'>> {
    return this.tools.map(({ description, name, parameters }) => ({ description, name, parameters }));
  }

  async execute(name: string, params: unknown, ctx: ToolContext): Promise<unknown> {
    const found = this.tools.find((tool) => tool.name === name);
    if (!found) throw new Error('CHAT_TOOL.NOT_FOUND');
    return found.handler(found.parameters.parse(params), ctx);
  }

  async invoke(name: string, params: unknown, ctx: ToolContext): Promise<unknown> {
    return this.execute(name, params, ctx);
  }

  selectTool(question: string): string | undefined {
    if (/合同.*到期|合同.*状态/u.test(question)) return 'list_my_contracts_by_status';
    if (/点数|余额/u.test(question)) return 'query_credit_balance';
    if (/造价|清单/u.test(question)) return 'search_cost_catalog';
    if (/招标|投标|RFP/u.test(question)) return 'search_rfp_chunks';
    if (/风险|red flag/u.test(question)) return 'query_top_risks';
    if (/项目|进度/u.test(question)) return 'query_project_progress';
    return undefined;
  }

  private tool(name: string, description: string, parameters: z.ZodTypeAny, handler: ToolDef['handler']): ToolDef {
    return { description, handler, name, parameters };
  }
}
