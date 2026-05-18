import { Injectable } from '@nestjs/common';
import type { AddictionHookView, BuildingLevelView, CheckinView, LotteryDrawView, OnboardingProgressView, UrgencyPushView } from '@tongqian/types';

const HOOKS: AddictionHookView[] = [
  { code: '12.1', enabled: true, group: 'A_DAILY_INFO', name: '老板早报', phase: 1, redLines: ['min_5_items', 'has_numbers', 'has_source', 'no_ad'] },
  { code: '12.2', enabled: true, group: 'A_DAILY_INFO', name: '行业宏观仪表盘', phase: 2, redLines: ['daily_update', 'source_required'] },
  { code: '12.3', enabled: true, group: 'A_DAILY_INFO', name: '政策快报闪现', phase: 2, redLines: ['fresh_5min', 'impact_required'] },
  { code: '12.4', enabled: true, group: 'B_DAILY_PLAY', name: '今日机会卡/风险红灯', phase: 1, redLines: ['daily_cap_5_3'] },
  { code: '12.5', enabled: true, group: 'B_DAILY_PLAY', name: '每日招标盲盒', phase: 1, redLines: ['score_required', 'one_click_tender'] },
  { code: '12.6', enabled: true, group: 'B_DAILY_PLAY', name: '标书员每日真题', phase: 1, redLines: ['real_case', 'four_options', 'legal_case_advice'] },
  { code: '12.7', enabled: true, group: 'B_DAILY_PLAY', name: '金句日历', phase: 1, redLines: ['local_relevance', 'shareable'] },
  { code: '12.8', enabled: true, group: 'C_WEEKLY_WALLET', name: '本省同行 PK 排行', phase: 2, redLines: ['real_data', 'daily_cap_3'] },
  { code: '12.9', enabled: true, group: 'C_WEEKLY_WALLET', name: '限时惊喜抽点', phase: 1, redLines: ['tue_fri_only', 'anti_abuse'] },
  { code: '12.10', enabled: true, group: 'D_MONTHLY', name: '月度经营成长报告', phase: 2, redLines: ['five_kpis', 'three_todos', 'two_suggestions'] },
  { code: '12.11', enabled: true, group: 'D_MONTHLY', name: '建筑能力等级', phase: 2, redLines: ['separate_from_agent_reputation'] },
  { code: '12.12', enabled: true, group: 'E_SILENT', name: '公众号每日内容矩阵', phase: 1, redLines: ['eight_templates', 'no_spam'] },
  { code: '12.13', enabled: true, group: 'E_SILENT', name: '节点式紧迫感推送', phase: 1, redLines: ['daily_cap_3', 'merge_priority'] },
  { code: 'S1', enabled: true, group: 'F_AGENT_ONLY', name: '收益日历', phase: 1, redLines: ['agent_only', 'statement_required'] },
  { code: 'S2', enabled: true, group: 'F_AGENT_ONLY', name: '客户健康度仪表', phase: 2, redLines: ['agent_only', 'renewal_countdown'] },
  { code: 'S3', enabled: true, group: 'F_AGENT_ONLY', name: '案例市场', phase: 2, redLines: ['agent_only', 'review_required'] },
];

const ONBOARDING_STEPS = ['complete_profile', 'first_chat', 'upload_document', 'follow_preferences', 'connect_agent'];

@Injectable()
export class AddictionService {
  private readonly checkins = new Map<string, CheckinView[]>();
  private readonly draws = new Set<string>();
  private readonly levels = new Map<string, BuildingLevelView>();
  private readonly onboarding = new Map<string, OnboardingProgressView>();
  private readonly urgencyLogs = new Map<string, string[]>();

  checkin(userId: string): CheckinView {
    const date = new Date().toISOString().slice(0, 10);
    const existing = this.checkins.get(userId) ?? [];
    const already = existing.find((item) => item.date === date);
    if (already) return already;
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const previous = existing.find((item) => item.date === yesterday);
    const streakDays = (previous?.streakDays ?? 0) + 1;
    const rewardCredits = [7, 14, 30, 90].includes(streakDays) ? 100 + streakDays * 10 : 10;
    const unlockedRewards = [7, 14, 30, 90].filter((day) => streakDays >= day).map((day) => `checkin.reward.${day}`);
    const next = { date, rewardCredits, streakDays, unlockedRewards, userId };
    this.checkins.set(userId, [...existing, next]);
    return next;
  }

  streak(userId: string): CheckinView {
    return (this.checkins.get(userId) ?? []).at(-1) ?? { date: new Date().toISOString().slice(0, 10), rewardCredits: 0, streakDays: 0, unlockedRewards: [], userId };
  }

  drawLottery(userId: string, now = new Date()): LotteryDrawView {
    const day = now.getDay();
    if (day !== 2 && day !== 5) return { allowed: false, animationMs: 800, reason: 'ADDICT.LOTTERY.NOT_ACTIVE' };
    const eventId = now.toISOString().slice(0, 10);
    const key = `${userId}:${eventId}`;
    if (this.draws.has(key)) return { allowed: false, animationMs: 800, reason: 'ADDICT.LOTTERY.ALREADY_DRAWN' };
    this.draws.add(key);
    const prizeValue = `${[500, 800, 1200, 3000, 5000][Math.abs(this.hash(userId + eventId)) % 5]} credits`;
    return { allowed: true, animationMs: 800, prizeType: 'credits', prizeValue };
  }

  upcomingLottery(): Record<string, unknown> {
    return { animationMs: 800, prizePool: ['500 credits', '1200 credits', 'physical_coupon', '5000 credits'], schedule: ['tuesday', 'friday'] };
  }

