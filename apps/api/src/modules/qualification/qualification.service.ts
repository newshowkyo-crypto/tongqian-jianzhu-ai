import { Inject, Injectable } from '@nestjs/common';
import { AiAudienceRole, AiConfidenceLevel, AiOutputTier, ReportNextStepHint } from '@tongqian/types';
import type {
  KeyPersonnelView,
  QualificationCertView,
  QualificationCheckupView,
  QualificationDispatchDecisionView,
  UpgradePathReportView,
} from '@tongqian/types';

import { ReportCenterService } from '../report-center/report-center.service.js';

@Injectable()
export class QualificationService {
  private readonly certs = new Map<string, QualificationCertView>();
  private readonly checkups = new Map<string, QualificationCheckupView>();
  private readonly personnel = new Map<string, KeyPersonnelView>();
  private readonly performances = new Map<string, Record<string, unknown>>();
  private readonly upgradeReports = new Map<string, UpgradePathReportView>();

  constructor(@Inject(ReportCenterService) private readonly reportCenter: ReportCenterService) {}

  uploadCert(input: { category: string; level: string; rawImageUrl: string; subType?: string; tenantId: string }): QualificationCertView {
    const cert: QualificationCertView = {
      category: input.category,
      certNo: `OCR-${crypto.randomUUID().slice(0, 8)}`,
      id: crypto.randomUUID(),
      issuedAt: new Date(Date.now() - 365 * 86_400_000).toISOString(),
      issuer: 'qualification.issuer.placeholder',
      level: input.level,
      rawImageUrl: input.rawImageUrl,
      status: 'active',
      subType: input.subType,
      tenantId: input.tenantId,
      validUntil: new Date(Date.now() + 180 * 86_400_000).toISOString(),
    };
    this.certs.set(cert.id, cert);
    return cert;
  }

  archive(tenantId: string): { certs: QualificationCertView[]; personnel: KeyPersonnelView[]; performances: Record<string, unknown>[] } {
    return {
      certs: [...this.certs.values()].filter((cert) => cert.tenantId === tenantId),
      personnel: [...this.personnel.values()].filter((item) => item.tenantId === tenantId),
      performances: [...this.performances.values()].filter((item) => item.tenantId === tenantId),
    };
  }

  addPersonnel(input: { certNo: string; certType: string; name: string; role: string; tenantId: string }): KeyPersonnelView {
    const warnings = input.role.toLowerCase().includes('attached') ? ['QUAL.PERSONNEL.ATTACHED_DETECTED'] : [];
    const person: KeyPersonnelView = {
      certNo: input.certNo,
      certType: input.certType,
      certValidUntil: new Date(Date.now() + 240 * 86_400_000).toISOString(),
      complianceWarnings: warnings,
      id: crypto.randomUUID(),
      idCardMasked: '110***********001X',
      isAttached: warnings.length > 0,
      name: input.name,
      role: input.role,
      tenantId: input.tenantId,
    };
    this.personnel.set(person.id, person);
    return person;
  }

  checkup(tenantId: string, userId = 'mock-user'): QualificationCheckupView {
    const certs = this.archive(tenantId).certs;
    const riskPoints = this.expiringItems(tenantId, 90).map((item) => `qualification.risk.expiring:${item.certNo}`);
    const completeness = Math.min(100, 40 + certs.length * 20);
    const validity = Math.max(40, 100 - riskPoints.length * 15);
    const upgradePotential = certs.some((cert) => cert.level.includes('二') || cert.level.toLowerCase().includes('second')) ? 75 : 45;
    const healthScore = Math.round((completeness + validity + upgradePotential) / 3);
    const aiTaskId = `qualification-checkup-${crypto.randomUUID()}`;
    const report = this.reportCenter.createReport({
      aiTaskType: 'qualification.checkup',
      dataSnapshot: {
        confidence: AiConfidenceLevel.MEDIUM,
        dataSourceStatement: 'qualification.datasource.archive-placeholder',
        disclaimer: 'report.disclaimer.ai-reference',
        nextStepHint: ReportNextStepHint.APPLY_HUMAN_REVIEW,
        riskPoints,
        sections: [{ content: { completeness, healthScore, upgradePotential, validity }, id: 'scores', title: 'qualification.sections.checkup' }],
        summary: 'qualification.checkup.summary',
        tier: AiOutputTier.TIER_2,
        title: 'qualification.checkup.title',
        traceId: crypto.randomUUID(),
      },
      role: AiAudienceRole.OWNER,
      sourceModule: '14-qualification-guard',
      sourceTaskId: aiTaskId,
      tenantId,
      userId,
    });
    const result: QualificationCheckupView = {
      aiTaskId,
      completeness,
      createdAt: new Date().toISOString(),
      healthScore,
      id: crypto.randomUUID(),
      reportId: report.id,
      riskPoints,
      tenantId,
      upgradePotential,
      validity,
    };
    this.checkups.set(result.id, result);
    return result;
  }

