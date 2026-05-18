import { Injectable } from '@nestjs/common';
import { AiAudienceRole, AiConfidenceLevel, AiNextStepAction, AiOutputTier, ReportNextStepHint } from '@tongqian/types';
import type { GuidanceButtonView, ReportBrandMode, ReportDifficultyRadarView, ReportEscalationType, ReportRole, ReportTemplateView, ReportView } from '@tongqian/types';

interface CreateReportInput {
  agentId?: string;
  aiTaskType: string;
  companyName?: string;
  dataSnapshot: Record<string, unknown>;
  ownerName?: string;
  role?: ReportRole;
  sourceModule: string;
  sourceTaskId: string;
  subscriptionPlan?: 'ent' | 'flag' | 'lite' | 'std';
  tenantId: string;
  userId: string;
}

interface ReportEscalationView {
  createdAt: string;
  id: string;
  reportId: string;
  status: 'requested';
  ticketId: string;
  type: ReportEscalationType;
}

@Injectable()
export class ReportCenterService {
  private readonly escalations = new Map<string, ReportEscalationView>();
  private readonly reports = new Map<string, ReportView>();
  private readonly templates = new Map<string, ReportTemplateView>();
  private readonly viewDevices = new Map<string, Set<string>>();

  createReport(input: CreateReportInput): ReportView {
    const normalized = this.normalizeOutput(input.dataSnapshot);
    this.validateRequiredElements(normalized);
    const template = this.getActiveTemplate(input.sourceModule);
    const brandMode = this.resolveBrand(input.subscriptionPlan, input.agentId);
    const role = input.role ?? AiAudienceRole.OWNER;
    const traceId = normalized.traceId;
    const radar = role === AiAudienceRole.GOV_SOE ? undefined : this.buildRadar(input.aiTaskType, normalized.tier);
    const watermark = this.buildWatermark({ brandMode, companyName: input.companyName, ownerName: input.ownerName, role, traceId });
    const guidanceButtons = this.guidanceButtons(role, normalized.tier);
    const report: ReportView = {
      agentId: input.agentId,
      aiTaskType: input.aiTaskType,
      brandMode,
      confidence: normalized.confidence,
      createdAt: new Date().toISOString(),
      dataSnapshot: normalized,
      deviceLimit: this.requiresAntiPiracy(input.subscriptionPlan) ? 5 : 0,
      disclaimer: normalized.disclaimer,
      guidanceButtons,
      id: crypto.randomUUID(),
      nextStep: normalized.nextStepHint,
      radar,
      sourceModule: input.sourceModule,
      sourceTaskId: input.sourceTaskId,
      templateVersion: template.version,
      tenantId: input.tenantId,
      tier: normalized.tier,
      traceId,
      userId: input.userId,
      watermark,
    };
    report.h5Url = this.uploadAsset(report.id, 'h5', this.renderH5(report));
    report.pdfUrl = this.uploadAsset(report.id, 'pdf', this.renderPdfEnvelope(report));
    this.reports.set(report.id, report);
    return report;
  }

  getReport(id: string, tenantId: string, userId?: string, deviceId?: string): ReportView {
    const report = this.mustGetReport(id);
    if (report.tenantId !== tenantId || (userId && report.userId !== userId)) throw new Error('REPORT.NOT_FOUND');
    this.recordDeviceView(report, deviceId);
    return report;
  }

  listReports(tenantId: string, userId: string): ReportView[] {
    return [...this.reports.values()].filter((report) => report.tenantId === tenantId && report.userId === userId);
  }

  rateReport(reportId: string, tenantId: string, input: { feedback?: string; stars: number }): ReportView {
    if (input.stars < 1 || input.stars > 5) throw new Error('REPORT.RATING.INVALID');
    const report = this.getReport(reportId, tenantId);
    report.rating = { feedback: input.feedback, ratedAt: new Date().toISOString(), stars: input.stars };
    return report;
  }

  escalate(reportId: string, tenantId: string, type: ReportEscalationType): ReportEscalationView {
    const report = this.getReport(reportId, tenantId);
    const escalation: ReportEscalationView = {
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      reportId: report.id,
      status: 'requested',
      ticketId: `mock-ticket-${crypto.randomUUID()}`,
      type,
    };
    this.escalations.set(escalation.id, escalation);
    return escalation;
  }

  listTemplates(): ReportTemplateView[] {
    this.ensureSeedTemplates();
    return [...this.templates.values()];
  }

  upsertTemplate(id: string, input: { isActive?: boolean; layoutSchema?: Record<string, unknown>; sourceModule?: string; version?: number }): ReportTemplateView {
    const existing = this.templates.get(id);
    const template: ReportTemplateView = {
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      id,
      isActive: input.isActive ?? existing?.isActive ?? true,
      layoutSchema: input.layoutSchema ?? existing?.layoutSchema ?? { sections: ['summary', 'findings', 'actions', 'appendix'] },
      sourceModule: input.sourceModule ?? existing?.sourceModule ?? 'generic',
      version: input.version ?? existing?.version ?? 1,
    };
    this.templates.set(id, template);
    return template;
  }

