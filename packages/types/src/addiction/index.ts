export type AddictionHookGroup = 'A_DAILY_INFO' | 'B_DAILY_PLAY' | 'C_WEEKLY_WALLET' | 'D_MONTHLY' | 'E_SILENT' | 'F_AGENT_ONLY';

export type RewardKind = 'cash' | 'credits' | 'physical';

export interface AddictionHookView {
  code: string;
  enabled: boolean;
  group: AddictionHookGroup;
  name: string;
  phase: 1 | 2;
  redLines: string[];
}

export interface CheckinView {
  date: string;
  rewardCredits: number;
  streakDays: number;
  unlockedRewards: string[];
  userId: string;
}

export interface LotteryDrawView {
  allowed: boolean;
  animationMs: 800;
  prizeType?: RewardKind;
  prizeValue?: string;
  reason?: string;
}

export interface BuildingLevelView {
  exp: number;
  level: 1 | 2 | 3 | 4 | 5;
  tenantId: string;
  unlockedFeatures: string[];
}

export interface UrgencyPushView {
  merged: boolean;
  priority: 'high' | 'low' | 'medium';
  pushed: boolean;
  reason?: string;
  remainingToday: number;
  type: string;
}

export interface OnboardingProgressView {
  checklist: string[];
  fullyActivatedAt?: string;
  rewardClaimedAt?: string;
  stepsDone: string[];
  userId: string;
}
