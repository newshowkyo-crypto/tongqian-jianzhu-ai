import { Injectable } from '@nestjs/common';
import type { AssistantIntent, AssistantPersonality, AssistantQueryView, AssistantStreakView, GeneratedDocumentView, GeneratedDocType, InspirationCardView } from '@tongqian/types';

@Injectable()
export class OpsToolkitService {
  private readonly docs = new Map<string, GeneratedDocumentView>();
  private readonly inspirationCards = new Map<string, InspirationCardView[]>();
  private readonly personalities = new Map<string, { currentPersonality: AssistantPersonality; lastSwitchedAt?: string; switchHistory: string[] }>();
  private readonly policyPrefs = new Map<string, { levels: string[]; pushEnabled: boolean; topics: string[] }>();
  private readonly queries = new Map<string, AssistantQueryView>();
  private readonly streaks = new Map<string, AssistantStreakView>();

  runAssistant(input: { question: string; tenantId: string; userId: string }): AssistantQueryView {
    const intent = this.classifyIntent(input.question);
    const resultData = this.dispatchIntent(intent, input.question, input.tenantId);
    const queryTemplate = intent === 'finance_kpi' ? 'top_profit_project_by_period' : undefined;
    const query: AssistantQueryView = {
      aiTaskId: `ops-assistant-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
      intent,
      question: input.question,
      queryTemplate,
      resultData,
      userId: input.userId,
    };
    this.queries.set(query.id, query);
    this.trackStreak(input.userId);
    this.maybePushInspiration(input.userId, input.question, intent);
    return query;
  }

  generateDocument(input: { docType: GeneratedDocType | string; payload: Record<string, unknown>; tenantId: string; userId: string }): GeneratedDocumentView {
    const content = [`ops.doc.${input.docType}.opening`, JSON.stringify(input.payload), `ops.doc.${input.docType}.closing`].join('\n');
    const doc: GeneratedDocumentView = {
      aiTaskId: `ops-doc-${crypto.randomUUID()}`,
      content,
      createdAt: new Date().toISOString(),
      docType: input.docType,
      id: crypto.randomUUID(),
      pdfUrl: `mock://oss/ops-docs/${crypto.randomUUID()}.pdf?ttl=3600`,
      tenantId: input.tenantId,
      userId: input.userId,
    };
    this.docs.set(doc.id, doc);
    return doc;
  }

  transcribe(input: { audioSizeMb: number; url: string }): { text: string; url: string } {
    if (input.audioSizeMb > 100) throw new Error('OPS.AUDIO.TOO_LARGE');
    return { text: 'ops.audio.transcript.placeholder', url: input.url };
  }

  policyImpact(tenantId: string, policyId: string): Record<string, unknown> {
    return {
      actions: ['policy.action.checkQualification', 'policy.action.scanProjects', 'policy.action.prepareApplication'],
      aiTaskId: `policy-impact-${crypto.randomUUID()}`,
      impactSummary: 'policy.impact.placeholder',
      policyId,
      tenantId,
    };
  }

  updatePolicyPreferences(tenantId: string, input: { levels: string[]; pushEnabled: boolean; topics: string[] }): Record<string, unknown> {
    this.policyPrefs.set(tenantId, input);
    return { tenantId, ...input };
  }

  financeTool(kind: 'ar_aging' | 'cashflow' | 'financing', payload: Record<string, unknown>): Record<string, unknown> {
    if (kind === 'ar_aging') return { agingBuckets: { d0_60: 120000, d60_90: 80000, d90Plus: 240000 }, riskScore: 72 };
    if (kind === 'cashflow') return { forecastMonths: [3, 6, 12], pressure: 'medium', source: payload };
    return { bridgeToSpec19: true, eligible: Number(payload.receivableCny ?? 0) >= 5_000_000 };
  }

  businessTool(kind: 'client_memo' | 'invitation_letter' | 'tender_prep', payload: Record<string, unknown>): Record<string, unknown> {
    return { content: `ops.business.${kind}.placeholder`, payload };
  }

  documentClerk(kind: 'archive_catalog' | 'completeness_check' | 'personnel_form_batch', payload: Record<string, unknown>): Record<string, unknown> {
    return { kind, result: `ops.documentClerk.${kind}.placeholder`, unlockPlan: '499+', payload };
  }

  legalTool(kind: 'consult' | 'monthly_review', payload: Record<string, unknown>): Record<string, unknown> {
    return kind === 'consult' ? { answer: 'ops.legal.consult.placeholder', costCredits: 100, payload } : { green: 8, red: 1, yellow: 3 };
  }

  peerIntel(userId: string): InspirationCardView {
    return this.createInspiration(userId, 'peer-intel', 'ops.peerIntel.localRealData.placeholder');
  }