  verifyReportAccess(reportId: string, tenantId: string, deviceId: string): { allowed: boolean; remainingDevices: number; traceId: string } {
    const report = this.getReport(reportId, tenantId, undefined, deviceId);
    const devices = this.viewDevices.get(report.id) ?? new Set<string>();
    return { allowed: report.deviceLimit === 0 || devices.size <= report.deviceLimit, remainingDevices: Math.max(report.deviceLimit - devices.size, 0), traceId: report.traceId };
  }

  traceForwarding(traceId: string): { abnormal: boolean; reportId: string; traceId: string; views: number } {
    const report = [...this.reports.values()].find((item) => item.traceId === traceId);
    if (!report) throw new Error('REPORT.NOT_FOUND');
    const views = this.viewDevices.get(report.id)?.size ?? 0;
    return { abnormal: report.deviceLimit > 0 && views > report.deviceLimit, reportId: report.id, traceId, views };
  }

  private buildRadar(aiTaskType: string, tier: AiOutputTier): ReportDifficultyRadarView {
    const base = Math.min(100, 30 + tier * 12);
    const professional = aiTaskType.includes('risk') ? base + 8 : base;
    const timeHours = Math.min(40, 6 + tier * 4);
    const riskScore = aiTaskType.includes('contract') ? base + 10 : base;
    const costScore = Math.min(100, 20 + tier * 10);
    return {
      agentAlternative: { compensation: tier >= AiOutputTier.TIER_2, days: Math.max(2, tier + 2), successRate: 0.82 },
      costScore,
      professional,
      renderedSvg: this.renderRadarSvg({ costScore, professional, riskScore, timeHours }),
      riskScore,
      timeHours,
    };
  }

  private buildWatermark(input: { brandMode: ReportBrandMode; companyName?: string; ownerName?: string; role: ReportRole; traceId: string }): string {
    if (input.role === AiAudienceRole.GOV_SOE) return `report.watermark.gov-internal|trace:${input.traceId}`;
    const owner = input.ownerName ?? 'owner';
    const company = input.companyName ?? 'tenant';
    if (input.brandMode === 'co_brand_agent') return `report.watermark.co-brand-agent|trace:${input.traceId}`;
    if (input.brandMode === 'co_brand_flagship') return `report.watermark.co-brand-flagship|trace:${input.traceId}`;
    return `report.watermark.customer-exclusive|${owner}|${company}|trace:${input.traceId}`;
  }

  private ensureSeedTemplates(): void {
    for (const sourceModule of ['11-opportunity-radar', '12-tender-factory', '13-risk-review', '14-qualification-guard', '19-cashflow-finance', 'generic']) {
      const key = `${sourceModule}:1`;
      if (!this.templates.has(key)) {
        this.templates.set(key, {
          createdAt: new Date().toISOString(),
          id: key,
          isActive: true,
          layoutSchema: { appendices: true, formats: ['h5', 'pdf'], sections: ['summary', 'findings', 'actions', 'sources'] },
          sourceModule,
          version: 1,
        });
      }
    }
  }

  private getActiveTemplate(sourceModule: string): ReportTemplateView {
    this.ensureSeedTemplates();
    return (
      [...this.templates.values()]
        .filter((template) => template.sourceModule === sourceModule && template.isActive)
        .sort((left, right) => right.version - left.version)[0] ?? this.templates.get('generic:1')
    ) as ReportTemplateView;
  }

  private guidanceButtons(role: ReportRole, tier: AiOutputTier): GuidanceButtonView[] {
    if (role === AiAudienceRole.AGENT) {
      return [
        { action: AiNextStepAction.EXECUTE_BY_PLAN, i18nKey: 'report.guidance.agent.executePlan', role },
        { action: AiNextStepAction.RECOMMEND_TO_TONGQIAN, highlighted: tier >= AiOutputTier.TIER_2, i18nKey: 'report.guidance.agent.recommendTongqian', role },
        { action: AiNextStepAction.CONTACT_PLATFORM_SUPPORT, i18nKey: 'report.guidance.agent.contactCs', role },
      ];
    }
    if (role === AiAudienceRole.GOV_SOE) {
      return [
        { action: AiNextStepAction.SELF_EXECUTE, i18nKey: 'report.guidance.gov.selfExecute', role },
        { action: AiNextStepAction.APPLY_TONGQIAN_CONSULTING, i18nKey: 'report.guidance.gov.requestTongqian', role },
        { action: AiNextStepAction.REQUEST_EXPERT_CONSULTING, i18nKey: 'report.guidance.gov.requestExpert', role },
      ];
    }
    if (role === AiAudienceRole.EMPLOYEE) {
      return [
        { action: AiNextStepAction.SELF_EXECUTE, i18nKey: 'report.guidance.employee.selfExecute', role },
        { action: AiNextStepAction.REPORT_TO_OWNER, i18nKey: 'report.guidance.employee.reportOwner', role },
      ];
    }
    return [
      { action: AiNextStepAction.SELF_EXECUTE, i18nKey: 'report.guidance.owner.selfExecute', role },
      { action: AiNextStepAction.APPLY_AGENT, highlighted: tier <= AiOutputTier.TIER_2, i18nKey: 'report.guidance.owner.requestAgent', role },
      { action: AiNextStepAction.APPLY_TONGQIAN_CONSULTING, highlighted: tier === AiOutputTier.TIER_3, i18nKey: 'report.guidance.owner.requestTongqian', role },
      { action: AiNextStepAction.REQUEST_HUMAN_REVIEW, i18nKey: 'report.guidance.owner.requestReview', role },
      { action: AiNextStepAction.REQUEST_EXPERT_CONSULTING, i18nKey: 'report.guidance.owner.requestExpert', role },
    ];
  }