  upgradePath(input: { category: string; fromLevel: string; tenantId: string; toLevel: string; userId?: string }): UpgradePathReportView {
    const tier = this.upgradeTier(input.fromLevel, input.toLevel);
    const aiTaskId = `qualification-upgrade-${crypto.randomUUID()}`;
    const pathSteps = tier === 3 ? ['qualification.upgrade.organizeOnly', 'qualification.upgrade.consultingSuggested'] : ['performanceGap', 'personnelGap', 'equipmentGap', 'applicationPack'];
    const report = this.reportCenter.createReport({
      aiTaskType: 'qualification.upgrade_path',
      dataSnapshot: {
        confidence: AiConfidenceLevel.MEDIUM,
        dataSourceStatement: 'qualification.datasource.rules-placeholder',
        disclaimer: 'report.disclaimer.ai-reference',
        nextStepHint: tier === 3 ? ReportNextStepHint.APPLY_TONGQIAN_CONSULT : ReportNextStepHint.APPLY_HUMAN_REVIEW,
        sections: [{ content: pathSteps, id: 'path', title: 'qualification.sections.upgradePath' }],
        summary: 'qualification.upgrade.summary',
        tier,
        title: 'qualification.upgrade.title',
        traceId: crypto.randomUUID(),
      },
      role: AiAudienceRole.OWNER,
      sourceModule: '14-qualification-guard',
      sourceTaskId: aiTaskId,
      tenantId: input.tenantId,
      userId: input.userId ?? 'mock-user',
    });
    const result: UpgradePathReportView = {
      aiTaskId,
      category: input.category,
      fromLevel: input.fromLevel,
      gapAnalysis: ['qualification.gap.performance', 'qualification.gap.personnel', 'qualification.gap.safetyLicense'],
      id: crypto.randomUUID(),
      pathSteps,
      reportId: report.id,
      tenantId: input.tenantId,
      tier,
      toLevel: input.toLevel,
    };
    this.upgradeReports.set(result.id, result);
    return result;
  }

  addPerformance(input: { amountCny: number; industry: string; projectName: string; tenantId: string }): Record<string, unknown> {
    const record = {
      contractAmountCny: input.amountCny,
      id: crypto.randomUUID(),
      industry: input.industry,
      matchedQualifications: [`${input.industry}:qualification.placeholder`],
      projectName: input.projectName,
      tenantId: input.tenantId,
    };
    this.performances.set(String(record.id), record);
    return record;
  }

  expiryReminders(tenantId: string): QualificationCertView[] {
    return this.expiringItems(tenantId, 90).slice(0, 3);
  }

  dynamicReview(input: { notice: string; tenantId: string }): { guide: string[]; riskPoints: string[]; tier: 1 | 2 } {
    const hasSevere = input.notice.toLowerCase().includes('rectification');
    return {
      guide: ['qualification.dynamic.materials', 'qualification.dynamic.personnel', 'qualification.dynamic.performance'],
      riskPoints: hasSevere ? ['qualification.dynamic.risk.rectification'] : [],
      tier: hasSevere ? 2 : 1,
    };
  }

  dispatch(input: { amountCny: number; needType: string }): QualificationDispatchDecisionView {
    const highEnd = input.needType.includes('special') || input.needType.includes('merge') || input.amountCny >= 100_000;
    return highEnd ? { class: 'B', reason: 'qualification.dispatch.highEnd', route: 'tongqian_service' } : { class: 'A', reason: 'qualification.dispatch.standard', route: 'agent_workspace' };
  }

  complianceCheck(personnelId: string): { allowedServices: string[]; bannedServices: string[]; personnelId: string; result: 'pass' | 'warning' } {
    const person = this.personnel.get(personnelId);
    return {
      allowedServices: ['real_employment_pool', 'labor_dispatch', 'joint_venture_match'],
      bannedServices: ['certificate_renting', 'fake_social_security', 'performance_fabrication'],
      personnelId,
      result: person?.isAttached ? 'warning' : 'pass',
    };
  }

  serviceOrder(input: { agentId: string; clientId: string; quotedAmountCny: number; servicePeriodDays: number; serviceTerms: string; target: string }): Record<string, unknown> {
    if (input.serviceTerms.length < 200) throw new Error('QUAL.ORDER.SERVICE_TERMS_TOO_SHORT');
    return {
      ...input,
      acceptanceWindowUntil: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      failureCompensationOptions: [30, 50, 100],
      milestones: [
        { name: 'personnel_gap', weight: 30 },
        { name: 'performance_gap', weight: 30 },
        { name: 'final_delivery', weight: 40 },
      ],
      paymentStatus: 'frozen_7d',
    };
  }

  private expiringItems(tenantId: string, days: number): QualificationCertView[] {
    const until = Date.now() + days * 86_400_000;
    return [...this.certs.values()].filter((cert) => cert.tenantId === tenantId && new Date(cert.validUntil).getTime() <= until);
  }

  private upgradeTier(fromLevel: string, toLevel: string): 1 | 2 | 3 {
    const text = `${fromLevel}->${toLevel}`;
    if (text.includes('special') || text.includes('特')) return 3;
    if (text.includes('一') || text.toLowerCase().includes('first')) return 2;
    return 1;
  }
}
