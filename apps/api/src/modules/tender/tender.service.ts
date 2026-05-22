import { Inject, Injectable } from '@nestjs/common';
import { AiAudienceRole, AiConfidenceLevel, AiOutputTier, ReportNextStepHint } from '@tongqian/types';
import type {
  TenderEligibilityView,
  TenderFrameworkView,
  TenderProjectView,
  TenderScorePredictionView,
  TenderSectionDraftView,
  TenderSummaryView,
} from '@tongqian/types';

import { ReportCenterService } from '../report-center/report-center.service.js';
import { RulesService } from '../rule-curation/rules.service.js';
import { StorageService } from '../storage/storage.service.js';

interface CreateTenderProjectInput {
  amountEstimateCny?: number;
  fileSizeMb: number;
  fileType: 'docx' | 'pdf';
  industry?: string;
  name: string;
  region?: string;
  tenantId: string;
  userId: string;
}

@Injectable()
export class TenderService {
  private readonly eligibilities = new Map<string, TenderEligibilityView>();
  private readonly frameworks = new Map<string, TenderFrameworkView>();
  private readonly packages = new Map<string, { createdAt: string; id: string; includedDocs: string[]; pdfUrl: string; projectId: string }>();
  private readonly projects = new Map<string, TenderProjectView>();
  private readonly scorePredictions = new Map<string, TenderScorePredictionView>();
  private readonly sections = new Map<string, TenderSectionDraftView[]>();
  private readonly summaries = new Map<string, TenderSummaryView>();

