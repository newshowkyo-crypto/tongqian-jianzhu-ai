'use client';

import type { ChatConversation } from '@tongqian/api-client';
import { Button, EmptyState, LoadingState } from '@tongqian/ui';

export function ConversationSidebar({
  activeId,
  conversations,
  isLoading,
  onCreate,
  onSelect,
}: {
  activeId: string;
  conversations: ChatConversation[];
  isLoading: boolean;
  onCreate: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-neutral-950">最近 30 条</h2>
        <Button onClick={onCreate} size="sm" variant="outline">
          新建
        </Button>
      </div>
      {isLoading ? <LoadingState label="正在载入会话" /> : null}
      {!isLoading && conversations.length === 0 ? <EmptyState description="第一条消息会自动创建会话。" title="暂无会话" /> : null}
      <div className="space-y-2">
        {conversations.slice(0, 30).map((conversation) => (
          <button
            key={conversation.id}
            className={`min-h-12 w-full rounded-md border px-3 py-2 text-left text-sm ${
              conversation.id === activeId ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
            onClick={() => onSelect(conversation.id)}
            type="button"
          >
            <span className="block truncate font-medium">{conversation.title}</span>
            <span className="text-xs text-neutral-500">{new Date(conversation.lastAt).toLocaleString('zh-CN')}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
