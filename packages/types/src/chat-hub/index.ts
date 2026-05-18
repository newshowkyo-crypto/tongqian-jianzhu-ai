export type ChatChannel = 'api' | 'desktop' | 'gov' | 'web' | 'wechat' | 'work_wechat';

export type ChatRole = 'assistant' | 'system' | 'user';

export type ChatIntent =
  | 'contract_review'
  | 'kpi_query'
  | 'policy_qa'
  | 'project_tenderability'
  | 'qualification_check'
  | 'reminder_letter'
  | 'small_talk';

export interface ChatContext {
  channel: ChatChannel;
  projectId?: string;
  scopeType: 'platform' | 'project' | 'tenant';
  tenantId: string;
  userId: string;
}

export interface ChatConversationView {
  channel: ChatChannel;
  id: string;
  lastAt: string;
  status: 'active' | 'archived';
  title: string;
}

export interface ChatMessageView {
  content: string;
  createdAt: string;
  id: string;
  intent?: ChatIntent;
  role: ChatRole;
  triggeredTaskId?: string;
}

export interface ChatMemoryView {
  recentMessages: ChatMessageView[];
  summary: string;
}

export interface ChatDispatchResult {
  followUpButtons: string[];
  redirectUrl?: string;
  replyText: string;
  triggeredTaskId?: string;
}

export interface ChatSendResult {
  assistantMessage: ChatMessageView;
  conversation: ChatConversationView;
  dispatch: ChatDispatchResult;
  intent: ChatIntent;
  memory: ChatMemoryView;
  userMessage: ChatMessageView;
}
