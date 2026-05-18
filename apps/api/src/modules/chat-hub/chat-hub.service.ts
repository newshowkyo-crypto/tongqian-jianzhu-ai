import { Injectable } from '@nestjs/common';
import type { ChatChannel, ChatContext, ChatConversationView, ChatDispatchResult, ChatIntent, ChatMemoryView, ChatMessageView, ChatSendResult } from '@tongqian/types';

interface StoredConversation extends ChatConversationView {
  tenantId: string;
  userId: string;
}

interface StoredSummary {
  conversationId: string;
  rangeFrom: string;
  rangeTo: string;
  summary: string;
}

@Injectable()
export class ChatHubService {
  private readonly conversations = new Map<string, StoredConversation>();
  private readonly messages = new Map<string, ChatMessageView[]>();
  private readonly summaries = new Map<string, StoredSummary>();

  createConversation(ctx: ChatContext, title = 'chat.conversation.defaultTitle'): ChatConversationView {
    const now = new Date().toISOString();
    const conversation: StoredConversation = {
      channel: ctx.channel,
      id: crypto.randomUUID(),
      lastAt: now,
      status: 'active',
      tenantId: ctx.tenantId,
      title,
      userId: ctx.userId,
    };
    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);
    return this.toConversationView(conversation);
  }

  listConversations(ctx: ChatContext): ChatConversationView[] {
    return [...this.conversations.values()]
      .filter((item) => item.tenantId === ctx.tenantId && item.userId === ctx.userId)
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
      .slice(0, 50)
      .map((item) => this.toConversationView(item));
  }

  listMessages(conversationId: string, ctx: ChatContext): ChatMessageView[] {
    this.assertConversation(conversationId, ctx);
    return [...(this.messages.get(conversationId) ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  sendMessage(input: { content: string; conversationId?: string; ctx: ChatContext }): ChatSendResult {
    const conversation = input.conversationId ? this.assertConversation(input.conversationId, input.ctx) : this.createConversation(input.ctx, this.titleFrom(input.content));
    const memory = this.getMemory(conversation.id, input.ctx);
    const intent = this.classifyIntent(input.content);
    const dispatch = this.dispatch(intent, input.content, input.ctx);
    const userMessage = this.createMessage('user', input.content, intent);
    const assistantMessage = this.createMessage('assistant', dispatch.replyText, intent, dispatch.triggeredTaskId);
    const nextMessages = [...(this.messages.get(conversation.id) ?? []), userMessage, assistantMessage];
    this.messages.set(conversation.id, nextMessages);
    this.conversations.set(conversation.id, { ...this.assertConversation(conversation.id, input.ctx), lastAt: assistantMessage.createdAt });
    this.refreshSummary(conversation.id, nextMessages);
    return {
      assistantMessage,
      conversation: this.toConversationView(this.assertConversation(conversation.id, input.ctx)),
      dispatch,
      intent,
      memory,
      userMessage,
    };
  }

  ingestChannel(input: { channel: ChatChannel; content: string; externalId: string; tenantId?: string; userId?: string }): ChatSendResult {
    const ctx: ChatContext = {
      channel: input.channel,
      scopeType: 'tenant',
      tenantId: input.tenantId ?? 'mock-tenant',
      userId: input.userId ?? `channel-${input.externalId}`,
    };
    const existing = this.listConversations(ctx).find((item) => item.channel === input.channel);
    return this.sendMessage({ content: input.content, conversationId: existing?.id, ctx });
  }

  streamSnapshot(conversationId: string, ctx: ChatContext): string {
    const latest = this.listMessages(conversationId, ctx).at(-1);
    return `event: message\ndata: ${JSON.stringify(latest ?? { content: 'chat.stream.empty' })}\n\n`;
  }

  private classifyIntent(content: string): ChatIntent {
    const text = content.toLowerCase();
    if (text.includes('contract') || text.includes('合同') || text.includes('风险')) return 'contract_review';
    if (text.includes('催款') || text.includes('收款') || text.includes('remind')) return 'reminder_letter';
    if (text.includes('政策') || text.includes('补贴') || text.includes('fund')) return 'policy_qa';
    if (text.includes('资质') || text.includes('qualification')) return 'qualification_check';
    if (text.includes('投标') || text.includes('项目')) return 'project_tenderability';
    if (text.includes('利润') || text.includes('现金流') || text.includes('kpi')) return 'kpi_query';
    return 'small_talk';
  }

  private dispatch(intent: ChatIntent, content: string, ctx: ChatContext): ChatDispatchResult {
    const routes: Record<ChatIntent, { buttons: string[]; route: string; text: string }> = {
      contract_review: { buttons: ['chat.action.openRiskReview', 'chat.action.uploadContract', 'chat.action.askHuman'], route: '/risk-review', text: 'chat.reply.contractReviewTriggered' },
      kpi_query: { buttons: ['chat.action.openOps', 'chat.action.exportBrief', 'chat.action.askHuman'], route: '/ops', text: 'chat.reply.kpiTriggered' },
      policy_qa: { buttons: ['chat.action.openKnowledge', 'chat.action.subscribePolicy', 'chat.action.askHuman'], route: '/knowledge', text: 'chat.reply.policyTriggered' },
      project_tenderability: { buttons: ['chat.action.openTender', 'chat.action.createTask', 'chat.action.askHuman'], route: '/tender', text: 'chat.reply.tenderTriggered' },
      qualification_check: { buttons: ['chat.action.openQualification', 'chat.action.createChecklist', 'chat.action.askHuman'], route: '/qualification', text: 'chat.reply.qualificationTriggered' },
      reminder_letter: { buttons: ['chat.action.openOps', 'chat.action.generateLetter', 'chat.action.askHuman'], route: '/ops/business/reminder', text: 'chat.reply.reminderTriggered' },
      small_talk: { buttons: ['chat.action.askFollowup', 'chat.action.openWorkspace'], route: '/workspace', text: 'chat.reply.generic' },
    };
    const selected = routes[intent];
    return {
      followUpButtons: ctx.channel === 'gov' ? selected.buttons.slice(0, 3) : selected.buttons,
      redirectUrl: selected.route,
      replyText: `${selected.text}: ${content.slice(0, 80)}`,
      triggeredTaskId: intent === 'small_talk' ? undefined : `chat-task-${crypto.randomUUID()}`,
    };
  }

  private getMemory(conversationId: string, ctx: ChatContext): ChatMemoryView {
    this.assertConversation(conversationId, ctx);
    const all = this.messages.get(conversationId) ?? [];
    return {
      recentMessages: all.slice(-6),
      summary: this.summaries.get(conversationId)?.summary ?? 'chat.memory.noSummary',
    };
  }

  private refreshSummary(conversationId: string, all: ChatMessageView[]): void {
    if (all.length <= 6) return;
    const older = all.slice(0, -6);
    const summary = older
      .map((item) => `${item.role}:${item.intent ?? 'none'}`)
      .join('; ')
      .slice(0, 200);
    this.summaries.set(conversationId, {
      conversationId,
      rangeFrom: older[0]?.createdAt ?? new Date().toISOString(),
      rangeTo: older.at(-1)?.createdAt ?? new Date().toISOString(),
      summary,
    });
  }

  private assertConversation(conversationId: string, ctx: ChatContext): StoredConversation {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.tenantId !== ctx.tenantId || conversation.userId !== ctx.userId) throw new Error('CHAT.CHANNEL.UNAUTHORIZED');
    return conversation;
  }

  private createMessage(role: 'assistant' | 'user', content: string, intent?: ChatIntent, triggeredTaskId?: string): ChatMessageView {
    return { content, createdAt: new Date().toISOString(), id: crypto.randomUUID(), intent, role, triggeredTaskId };
  }

  private titleFrom(content: string): string {
    return content.trim().slice(0, 24) || 'chat.conversation.defaultTitle';
  }

  private toConversationView(conversation: StoredConversation): ChatConversationView {
    return {
      channel: conversation.channel,
      id: conversation.id,
      lastAt: conversation.lastAt,
      status: conversation.status,
      title: conversation.title,
    };
  }
}
