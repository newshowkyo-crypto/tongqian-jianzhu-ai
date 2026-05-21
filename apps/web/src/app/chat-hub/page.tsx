'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ChatConversation, type ChatMessage } from '@tongqian/api-client';
import { Badge, Button, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard, Textarea } from '@tongqian/ui';
import { useEffect, useMemo, useState } from 'react';

import { ConversationSidebar } from './components/conversation-sidebar';
import { FileUploadButton } from './components/file-upload-button';
import { MessageBubble, type UiMessage } from './components/message-bubble';
import { ownerPersonas, PersonalitySelector, type OwnerPersona, type OwnerPersonaId } from './components/personality-selector';

const quickPrompts = ['今天最该先处理哪 3 件事？', '帮我判断这份合同付款风险。', '本周有什么政策资金窗口？'];

export default function ChatHubPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [activeId, setActiveId] = useState('');
  const [persona, setPersona] = useState<OwnerPersona>(ownerPersonas[0] ?? {
    accent: 'bg-primary-900 text-white',
    avatar: '顾',
    description: '默认严肃顾问',
    id: 'serious',
    model: 'deepseek-reasoner',
    name: '严肃顾问',
    systemPrompt: '先结论、再证据、再动作。',
  });
  const [localMessages, setLocalMessages] = useState<UiMessage[]>([
    {
      buttons: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'],
      confidence: 'medium',
      content: '我是管家小同。您可以切换严肃顾问、温暖管家、干练分析师或资深律师，我会按不同口径帮您做经营判断。',
      id: 'welcome',
      role: 'assistant',
      tier: 1,
    },
  ]);

  const conversationsQuery = useQuery({ queryFn: () => apiClient.chatHub.listConversations(), queryKey: ['chat-hub', 'conversations'] });
  const conversations = conversationsQuery.data ?? [];
  const activeConversation = useMemo<ChatConversation | undefined>(() => conversations.find((item) => item.id === activeId), [activeId, conversations]);

  const createConversationMutation = useMutation({
    mutationFn: () => apiClient.chatHub.createConversation(`管家小同 · ${persona.name}`, 'web'),
    onSuccess(conversation) {
      setActiveId(conversation.id);
      void queryClient.invalidateQueries({ queryKey: ['chat-hub', 'conversations'] });
    },
  });

  useEffect(() => {
    if (!activeId && conversations[0]) setActiveId(conversations[0].id);
  }, [activeId, conversations]);

  const messagesQuery = useQuery({
    enabled: Boolean(activeId),
    queryFn: () => apiClient.chatHub.listMessages(activeId),
    queryKey: ['chat-hub', 'messages', activeId],
  });

  useEffect(() => {
    const serverMessages = messagesQuery.data ?? [];
    if (serverMessages.length > 0) {
      setLocalMessages(serverMessages.map(toUiMessage));
    }
  }, [messagesQuery.data]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const conversationId = activeId || (await apiClient.chatHub.createConversation(content.slice(0, 18) || `管家小同 · ${persona.name}`, 'web')).id;
      if (!activeId) setActiveId(conversationId);
      const aiReply = await apiClient.ai.chat(
        [
          ...localMessages.map((item) => ({ content: item.content, role: item.role })),
          { content: `${persona.systemPrompt}\n<owner_message>${content}</owner_message>`, role: 'user' as const },
        ],
        persona.model === 'deepseek-reasoner' ? 'contract.review.pro' : 'chat.long',
      );
      return { aiReply, conversationId, content };
    },
    onSuccess({ aiReply, conversationId, content }) {
      setDraft('');
      const now = new Date().toISOString();
      setLocalMessages((current) => [
        ...current,
        { content, id: `user-${now}`, role: 'user' },
        {
          buttons: aiReply.buttons,
          confidence: aiReply.confidence,
          content: `[${persona.name}] ${aiReply.message.content}`,
          id: `assistant-${now}`,
          role: 'assistant',
          tier: aiReply.tier,
        },
      ]);
      void apiClient.chatHub.sendMessage(conversationId, content, 'web').catch(() => undefined);
      void queryClient.invalidateQueries({ queryKey: ['chat-hub', 'conversations'] });
    },
  });

  function submit(content = draft): void {
    const trimmed = content.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  }

  return (
    <PageLayout>
      <PageHeader
        actions={<Button onClick={() => createConversationMutation.mutate()}>新建对话</Button>}
        description="四种性格、流式网关入口、文件直审和 5 个老板动作按钮。"
        title="管家小同"
      />
      <PageContent className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <ConversationSidebar
          activeId={activeId}
          conversations={conversations}
          isLoading={conversationsQuery.isLoading}
          onCreate={() => createConversationMutation.mutate()}
          onSelect={setActiveId}
        />
        <div className="space-y-4">
          <SectionCard title="性格选择">
            <PersonalitySelector onChange={setPersona} value={persona.id as OwnerPersonaId} />
          </SectionCard>
          <SectionCard title={activeConversation?.title ?? `当前对话 · ${persona.name}`}>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="info">{persona.model}</Badge>
              <Badge tone="success">4 强制要素</Badge>
              <Badge tone="neutral">Enter 发送 / Shift+Enter 换行</Badge>
            </div>
            <div className="min-h-[460px] space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              {messagesQuery.isLoading ? <LoadingState label="正在载入消息" /> : null}
              {messagesQuery.isError ? <ErrorState actionLabel="重试" description="消息暂时不可用。" title="载入失败" /> : null}
              {localMessages.map((message) => <MessageBubble key={message.id} message={message} />)}
              {sendMutation.isPending ? <p className="text-sm text-neutral-500">DeepSeek 正在按「{persona.name}」口径组织回答...</p> : null}
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => <Button key={prompt} onClick={() => submit(prompt)} size="sm" variant="outline">{prompt}</Button>)}
              </div>
              <Textarea
                className="min-h-[112px] resize-none"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                  }
                }}
                placeholder="输入经营问题，Enter 发送，Shift+Enter 换行"
                value={draft}
              />
              <div className="flex items-center justify-between gap-3">
                <FileUploadButton onPicked={(summary) => setDraft((current) => `${current}\n${summary}`.trim())} />
                <Button disabled={!draft.trim() || sendMutation.isPending} onClick={() => submit()}>
                  {sendMutation.isPending ? '发送中' : '发送'}
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </PageContent>
    </PageLayout>
  );
}

function toUiMessage(message: ChatMessage): UiMessage {
  return {
    confidence: message.role === 'assistant' ? 'medium' : undefined,
    content: message.content,
    id: message.id,
    role: message.role === 'user' ? 'user' : 'assistant',
    tier: message.role === 'assistant' ? 2 : undefined,
  };
}
