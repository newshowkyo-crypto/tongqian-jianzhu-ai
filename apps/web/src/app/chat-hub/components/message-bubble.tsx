'use client';

import { Badge, Button, ConfidenceDots, TierBadge } from '@tongqian/ui';

export interface UiMessage {
  buttons?: string[];
  confidence?: 'high' | 'low' | 'medium';
  content: string;
  id: string;
  role: 'assistant' | 'user';
  tier?: 1 | 2 | 3 | 4;
}

const ownerButtons = ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'];

export function MessageBubble({ message }: { message: UiMessage }) {
  const isUser = message.role === 'user';
  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser ? 'border-primary-100 bg-primary-50 text-primary-950' : 'border-neutral-200 bg-white text-neutral-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser ? (
          <div className="mt-3 space-y-3 border-t border-neutral-100 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">AI 内容仅供经营决策参考</Badge>
              <TierBadge tier={message.tier ?? 2} />
              <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                信心度 <ConfidenceDots score={message.confidence === 'high' ? 4 : message.confidence === 'low' ? 2 : 3} />
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(message.buttons?.length ? message.buttons : ownerButtons).slice(0, 5).map((button) => (
                <Button key={button} size="sm" variant="outline">
                  {button}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