  private mustGetReport(id: string): ReportView {
    const report = this.reports.get(id);
    if (!report) throw new Error('REPORT.NOT_FOUND');
    return report;
  }

  private normalizeOutput(dataSnapshot: Record<string, unknown>): Record<string, unknown> & {
    confidence: AiConfidenceLevel;
    disclaimer: string;
    nextStepHint: ReportNextStepHint;
    tier: AiOutputTier;
    traceId: string;
  } {
    return {
      confidence: dataSnapshot.confidence instanceof String ? AiConfidenceLevel.MEDIUM : (dataSnapshot.confidence as AiConfidenceLevel | undefined) ?? AiConfidenceLevel.MEDIUM,
      dataSourceStatement: dataSnapshot.dataSourceStatement ?? 'report.datasource.ai-gateway',
      disclaimer: String(dataSnapshot.disclaimer ?? 'report.disclaimer.ai-reference'),
      nextStepHint: (dataSnapshot.nextStepHint as ReportNextStepHint | undefined) ?? ReportNextStepHint.USE_DIRECTLY,
      tier: (dataSnapshot.tier as AiOutputTier | undefined) ?? AiOutputTier.TIER_1,
      traceId: String(dataSnapshot.traceId ?? crypto.randomUUID()),
      ...dataSnapshot,
    };
  }

  private recordDeviceView(report: ReportView, deviceId?: string): void {
    if (!deviceId || report.deviceLimit === 0) return;
    const devices = this.viewDevices.get(report.id) ?? new Set<string>();
    devices.add(deviceId);
    this.viewDevices.set(report.id, devices);
    if (devices.size > report.deviceLimit) throw new Error('REPORT.ACCESS.DEVICE_LIMIT_EXCEEDED');
  }

  private renderH5(report: ReportView): string {
    const title = this.escape(String(report.dataSnapshot.title ?? 'report.title'));
    const summary = this.escape(String(report.dataSnapshot.summary ?? ''));
    const buttons = report.guidanceButtons.map((button) => `<button data-action="${button.action}">${button.i18nKey}</button>`).join('');
    return `<article data-trace-id="${report.traceId}" data-tier="${report.tier}"><header><strong>${title}</strong></header><section>${summary}</section><aside>${report.radar?.renderedSvg ?? ''}</aside><footer>${buttons}<small>${report.disclaimer}</small></footer></article>`;
  }

  private renderPdfEnvelope(report: ReportView): string {
    return JSON.stringify({
      appendices: report.dataSnapshot.sources ?? [],
      content: this.renderH5(report),
      meta: { brandMode: report.brandMode, generatedAt: report.createdAt, templateVersion: report.templateVersion, traceId: report.traceId },
      watermark: report.watermark,
    });
  }

  private renderRadarSvg(input: { costScore: number; professional: number; riskScore: number; timeHours: number }): string {
    const [professional, time, risk, cost] = [input.professional, input.timeHours * 2.5, input.riskScore, input.costScore].map((value) => Math.min(100, Math.round(value))) as [
      number,
      number,
      number,
      number,
    ];
    return `<svg viewBox="0 0 120 120" role="img" aria-label="report.difficultyRadar"><polygon points="60,${60 - professional / 2} ${60 + time / 2},60 60,${60 + risk / 2} ${60 - cost / 2},60" /></svg>`;
  }

  private requiresAntiPiracy(plan?: string): boolean {
    return plan === 'ent' || plan === 'flag' || plan === 'std';
  }

  private resolveBrand(plan?: string, agentId?: string): ReportBrandMode {
    if (plan === 'flag') return 'co_brand_flagship';
    if ((plan === 'ent' || plan === 'std') && agentId) return 'co_brand_agent';
    return 'standard';
  }

  private uploadAsset(reportId: string, format: 'h5' | 'pdf', content: string): string {
    const digest = Buffer.from(content).toString('base64url').slice(0, 16);
    return `mock://oss/reports/${reportId}.${format}?sig=${digest}&ttl=3600`;
  }

  private validateRequiredElements(output: Record<string, unknown>): void {
    for (const key of ['confidence', 'dataSourceStatement', 'disclaimer', 'nextStepHint', 'tier', 'traceId']) {
      if (!output[key]) throw new Error('REPORT.REQUIRED_ELEMENT_MISSING');
    }
  }

  private escape(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }
}