  addBuildingExp(tenantId: string, exp: number): BuildingLevelView {
    const current = this.levels.get(tenantId) ?? { exp: 0, level: 1, tenantId, unlockedFeatures: ['basic_report'] };
    const nextExp = current.exp + exp;
    const level = Math.min(5, Math.max(1, Math.floor(nextExp / 500) + 1)) as 1 | 2 | 3 | 4 | 5;
    const unlockedFeatures = ['basic_report', ...(level >= 3 ? ['joint_brand_report'] : []), ...(level >= 5 ? ['annual_strategy_brief'] : [])];
    const next = { exp: nextExp, level, tenantId, unlockedFeatures };
    this.levels.set(tenantId, next);
    return next;
  }

  growthReport(tenantId: string): Record<string, unknown> {
    const yearMonth = new Date().toISOString().slice(0, 7);
    return {
      aiTaskId: `growth-${crypto.randomUUID()}`,
      h5Url: `mock://h5/monthly-growth/${tenantId}/${yearMonth}`,
      metrics: { benchmark: 72, opportunities: 5, qualificationHealth: 81, revenue: 1200000, riskEvents: 2 },
      tenantId,
      yearMonth,
    };
  }

  pushUrgency(userId: string, input: { resourceId: string; type: string }): UrgencyPushView {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${userId}:${today}`;
    const logs = this.urgencyLogs.get(key) ?? [];
    if (logs.length >= 3) return { merged: true, priority: 'low', pushed: false, reason: 'ADDICT.URGENCY.DAILY_LIMIT_REACHED', remainingToday: 0, type: input.type };
    this.urgencyLogs.set(key, [...logs, input.resourceId]);
    return { merged: logs.length > 0, priority: logs.length === 0 ? 'high' : 'medium', pushed: true, remainingToday: 2 - logs.length, type: input.type };
  }

  hooks(role: 'AGENT' | 'BUILDING_COMPANY_USER' | 'GOV_USER' | 'PLATFORM'): AddictionHookView[] {
    return HOOKS.filter((hook) => this.isEligible(hook.code, role));
  }

  triggerHook(userId: string, hookCode: string, role: 'AGENT' | 'BUILDING_COMPANY_USER' | 'GOV_USER' | 'PLATFORM'): Record<string, unknown> {
    if (!this.isEligible(hookCode, role)) return { code: hookCode, eligible: false, reason: 'ADDICT.HOOK.GOV_GAME_DISABLED', userId };
    const hook = HOOKS.find((item) => item.code === hookCode);
    const output = this.sampleOutput(hookCode);
    return { code: hookCode, eligible: Boolean(hook), hook, output, userId, validation: this.validateOutput(hookCode, output) };
  }

  shareUnlock(userId: string, resourceType: string, resourceId: string): Record<string, unknown> {
    return { resourceId, resourceType, reward: { credits: 200, redPacketPct: 10 }, unlocked: ['advanced_template'], userId };
  }

  onboardingStatus(userId: string): OnboardingProgressView {
    const current = this.onboarding.get(userId) ?? { checklist: ONBOARDING_STEPS, stepsDone: [], userId };
    this.onboarding.set(userId, current);
    return current;
  }

  completeOnboardingStep(userId: string, step: string): OnboardingProgressView {
    const current = this.onboardingStatus(userId);
    const stepsDone = [...new Set([...current.stepsDone, step])].filter((item) => ONBOARDING_STEPS.includes(item));
    const fullyActivatedAt = stepsDone.length === ONBOARDING_STEPS.length ? (current.fullyActivatedAt ?? new Date().toISOString()) : undefined;
    const rewardClaimedAt = fullyActivatedAt ? (current.rewardClaimedAt ?? new Date().toISOString()) : undefined;
    const next = { ...current, fullyActivatedAt, rewardClaimedAt, stepsDone };
    this.onboarding.set(userId, next);
    return next;
  }

  clearingPreview(kind: 'cash' | 'credits' | 'physical', amount: number): Record<string, unknown> {
    if (kind === 'credits') return { expiresInDays: 90, kind, settlement: 'real_time_gift_credits' };
    if (kind === 'physical') return { kind, monthlyReconcile: true, settlement: 'address_confirmed_by_cs_then_logistics' };
    return { amount, kind, settlement: 'company_bank_transfer', taxWithholdingPct: amount >= 800 ? 20 : 0 };
  }

  private isEligible(hookCode: string, role: 'AGENT' | 'BUILDING_COMPANY_USER' | 'GOV_USER' | 'PLATFORM'): boolean {
    if (role === 'GOV_USER') return ['12.1', '12.3', '12.10', '12.13'].includes(hookCode);
    if (hookCode.startsWith('S')) return role === 'AGENT' || role === 'PLATFORM';
    return true;
  }

  private validateOutput(hookCode: string, output: Record<string, unknown>): Record<string, unknown> {
    if (hookCode === '12.1') {
      const items = Array.isArray(output.items) ? output.items : [];
      return { failures: items.length >= 5 ? [] : ['min_5_items'], passed: items.length >= 5 };
    }
    return { failures: [], passed: true };
  }

  private sampleOutput(hookCode: string): Record<string, unknown> {
    if (hookCode === '12.1') return { items: [1, 2, 3, 4, 5].map((i) => ({ source: `source-${i}`, text: `metric ${i} at 07:30` })) };
    return { action: `addiction.hook.${hookCode}.action`, valueDensityChecked: true };
  }

  private hash(value: string): number {
    return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }
}
