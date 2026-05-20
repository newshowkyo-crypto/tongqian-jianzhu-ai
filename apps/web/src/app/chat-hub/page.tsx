'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ChatConversation, type ChatMessage } from '@tongqian/api-client';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  SectionCard,
  Textarea,
} from '@tongqian/ui';
import { useEffect, useMemo, useState } from 'react';

const quickPrompts = [
  '请把今天合同、回款、招标机会整理成老板能直接看的 5 条行动建议',
  '这个合同付款节点后置，通常需要关注哪些现金流和证据链风险？',
  '本周有哪些资质、政策资金或招标窗口建议优先处理？',
];

export default function ChatHubPage() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [activeId, setActiveId] = useState<string>('');

  const conversationsQuery = useQuery({
    queryFn: () => apiClient.chatHub.listConversations(),
    queryKey: ['chat-hub', 'conversations'],
  });

  const createConversationMutation = useMutation({
    mutationFn: () => apiClient.chatHub.createConversation('AI 经营助手对话', 'web'),
    onSuccess(conversation) {
      setActiveId(conversation.id);
      void queryClient.invalidateQueries({ queryKey: ['chat-hub', 'conversations'] });
    },
  });

  useEffect(() => {
    const conversations = conversationsQuery.data ?? [];
    if (!activeId && conversations[0]) setActiveId(conversations[0].id);
    if (!activeId && conversationsQuery.isSuccess && conversations.length === 0 && !createConversationMutation.isPending) {
      createConversationMutation.mutate();
    }
  }, [activeId, conversationsQuery.data, conversationsQuery.isSuccess, createConversationMutation]);

  const messagesQuery = useQuery({
    enabled: Boolean(activeId),
    queryFn: () => apiClient.chatHub.listMessages(activeId),
    queryKey: ['chat-hub', 'messages', activeId],
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const conversationId = activeId || (await apiClient.chatHub.createConversation(content.slice(0, 18) || 'AI 经营助手对话', 'web')).id;
      if (!activeId) setActiveId(conversationId);
      return apiClient.chatHub.sendMessage(conversationId, content, 'web');
    },
    onSuccess(result) {
      setDraft('');
      setActiveId(result.conversation.id);
      queryClient.setQueryData<ChatMessage[]>(['chat-hub', 'messages', result.conversation.id], (current = []) => [
        ...current,
        result.userMessage,
        result.assistantMessage,
      ]);
      void queryClient.invalidateQueries({ queryKey: ['chat-hub', 'conversations'] });
    },
  });

  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const activeConversation = useMemo<ChatConversation | undefined>(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations],
  );

  function submit(content = draft): void {
    const trimmed = content.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  }

  return (
    <PageLayout>
      <PageHeader
        description="统一接入 Chat Hub 与 AI Gateway，同步网页、公众号、桌面端和 OpenAPI 对话上下文。"
        title="AI 经营助手"
        actions={<Button onClick={() => createConversationMutation.mutate()}>新建对话</Button>}
      />
      <PageContent className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <SectionCard title="对话列表">
          {conversationsQuery.isLoading ? <LoadingState label="正在载入对话" /> : null}
          {conversationsQuery.isError ? <ErrorState actionLabel="重试" description="对话列表暂时不可用。" title="载入失败" /> : null}
          {!conversationsQuery.isLoading && conversations.length === 0 ? <EmptyState description="发起第一条经营问题后会自动创建对话。" title="暂无对话" /> : null}
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  conversation.id === activeId ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                onClick={() => setActiveId(conversation.id)}
                type="button"
              >
                <span className="block font-medium">{conversation.title}</span>
                <span className="text-xs text-neutral-500">{new Date(conversation.lastAt).toLocaleString('zh-CN')}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={activeConversation?.title ?? '当前对话'}>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="info">DeepSeek 路由</Badge>
            <Badge tone="success">4 要素校验</Badge>
            <Badge tone="neutral">Chat Hub 记忆</Badge>
          </div>
          <div className="min-h-[420px] space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            {messagesQuery.isLoading ? <LoadingState label="正在载入消息" /> : null}
            {messagesQuery.isError ? <ErrorState actionLabel="重试" description="消息暂时不可用。" title="载入失败" /> : null}
            {!messagesQuery.isLoading && messages.length === 0 ? (
              <EmptyState description="可以询问合同风险、机会判断、政策资金、资质升级或今日待办。" title="开始一段经营对话" />
            ) : null}
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[86%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.role === 'user'
                    ? 'ml-auto border-primary-100 bg-primary-50 text-primary-950'
                    : 'border-neutral-200 bg-white text-neutral-800'
                }`}
              >
                <p>{message.content}</p>
                {message.intent ? <p className="mt-2 text-xs text-neutral-500">intent: {message.intent}</p> : null}
              </article>
            ))}
            {sendMutation.isPending ? <p className="text-sm text-neutral-500">AI 正在组织可执行建议...</p> : null}
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="min-h-10 rounded-full border border-neutral-200 px-3 text-sm text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                  disabled={sendMutation.isPending}
                  onClick={() => submit(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <Textarea
              className="min-h-[112px] resize-none"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submit();
              }}
              placeholder="输入经营问题，按 Ctrl/Cmd + Enter 发送"
              value={draft}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-neutral-500">输出仅供经营决策参考，重大事项建议由具备资质的专业人员复核。</p>
              <Button disabled={!draft.trim() || sendMutation.isPending} onClick={() => submit()}>
                {sendMutation.isPending ? '发送中' : '发送'}
              </Button>
            </div>
          </div>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
