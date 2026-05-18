import { Inject, Injectable } from '@nestjs/common';
import type { ArchiveChecklistView, ConstructionLogView, ContactLetterView, ProjectSiteView } from '@tongqian/types';

import { ApprovalEngineService } from '../approval/approval-engine.service.js';

@Injectable()
export class ProjectSiteService {
  private readonly archives = new Map<string, ArchiveChecklistView>();
  private readonly hazardPlans = new Map<string, Record<string, unknown>>();
  private readonly letters = new Map<string, ContactLetterView>();
  private readonly logs = new Map<string, ConstructionLogView[]>();
  private readonly progressPayments = new Map<string, Record<string, unknown>>();
  private readonly projects = new Map<string, ProjectSiteView>();

  constructor(@Inject(ApprovalEngineService) private readonly approvals: ApprovalEngineService) {}

  createProject(input: { name: string; planCode?: string; region?: string; tenantId: string; type?: string; userId: string }): ProjectSiteView {
    this.assertPlan(input.planCode);
    const project: ProjectSiteView = {
      id: crypto.randomUUID(),
      name: input.name,
      pmUserId: input.userId,
      region: input.region,
      startAt: new Date().toISOString(),
      status: 'ongoing',
      tenantId: input.tenantId,
      type: input.type,
    };
    this.projects.set(project.id, project);
    return project;
  }

  dashboard(tenantId: string): Record<string, unknown> {
    const projects = [...this.projects.values()].filter((project) => project.tenantId === tenantId);
    return {
      kpi: { ongoing: projects.length, pendingApprovals: [...this.letters.values()].filter((letter) => letter.status === 'draft').length, reminders: 2 },
      projects,
    };
  }

  addConstructionLog(input: { createdBy: string; photosUrls: string[]; projectId: string; tenantId: string; userInput: string }): ConstructionLogView {
    this.mustGetProject(input.projectId, input.tenantId);
    if (input.photosUrls.length > 20) throw new Error('SITE.PHOTO_LIMIT_EXCEEDED');
    const log: ConstructionLogView = {
      aiSummary: `site.log.summary:${input.userInput}`,
      aiTaskId: `site-log-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy,
      id: crypto.randomUUID(),
      logDate: new Date().toISOString(),
      photosUrls: input.photosUrls,
      projectId: input.projectId,
      tags: [
        { type: 'part', value: 'site.tag.part.placeholder' },
        { type: 'process', value: 'site.tag.process.placeholder' },
      ],
      userInput: input.userInput,
    };
    this.logs.set(input.projectId, [...(this.logs.get(input.projectId) ?? []), log]);
    return log;
  }

  createContactLetter(input: { projectId: string; tenantId: string; type: string }): ContactLetterView {
    const project = this.mustGetProject(input.projectId, input.tenantId);
    const flow = this.approvals.createFlow({ resourceId: input.projectId, resourceType: 'contact_letter', type: 'SITE_CONTACT_LETTER_SEAL' });
    const letter: ContactLetterView = {
      aiTaskId: `site-letter-${crypto.randomUUID()}`,
      approvalFlowId: flow.id,
      content: `site.contactLetter.${input.type}.project:${project.name}`,
      id: crypto.randomUUID(),
      pdfUrl: `mock://oss/site-letters/${crypto.randomUUID()}.pdf?ttl=3600`,
      projectId: input.projectId,
      status: 'draft',
      type: input.type,
    };
    this.letters.set(letter.id, letter);
    return letter;
  }

  progressPayment(input: { completedValueCny: number; period: string; projectId: string; tenantId: string }): Record<string, unknown> {
    this.mustGetProject(input.projectId, input.tenantId);
    const app = {
      aiTaskId: `site-progress-${crypto.randomUUID()}`,
      applicationDocUrl: `mock://oss/progress-payments/${input.projectId}-${input.period}.pdf`,
      completedValueCny: input.completedValueCny,
      id: crypto.randomUUID(),
      linkedContractPaymentNode: 'site.progress.contractNode.placeholder',
      period: input.period,
      projectId: input.projectId,
      status: 'draft',
    };
    this.progressPayments.set(String(app.id), app);
    return app;
  }

  majorHazard(input: { hazardType: string; projectId: string; tenantId: string }): Record<string, unknown> {
    this.mustGetProject(input.projectId, input.tenantId);
    const plan = {
      aiTaskId: `site-hazard-${crypto.randomUUID()}`,
      disclaimer: 'site.majorHazard.disclaimer.requiresExpertReview',
      hazardType: input.hazardType,
      id: crypto.randomUUID(),
      keyRiskPoints: ['site.hazard.risk1', 'site.hazard.risk2'],
      needsExpertReview: true,
      outlineDocUrl: `mock://oss/major-hazard/${input.projectId}.pdf`,
      projectId: input.projectId,
      safetyBriefTemplate: 'site.hazard.safetyBrief.placeholder',
    };
    this.hazardPlans.set(String(plan.id), plan);
    return plan;
  }

  archiveChecklist(input: { projectId: string; projectType: string; region: string; tenantId: string; uploadedItems?: string[] }): ArchiveChecklistView {
    this.mustGetProject(input.projectId, input.tenantId);
    const requiredItems = ['施工日志', '签证单', '验收记录', '材料合格证', '竣工图'];
    const uploadedItems = input.uploadedItems ?? [];
    const checklist: ArchiveChecklistView = {
      aiTaskId: `site-archive-${crypto.randomUUID()}`,
      id: crypto.randomUUID(),
      missingItems: requiredItems.filter((item) => !uploadedItems.includes(item)),
      projectId: input.projectId,
      projectType: input.projectType,
      region: input.region,
      requiredItems,
      uploadedItems,
    };
    this.archives.set(checklist.id, checklist);
    return checklist;
  }

  safetyMonthlyReminder(input: { projectId: string; season?: 'rain' | 'spring'; tenantId: string }): Record<string, unknown> {
    this.mustGetProject(input.projectId, input.tenantId);
    return {
      channel: 'notification_center_only',
      items: ['site.safety.policyUpdate', `site.safety.${input.season ?? 'monthly'}Checklist`, 'site.safety.officerChange'],
      shallNotOccupyHome: true,
    };
  }

  private assertPlan(planCode?: string): void {
    if (planCode && !['ent', 'flag'].includes(planCode)) throw new Error('SITE.SUBSCRIPTION.PLAN_INSUFFICIENT');
  }

  private mustGetProject(id: string, tenantId: string): ProjectSiteView {
    const project = this.projects.get(id);
    if (!project || project.tenantId !== tenantId) throw new Error('SITE.PROJECT_NOT_FOUND');
    return project;
  }
}
