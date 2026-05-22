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
  greeting = '\u6211\u662f\u540c\u4e7e AI \u7ecf\u8425\u52a9\u624b\uff0c\u53ef\u4ee5\u5e2e\u60a8\u68b3\u7406\u5408\u540c\u98ce\u9669\u3001\u673a\u4f1a\u5224\u65ad\u3001\u8d44\u8d28\u8def\u5f84\u548c\u4eca\u65e5\u5f85\u529e\u3002',
  label = 'AI \u52a9\u624b',
  onSend,
  placeholder = '\u8f93\u5165\u60a8\u60f3\u8ffd\u95ee\u7684\u7ecf\u8425\u95ee\u9898',
  roleLabel = '\u7ecf\u8425\u52a9\u624b',
}: AiAssistantWidgetProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [quickActions, setQuickActions] = useState<string[]>(['\u4eca\u65e5\u98ce\u9669', '\u5408\u540c\u4ed8\u6b3e', '\u673a\u4f1a\u901f\u8bfb']);
  const [messages, setMessages] = useState<AiAssistantWidgetMessage[]>([{ content: greeting, role: 'assistant' }]);
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
      setError(sendError instanceof Error ? sendError.message : 'AI \u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002');
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
        <section className="tq-cyber-panel mb-3 w-[min(92vw,390px)] overflow-hidden">
          <header className="flex items-center justify-between border-b border-[var(--border-silver)] bg-[rgba(10,29,61,0.72)] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-[var(--text-secondary)]">{roleLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {fullPageHref ? (
                <a className="rounded-md border border-[var(--border-silver)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent-rose)] hover:text-white" href={fullPageHref}>
                  {'\u6253\u5f00\u5de5\u4f5c\u53f0'}
                </a>
              ) : null}
              <button aria-label="\u5173\u95ed AI \u52a9\u624b" className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/10" onClick={() => setOpen(false)} type="button">
                x
              </button>
            </div>
          </header>
          <div className="max-h-[52vh] space-y-3 overflow-y-auto bg-[rgba(10,29,61,0.42)] p-4">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm leading-6 shadow-sm',
                  message.role === 'user'
                    ? 'ml-8 border-[var(--cyber-blue)] bg-[rgba(74,142,255,0.12)] text-white'
                    : 'mr-8 border-[var(--border-silver)] bg-white/5 text-[var(--text-secondary)]',
                )}
              >
                {message.content}
              </article>
            ))}
            {isSending ? <p className="text-sm text-[var(--text-secondary)]">{'\u6b63\u5728\u8c03\u7528\u56fd\u4ea7\u6a21\u578b\u5206\u6790'}...</p> : null}
            {error ? <p className="rounded-md border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-100">{error}</p> : null}
          </div>
          <div className="border-t border-[var(--border-silver)] bg-[rgba(10,29,61,0.62)] p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  className="min-h-9 rounded-full border border-[var(--border-silver)] px-3 text-xs text-[var(--text-secondary)] hover:border-[var(--accent-rose)] hover:text-white"
                  disabled={isSending}
                  onClick={() => void submit(action)}
                  type="button"
                >
                  {action}
                </button>
              ))}
            </div>
            <form className="space-y-2" onSubmit={handleSubmit}>
              <Textarea ref={inputRef} className="min-h-[84px] resize-none" onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} value={draft} />
              <div className="flex items-center justify-between gap-3">
                <Badge tone="info">{latestAssistant ? '\u4e0a\u4e0b\u6587\u5df2\u8f7d\u5165' : '\u65b0\u4f1a\u8bdd'}</Badge>
                <Button disabled={!draft.trim() || isSending} type="submit">
                  {isSending ? '\u53d1\u9001\u4e2d' : '\u53d1\u9001'}
                </Button>
              </div>
            </form>
          </div>
        </section>
      ) : null}
      <Button
        aria-label="\u6253\u5f00 AI \u52a9\u624b"
        className="min-h-12 rounded-full bg-gradient-to-r from-navy-deepest via-navy-mid to-rose-main px-5 shadow-[var(--shadow-cyber-glow)] ring-1 ring-[var(--border-silver-hover)] transition-transform duration-500 [animation:tq-assistant-pulse_2s_ease-in-out_infinite] hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {label}
      </Button>
    </div>
  );
}
