import { Injectable } from '@nestjs/common';
import type { GovConsultIntentView, GovDocumentDraftView, GovProjectSourcingView, PolicyFundView } from '@tongqian/types';

const SENSITIVE_PATTERN = /(\d{3,4}-?\d{7,8}|1[3-9]\d{9}|[\w.-]+@[\w.-]+)/g;

@Injectable()
export class GovSoeService {
  private readonly consults = new Map<string, GovConsultIntentView>();
  private readonly drafts = new Map<string, GovDocumentDraftView & { tenantId: string }>();
  private readonly funds = new Map<string, PolicyFundView>();
  private readonly sourcings = new Map<string, GovProjectSourcingView & { description: string; publisherTenantId: string }>();

  constructor() {
    this.seedFunds();
  }

  policies(): Record<string, unknown> {
    return { forceDomesticModel: true, items: ['gov.policy.infrastructure', 'gov.policy.specialBond', 'gov.policy.soeFinance'] };
  }

  draftDocument(input: { docType: string; ip: string; topic: string; userId: string; tenantId: string }): GovDocumentDraftView {
    this.assertDomesticOnly();
    const traceId = crypto.randomUUID();
    const draft: GovDocumentDraftView & { tenantId: string } = {
      aiTaskId: `gov-doc-${crypto.randomUUID()}`,
      content: `gov.doc.${input.docType}.topic:${input.topic}\n\n[internal-use watermark user=${input.userId} ip=${input.ip} trace=${traceId}]`,
      createdAt: new Date().toISOString(),
      docType: input.docType,
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      watermark: `internal-use:${input.userId}:${input.ip}:${traceId}`,
    };
    this.drafts.set(draft.id, draft);
    return draft;
  }

  myDrafts(tenantId: string): GovDocumentDraftView[] {
    return [...this.drafts.values()].filter((item) => item.tenantId === tenantId).map(({ tenantId: _tenantId, ...view }) => view);
  }

  createSourcing(input: { description: string; industry: string; publisherTenantId: string; region: string; title: string }): GovProjectSourcingView {
    const item = {
      contactRevealed: false,
      description: input.description,
      id: crypto.randomUUID(),
      industry: input.industry,
      maskedSummary: input.description.replace(SENSITIVE_PATTERN, '[MASKED]'),
      publisherTenantId: input.publisherTenantId,
      region: input.region,
      status: 'published' as const,
      title: input.title,
    };
    this.sourcings.set(item.id, item);
    return item;
  }

  listSourcing(): GovProjectSourcingView[] {
    return [...this.sourcings.values()].map(({ description: _description, publisherTenantId: _publisherTenantId, ...view }) => view);
  }

  revealContact(id: string): GovProjectSourcingView {
    const item = this.sourcings.get(id);
    if (!item) throw new Error('GOV.SOURCING_NOT_FOUND');
    const next = { ...item, contactRevealed: true, status: 'revealed' as const };
    this.sourcings.set(id, next);
    const { description: _description, publisherTenantId: _publisherTenantId, ...view } = next;
    return view;
  }

  createConsult(input: { amountEstimateCny?: number; topic: string }): GovConsultIntentView {
    const highTouch = (input.amountEstimateCny ?? 0) >= 150_000 || ['ABS', 'REITs', 'SPV'].includes(input.topic);
    const consult: GovConsultIntentView = {
      amountEstimateCny: input.amountEstimateCny,
      assignedConsultId: highTouch ? 'tongqian-consultant-pool' : undefined,
      consultingOrderId: highTouch ? `mock-consult-${crypto.randomUUID()}` : undefined,
      id: crypto.randomUUID(),
      status: highTouch ? 'assigned' : 'pending',
      topic: input.topic,
    };
    this.consults.set(consult.id, consult);
    return consult;
  }

  fundsList(): PolicyFundView[] {
    return [...this.funds.values()];
  }

  fundMatch(input: { projectFeatures: string[] }): Record<string, unknown> {
    return { costCredits: 200, forceDomesticModel: true, matches: this.fundsList().slice(0, 5), projectFeatures: input.projectFeatures };
  }

  twoBooks(input: { ip: string; projectName: string; userId: string }): Record<string, unknown> {
    return { costCredits: 1500, files: ['implementation_plan', 'financial_eval_placeholder', 'legal_eval_placeholder'], forceDomesticModel: true, watermark: `internal-use:${input.userId}:${input.ip}:${crypto.randomUUID()}` };
  }

  private assertDomesticOnly(): void {
    const provider = process.env.AI_PROVIDER_OVERRIDE;
    if (provider && ['openai', 'openrouter'].includes(provider.toLowerCase())) throw new Error('GOV.OVERSEA_MODEL_FORBIDDEN');
  }

  private seedFunds(): void {
    for (const code of ['ULTRA_BOND', 'SPECIAL_BOND', 'CEI', 'CITY_RENEWAL', 'NEW_INFRA', 'GREEN_DEVELOPMENT', 'SME_FUND', 'POLICY_BANK_URBAN']) {
      const fund: PolicyFundView = { aiSummary: `gov.fund.${code}.summary`, authority: 'mock.authority.domestic', category: 'NATIONAL_COMPREHENSIVE', code, id: crypto.randomUUID(), nameShort: `gov.fund.${code}.short`, nameZh: `gov.fund.${code}.name`, rolloutPct: 100, status: 'published' };
      this.funds.set(fund.id, fund);
    }
  }
}