  weeklyReport(tenantId: string): Record<string, unknown> {
    return { actions: ['ops.weekly.action1', 'ops.weekly.action2', 'ops.weekly.action3'], kpis: ['profit', 'cashflow', 'risk', 'opportunity', 'conversion'], tenantId };
  }

  switchPersonality(userId: string, personality: AssistantPersonality): Record<string, unknown> {
    const current = this.personalities.get(userId);
    if (current?.lastSwitchedAt && Date.now() - new Date(current.lastSwitchedAt).getTime() < 7 * 86_400_000) throw new Error('OPS.PERSONALITY.SWITCH_TOO_FREQUENT');
    const next = { currentPersonality: personality, lastSwitchedAt: new Date().toISOString(), switchHistory: [...(current?.switchHistory ?? []), personality] };
    this.personalities.set(userId, next);
    return { userId, ...next };
  }

  getStreak(userId: string): AssistantStreakView {
    return this.streaks.get(userId) ?? { currentStreak: 0, longestStreak: 0, rewardClaims: [], unlockedTags: [], userId };
  }

  listInspirationCards(userId: string): InspirationCardView[] {
    return this.inspirationCards.get(userId) ?? [];
  }

  featureWall(plan: 'ent' | 'flag' | 'lite' | 'std' | 'trial'): Record<string, number | string> {
    return {
      ent: { assistantMonthly: 999999, briefDays: 999, historyDays: 'forever' },
      flag: { assistantMonthly: 999999, briefDays: 999, historyDays: 'forever' },
      lite: { assistantMonthly: 200, briefDays: 20, historyDays: 30 },
      std: { assistantMonthly: 999999, briefDays: 23, historyDays: 90 },
      trial: { assistantMonthly: 50, briefDays: 5, historyDays: 7 },
    }[plan];
  }

  private classifyIntent(question: string): AssistantIntent {
    const text = question.toLowerCase();
    if (text.includes('资质') || text.includes('证')) return 'qualification';
    if (text.includes('合同') || text.includes('风险')) return 'contract_risk';
    if (text.includes('标书') || text.includes('投标')) return 'tender';
    if (text.includes('政策') || text.includes('专项债')) return 'industry_policy';
    if (text.includes('利润') || text.includes('现金流') || text.includes('应收')) return 'finance_kpi';
    if (text.includes('函') || text.includes('公文') || text.includes('纪要')) return 'business_document';
    return 'small_talk';
  }

  private createInspiration(userId: string, triggerReason: string, intelligence: string): InspirationCardView {
    const card: InspirationCardView = {
      cardContent: { action: 'ops.inspiration.action.placeholder', intelligence },
      id: crypto.randomUUID(),
      pushedAt: new Date().toISOString(),
      triggerReason,
      userId,
    };
    this.inspirationCards.set(userId, [...(this.inspirationCards.get(userId) ?? []), card]);
    return card;
  }

  private dispatchIntent(intent: AssistantIntent, question: string, tenantId: string): Record<string, unknown> {
    const routes: Record<AssistantIntent, string> = {
      business_document: '15.doc-generator',
      contract_risk: '13-risk-review',
      finance_kpi: '15.kpi-whitelist',
      industry_policy: '20-knowledge-system',
      qualification: '14-qualification-guard',
      small_talk: '15.assistant-empathy',
      tender: '12-tender-factory',
    };
    return { answer: `ops.assistant.answer.${intent}`, costCredits: intent === 'small_talk' ? 0 : 10, route: routes[intent], tenantId, whitelistOnly: intent === 'finance_kpi', question };
  }

  private maybePushInspiration(userId: string, question: string, intent: AssistantIntent): void {
    const todaysCards = this.listInspirationCards(userId).filter((card) => card.pushedAt.slice(0, 10) === new Date().toISOString().slice(0, 10));
    if (question.length >= 9 && intent !== 'small_talk' && todaysCards.length === 0) this.createInspiration(userId, 'three-real-topic-lines', `ops.inspiration.${intent}`);
  }

  private trackStreak(userId: string): void {
    const current = this.getStreak(userId);
    const currentStreak = current.currentStreak + 1;
    const unlockedTags = [
      ...current.unlockedTags,
      ...(currentStreak >= 7 ? ['understands_company'] : []),
      ...(currentStreak >= 30 ? ['knows_temper'] : []),
      ...(currentStreak >= 100 ? ['old_partner'] : []),
      ...(currentStreak >= 365 ? ['year_review_365'] : []),
    ];
    this.streaks.set(userId, {
      ...current,
      currentStreak,
      lastChatAt: new Date().toISOString(),
      longestStreak: Math.max(current.longestStreak, currentStreak),
      unlockedTags: [...new Set(unlockedTags)],
    });
  }
}
