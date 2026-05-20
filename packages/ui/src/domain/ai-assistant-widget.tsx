'use client';

import { type FormEvent, type ReactNode, useMemo, useRef, useState } from 'react';

import { Badge } from '../primitives/data.js';
import { Button, Textarea } from '../primitives/form.js';
import { cn } from '../utils.js';

export interface AiAssistantWidgetMessage {
  content: string;
  role: 'assistant' | 'user';
}

export interface AiAssistantWidgetReply {
  buttons?: string[];
  confidence?: 'high' | 'low' | 'medium';
  content: string;
  tier?: 1 | 2 | 3 | 4;
}

export interface AiAssistantWidgetProps {
  className?: string;
  fullPageHref?: string;
  greeting?: string;
  label?: ReactNode;
  onSend: (messages: AiAssistantWidgetMessage[]) => Promise<AiAssistantWidgetReply>;
  placeholder?: string;
  roleLabel?: string;
}

export function AiAssistantWidget({
  className,
  fullPageHref,
  greeting = '我是同乾 AI 经营助手，可以帮您梳理合同风险、机会判断、资质路径和今日待办。',
  label = 'AI 助手',
  onSend,
  placeholder = '输入您想追问的经营问题',
  roleLabel = '经营助手',
}: AiAssistantWidgetProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [quickActions, setQuickActions] = useState<string[]>(['今日风险', '合同付款', '机会速读']);
  const [messages, setMessages] = useState<AiAssistantWidgetMessage[]>([
    { content: greeting, role: 'assistant' },
  ]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const latestAssistant = useMemo(() => [...messages].reverse().find((item) => item.role === 'assistant'), [messages]);

  async function submit(content = draft): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;
    const nextMessages = [...messages, { content: trimmed, role: 'user' } satisfies AiAssistantWidgetMessage];
    setDraft('');
    setError('');
    setMessages(nextMessages);
    setIsSending(true);
    try {
      const reply = await onSend(nextMessages);
      setQuickActions(reply.buttons?.slice(0, 5) ?? quickActions);
      setMessages([...nextMessages, { content: reply.content, role: 'assistant' }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'AI 服务暂时不可用，请稍后重试。');
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    void submit();
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-[70]', className)}>
      {open ? (
        <section className="mb-3 w-[min(92vw,390px)] overflow-hidden rounded-lg border border-primary-100 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-neutral-200 bg-primary-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-primary-100">{roleLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {fullPageHref ? (
                <a className="rounded-md border border-primary-200 px-2 py-1 text-xs text-primary-50 hover:bg-primary-800" href={fullPageHref}>
                  打开工作台
                </a>
              ) : null}
              <button aria-label="关闭 AI 助手" className="grid h-8 w-8 place-items-center rounded-md hover:bg-primary-800" onClick={() => setOpen(false)} type="button">
                ×
              </button>
            </div>
          </header>
          <div className="max-h-[52vh] space-y-3 overflow-y-auto bg-neutral-50 p-4">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm leading-6 shadow-sm',
                  message.role === 'user'
                    ? 'ml-8 border-primary-100 bg-primary-50 text-primary-950'
                    : 'mr-8 border-neutral-200 bg-white text-neutral-800',
                )}
              >
                {message.content}
              </article>
            ))}
            {isSending ? <p className="text-sm text-neutral-500">正在调用 DeepSeek 分析...</p> : null}
            {error ? <p className="rounded-md border border-danger-100 bg-danger-50 px-3 py-2 text-sm text-danger-700">{error}</p> : null}
          </div>
          <div className="border-t border-neutral-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  className="min-h-9 rounded-full border border-neutral-200 px-3 text-xs text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                  disabled={isSending}
                  onClick={() => void submit(action)}
                  type="button"
                >
                  {action}
                </button>
              ))}
            </div>
            <form className="space-y-2" onSubmit={handleSubmit}>
              <Textarea
                ref={inputRef}
                className="min-h-[84px] resize-none"
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                value={draft}
              />
              <div className="flex items-center justify-between gap-3">
                <Badge tone="info">{latestAssistant ? '上下文已载入' : '新会话'}</Badge>
                <Button disabled={!draft.trim() || isSending} type="submit">
                  {isSending ? '发送中' : '发送'}
                </Button>
              </div>
            </form>
          </div>
        </section>
      ) : null}
      <Button
        aria-label="打开 AI 助手"
        className="min-h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-5 shadow-md ring-4 ring-primary-100 transition-transform duration-500 [animation:tq-assistant-pulse_2s_ease-in-out_infinite] hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {label}
      </Button>
    </div>
  );
}