  constructor(
    @Inject(ReportCenterService) private readonly reportCenter: ReportCenterService,
    @Inject(RulesService) private readonly rules: RulesService,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  createProject(input: CreateTenderProjectInput): TenderProjectView {
    if (input.fileSizeMb > 50) throw new Error('TENDER.FILE.TOO_LARGE');
    const sourceFile = this.storage.registerExternalFile({
      fileName: `${input.name}.${input.fileType}`,
      mimeType: input.fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      purpose: 'tender-parse',
      sizeBytes: Math.max(1, Math.round(input.fileSizeMb * 1024 * 1024)),
      tenantId: input.tenantId,
    });
    const project: TenderProjectView = {
      amountEstimateCny: input.amountEstimateCny,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      industry: input.industry,
      meta: { fileType: input.fileType, virusScan: 'mock-pass' },
      name: input.name,
      region: input.region,
      sourceFileUrl: sourceFile.signedUrl,
      status: 'uploaded',
      tenantId: input.tenantId,
      userId: input.userId,
    };
    this.projects.set(project.id, project);
    return project;
  }

  getProject(id: string, tenantId: string): TenderProjectView {
    const project = this.projects.get(id);
    if (!project || project.tenantId !== tenantId) throw new Error('TENDER.NOT_FOUND');
    return project;
  }

  summarize(projectId: string, tenantId: string): TenderSummaryView {
    const project = this.getProject(projectId, tenantId);
    const matchedRules = this.rules.matchTender(`${project.industry ?? 'construction'} ${project.name}`);
    const keyPoints = Array.from({ length: 10 }, (_, index) => `tender.summary.keyPoint.${index + 1}`);
    const aiTaskId = `tender-summary-${crypto.randomUUID()}`;
    const report = this.reportCenter.createReport({
      aiTaskType: 'tender.summary',
      dataSnapshot: {
        confidence: AiConfidenceLevel.HIGH,
        dataSourceStatement: 'tender.datasource.uploaded-file',
        disclaimer: 'report.disclaimer.ai-reference',
        keyPoints,
        matchedRules,
        nextStepHint: ReportNextStepHint.USE_DIRECTLY,
        sections: [{ content: keyPoints, id: 'summary', title: 'tender.sections.summary' }],
        summary: 'tender.summary.placeholder',
        tier: AiOutputTier.TIER_1,
        title: project.name,
        traceId: crypto.randomUUID(),
      },
      role: AiAudienceRole.OWNER,
      sourceModule: '12-tender-factory',
      sourceTaskId: aiTaskId,
      tenantId,
      userId: project.userId,
    });
    const summary: TenderSummaryView = {
      aiTaskId,
      createdAt: new Date().toISOString(),
      eligibilityReq: ['tender.eligibility.license', 'tender.eligibility.qualification', 'tender.eligibility.safetyPermit'],
      id: crypto.randomUUID(),
      keyPoints,
      projectId,
      reportId: report.id,
      schedule: [
        { date: new Date(Date.now() + 3 * 86_400_000).toISOString(), event: 'tender.schedule.siteVisit' },
        { date: new Date(Date.now() + 14 * 86_400_000).toISOString(), event: 'tender.schedule.submitDeadline' },
      ],
      scoringSummary: [
        { item: 'business', points: 30 },
        { item: 'technical', points: 50 },
        { item: 'price', points: 20 },
      ],
    };
    project.status = 'parsed';
    this.summaries.set(projectId, summary);
    return summary;
  }

  checkEligibility(projectId: string, tenantId: string): TenderEligibilityView {
    const project = this.getProject(projectId, tenantId);
    const missingItems = project.amountEstimateCny && project.amountEstimateCny > 50_000_000 ? ['tender.eligibility.largeProjectPerformance'] : [];
    const result: TenderEligibilityView = {
      aiTaskId: `tender-eligibility-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      missingItems,
      projectId,
      remediation: missingItems.length === 0 ? [] : ['tender.remediation.borrowQualification', 'tender.remediation.requestTongqian'],
      status: missingItems.length === 0 ? 'pass' : 'partial',
    };
    this.eligibilities.set(projectId, result);
    return result;
  }

  generateFramework(projectId: string, tenantId: string, templateCode: TenderFrameworkView['templateCode'] = 'building'): TenderFrameworkView {
    const project = this.getProject(projectId, tenantId);
    const tier = this.resolveTier(project.amountEstimateCny ?? 0);
    this.rules.matchTender(`${project.industry ?? templateCode} ${project.name}`);
    const businessOutline = [
      { keyPoints: ['companyProfile', 'qualification', 'performance'], title: 'tender.framework.business.basic', words: 1800 },
      { keyPoints: ['commitment', 'serviceScope'], title: 'tender.framework.business.commitment', words: 1200 },
    ];
    const technicalOutline = [
      { keyPoints: ['constructionPlan', 'schedule', 'resourcePlan'], title: 'tender.framework.tech.orgDesign', words: tier === AiOutputTier.TIER_3 ? 800 : 3600 },
      { keyPoints: ['quality', 'safety', 'emergency'], title: 'tender.framework.tech.guarantee', words: tier === AiOutputTier.TIER_3 ? 600 : 2600 },
    ];
    const framework: TenderFrameworkView = {
      aiTaskId: `tender-framework-${crypto.randomUUID()}`,
      businessOutline,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      projectId,
      technicalOutline,
      templateCode,
      tier,
    };
    project.status = 'framework_generated';
    this.frameworks.set(projectId, framework);
    return framework;
  }

  writeSection(projectId: string, tenantId: string, sectionKey: string): TenderSectionDraftView {
    const project = this.getProject(projectId, tenantId);
    const tier = this.resolveTier(project.amountEstimateCny ?? 0);
    const version = (this.sections.get(`${projectId}:${sectionKey}`)?.length ?? 0) + 1;
    const draft: TenderSectionDraftView = {
      aiTaskId: `tender-section-${crypto.randomUUID()}`,
      content: tier === AiOutputTier.TIER_3 ? 'tender.section.frameworkOnly' : `tender.section.draft.${sectionKey}.placeholder`,
      createdAt: new Date().toISOString(),
      creditsCost: this.sectionCost(sectionKey),
      id: crypto.randomUUID(),
      projectId,
      sectionKey,
      version,
    };
    const key = `${projectId}:${sectionKey}`;
    this.sections.set(key, [...(this.sections.get(key) ?? []), draft]);
    return draft;
  }

  packageDocuments(projectId: string, tenantId: string): { createdAt: string; id: string; includedDocs: string[]; pdfUrl: string; projectId: string } {
    this.getProject(projectId, tenantId);
    const asset = this.storage.storeGeneratedAsset({ content: JSON.stringify({ projectId, type: 'tender-package' }), extension: 'pdf', reportId: `tender-package-${projectId}`, tenantId });
    const pack = {
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      includedDocs: ['businessLicense', 'qualificationCertificates', 'safetyPermit', 'performances', 'keyStaff'],
      pdfUrl: asset.signedUrl,
      projectId,
    };
    this.packages.set(projectId, pack);
    return pack;
  }

  predictScore(projectId: string, tenantId: string): TenderScorePredictionView {
    const project = this.getProject(projectId, tenantId);
    const predictedScore = Math.min(96, Math.max(55, 88 - (project.amountEstimateCny ?? 0) / 10_000_000));
    const result: TenderScorePredictionView = {
      aiTaskId: `tender-score-${crypto.randomUUID()}`,
      breakdown: [
        { item: 'business', predicted: 26, total: 30 },
        { item: 'technical', predicted: Math.round(predictedScore * 0.5), total: 50 },
        { item: 'price', predicted: 17, total: 20 },
      ],
      id: crypto.randomUUID(),
      improvements: ['tender.score.improve.performanceEvidence', 'tender.score.improve.riskClause'],
      predictedScore: Number(predictedScore.toFixed(2)),
      projectId,
    };
    this.scorePredictions.set(projectId, result);
    return result;
  }

  dispatchTenderWriter(projectId: string, tenantId: string): { dispatchClass: 'A' | 'B' | 'none'; reason: string; target: 'agent_workspace' | 'self' | 'tongqian' } {
    const project = this.getProject(projectId, tenantId);
    const amount = project.amountEstimateCny ?? 0;
    if (amount >= 50_000_000) return { dispatchClass: 'B', reason: 'tender.dispatch.largeProject', target: 'tongqian' };
    if (amount >= 10_000_000) return { dispatchClass: 'A', reason: 'tender.dispatch.writerNeeded', target: 'agent_workspace' };
    return { dispatchClass: 'none', reason: 'tender.dispatch.selfServe', target: 'self' };
  }

  dailyQuiz(day = new Date().toISOString().slice(0, 10)): Record<string, unknown> {
    return {
      costCreditsAfterFirst: 50,
      day,
      explanation: 'tender.quiz.explanation.placeholder',
      options: ['A', 'B', 'C', 'D'],
      question: 'tender.quiz.case.placeholder',
    };
  }

  agentQuoteTool(input: { referencePriceCny: number; serviceDays: number }): { maxAllowedCny: number; recommendedCny: number; requirements: string[] } {
    return {
      maxAllowedCny: input.referencePriceCny * 2,
      recommendedCny: Math.round(input.referencePriceCny * (1 + Math.min(input.serviceDays, 20) / 100)),
      requirements: ['description>=200_chars', 'service_cycle_commitment', 'compensation_commitment'],
    };
  }

  featureWall(plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): Record<string, number | string> {
    return {
      ent: { framework: 999, historyDays: 'forever', reads: 999, sections: 999 },
      flag: { framework: 999, historyDays: 'forever', reads: 999, sections: 999 },
      lite: { framework: 3, historyDays: 30, reads: 5, sections: 30 },
      std: { framework: 999, historyDays: 90, reads: 999, sections: 999 },
      trial: { framework: 1, historyDays: 7, reads: 1, sections: 5 },
    }[plan];
  }

  private resolveTier(amountCny: number): AiOutputTier {
    if (amountCny < 10_000_000) return AiOutputTier.TIER_1;
    if (amountCny < 50_000_000) return AiOutputTier.TIER_2;
    return AiOutputTier.TIER_3;
  }

  private sectionCost(sectionKey: string): number {
    const costs: Record<string, number> = {
      emergency_plan: 300,
      org_design: 800,
      performance: 400,
      project_management: 500,
      quality: 600,
      safety: 400,
    };
    return costs[sectionKey] ?? 500;
  }
}
