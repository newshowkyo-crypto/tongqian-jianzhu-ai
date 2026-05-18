export type AssistantIntent =
  | 'business_document'
  | 'contract_risk'
  | 'finance_kpi'
  | 'industry_policy'
  | 'qualification'
  | 'small_talk'
  | 'tender';
export type AssistantPersonality = 'academic' | 'brotherly' | 'housekeeper' | 'strict';
export type GeneratedDocType = 'business_letter' | 'meeting_minutes' | 'reminder_letter' | 'work_report';

export interface AssistantQueryView {
  aiTaskId: string;
  createdAt: string;
  id: string;
  intent: AssistantIntent;
  question: string;
  queryTemplate?: string;
  resultData: Record<string, unknown>;
  userId: string;
}

export interface GeneratedDocumentView {
  aiTaskId: string;
  content: string;
  createdAt: string;
  docType: GeneratedDocType | string;
  id: string;
  pdfUrl?: string;
  tenantId: string;
  userId: string;
}

export interface AssistantStreakView {
  currentStreak: number;
  lastChatAt?: string;
  longestStreak: number;
  rewardClaims: Array<{ claimedAt: string; reward: string }>;
  unlockedTags: string[];
  userId: string;
}

export interface InspirationCardView {
  cardContent: { action: string; intelligence: string };
  id: string;
  pushedAt: string;
  triggerReason: string;
  userAction?: 'clicked' | 'closed_forever' | 'dismissed' | 'viewed';
  userId: string;
}
