'use client';

import type { DispatchOrderRef, ReputationScore, RequiredElements } from '@tongqian/types';
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';

import { ConfidenceDots, ConfidenceIndicator, LevelBadge, ProgressRing, TierBadge, TrafficLight } from '../data-display/index.js';
import { Badge, Progress } from '../primitives/data.js';
import { Card, CardContent, CardHeader } from '../primitives/feedback.js';
import { Button, Input } from '../primitives/form.js';
import { cn } from '../utils.js';

import type { AiAssistantWidgetMessage, AiAssistantWidgetReply } from './ai-assistant-widget.js';

export {
  AiAssistantWidget,
  type AiAssistantWidgetMessage,
  type AiAssistantWidgetProps,
  type AiAssistantWidgetReply,
} from './ai-assistant-widget.js';

export interface OpportunityCardProps {
  className?: string;
  deadline?: ReactNode;
  meta?: ReactNode;
  title: ReactNode;
}

export function OpportunityCard({ className, deadline, meta, title }: OpportunityCardProps): ReactNode {
  return <Card className={cn('transition-shadow duration-200 hover:shadow-md', className)}><CardHeader><h3 className="text-base font-semibold">{title}</h3>{meta ? <p className="text-sm text-neutral-500">{meta}</p> : null}</CardHeader>{deadline ? <CardContent><Badge tone="warning">{deadline}</Badge></CardContent> : null}</Card>;
}

export function RiskFinding({ className, finding, level }: { className?: string; finding: ReactNode; level: ReactNode }): ReactNode {
  return <div className={cn('rounded-md border border-border bg-background p-3 text-sm', className)}><div className="font-medium text-neutral-900">{level}</div><div className="mt-1 text-neutral-600">{finding}</div></div>;
}

export function QualificationCard({ className, expiresAt, name }: { className?: string; expiresAt?: ReactNode; name: ReactNode }): ReactNode {
  return <Card className={className}><CardHeader><h3 className="text-base font-semibold">{name}</h3></CardHeader>{expiresAt ? <CardContent className="text-sm text-neutral-500">{expiresAt}</CardContent> : null}</Card>;
}

export function DispatchCard({ className, order }: { className?: string; order: DispatchOrderRef }): ReactNode {
  return <Card className={className}><CardHeader><h3 className="text-base font-semibold">{order.id}</h3><Badge>{order.status}</Badge></CardHeader><CardContent className="text-sm text-neutral-500">{order.needClass} / {order.poolType}</CardContent></Card>;
}

export function AgentRow({ className, name, reputation }: { className?: string; name: ReactNode; reputation: ReputationScore }): ReactNode {
  return <div className={cn('flex items-center justify-between rounded-md border border-border bg-background p-3', className)}><div className="font-medium">{name}</div><LevelBadge level={reputation.level} /></div>;
}

export function ReportHeader({
  className,
  requiredElements,
  title,
}: {
  className?: string;
  requiredElements: RequiredElements;
  title: ReactNode;
}): ReactNode {
  return <header className={cn('space-y-3 rounded-lg border border-border bg-background p-4', className)}><h1 className="text-xl font-semibold">{title}</h1><div className="flex flex-wrap gap-2"><TierBadge tier={requiredElements.tier} /><ConfidenceIndicator confidence={requiredElements.confidence} /><Badge tone="neutral">{requiredElements.traceId}</Badge></div><p className="text-xs text-neutral-500">{requiredElements.disclaimer}</p></header>;
}

export function ServicePremiumCard({ className, cta, description, title }: { className?: string; cta?: ReactNode; description?: ReactNode; title: ReactNode }): ReactNode {
  return <Card className={className}><CardHeader><h3 className="text-base font-semibold">{title}</h3>{description ? <p className="text-sm text-neutral-600">{description}</p> : null}</CardHeader>{cta ? <CardContent><Button size="sm">{cta}</Button></CardContent> : null}</Card>;
}

export function ContractRiskItem({ className, level, text }: { className?: string; level: 'green' | 'red' | 'yellow'; text: ReactNode }): ReactNode {
  const tone = level === 'red' ? 'border-l-danger-500 bg-danger-50' : level === 'yellow' ? 'border-l-warning-500 bg-warning-50' : 'border-l-success-500 bg-success-50';
  return <article className={cn('rounded-md border border-border border-l-4 p-4 text-sm text-neutral-700', tone, className)}>{text}</article>;
}

export const ServiceShelfCard = ServicePremiumCard;

export function SubscriptionPlanCard({ className, name, price, recommended }: { className?: string; name: ReactNode; price: ReactNode; recommended?: boolean }): ReactNode {
  return (
    <Card className={cn('relative transition-shadow duration-200 hover:shadow-md', recommended && 'border-primary-500 ring-2 ring-primary-100', className)}>
      {recommended ? <Badge className="absolute right-3 top-3" tone="info">推荐</Badge> : null}
      <CardHeader><h3 className="text-base font-semibold">{name}</h3></CardHeader>
      <CardContent><div className="text-2xl font-bold tabular-nums text-accent-700">{price}</div><Button className="mt-4 min-h-11 w-full" variant={recommended ? 'primary' : 'outline'}>选择档位</Button></CardContent>
    </Card>
  );
}

export type AiAssistantRole = 'admin' | 'gov' | 'owner' | 'steward';

const assistantRoleConfig: Record<AiAssistantRole, { accent: string; fullPageHref: string; greeting: string; icon: string; placeholder: string; title: string }> = {
  admin: { accent: 'from-neutral-900 to-neutral-700', fullPageHref: '/assistant', greeting: '??????????????????????????????? SOP?', icon: '?', placeholder: '????????', title: '????' },
  gov: { accent: 'from-red-900 to-primary-900', fullPageHref: '/assistant', greeting: '???????????????? DeepSeek ??????????????', icon: '?', placeholder: '????????????', title: '????' },
  owner: { accent: 'from-primary-500 to-primary-700', fullPageHref: '/chat-hub', greeting: '??????????????????????????????', icon: '?', placeholder: '??????', title: '????' },
  steward: { accent: 'from-rose-600 to-amber-600', fullPageHref: '/assistant', greeting: '?????????????????????????????????????', icon: '?', placeholder: '???????????', title: '?????' },
};

export function AiAssistantBubble({ className, onSend, role = 'owner' }: { className?: string; onSend?: (messages: AiAssistantWidgetMessage[]) => Promise<AiAssistantWidgetReply>; role?: AiAssistantRole }): ReactNode {
  const config = assistantRoleConfig[role];
  const storageKey = `tongqian.aiBubble.${role}`;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [unread, setUnread] = useState(1);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [messages, setMessages] = useState<AiAssistantWidgetMessage[]>([{ content: config.greeting, role: 'assistant' }]);
  const [sending, setSending] = useState(false);
  const quickActions = useMemo(() => (role === 'steward' ? ['??????', '???????', '?????'] : role === 'gov' ? ['???????', '??????', '????'] : role === 'admin' ? ['BR-901 ????', '????', '??????'] : ['????', '????', '????']), [role]);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    if (!raw) return;
    try {
      setPosition(JSON.parse(raw) as { x: number; y: number });
    } catch {
      setPosition({ x: 24, y: 24 });
    }
  }, [storageKey]);

  function persist(next: { x: number; y: number }): void {
    setPosition(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  async function submit(content = draft): Promise<void> {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    const next = [...messages, { content: trimmed, role: 'user' } satisfies AiAssistantWidgetMessage];
    setMessages(next);
    setDraft('');
    setSending(true);
    try {
      const reply = onSend ? await onSend(next) : { content: `${config.title}????${trimmed}?????????????????????`, confidence: 'medium' as const, tier: 2 as const };
      setMessages([...next, { content: reply.content, role: 'assistant' }]);
      setUnread(0);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    void submit();
  }

  return (
    <div className={cn('fixed z-[80]', className)} style={{ bottom: position.y, right: position.x }}>
      {open ? (
        <section className="mb-3 h-[min(520px,calc(100vh-40px))] w-[min(92vw,320px)] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-2xl sm:w-[320px]">
          <header className={`flex items-center justify-between bg-gradient-to-r ${config.accent} px-4 py-3 text-white`}>
            <div><p className="text-sm font-semibold">{config.title}</p><p className="text-xs text-white/75">{role}</p></div>
            <a className="rounded-md border border-white/30 px-2 py-1 text-xs" href={config.fullPageHref}>??</a>
          </header>
          <div className="h-[310px] space-y-3 overflow-y-auto bg-neutral-50 p-3">
            {messages.map((message, index) => <article key={`${message.role}-${index}`} className={cn('rounded-md border px-3 py-2 text-sm leading-6', message.role === 'user' ? 'ml-6 border-primary-100 bg-primary-50' : 'mr-6 border-neutral-200 bg-white')}>{message.content}</article>)}
            {sending ? <p className="text-xs text-neutral-500">????...</p> : null}
          </div>
          <form className="space-y-2 border-t border-neutral-200 p-3" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-1">{quickActions.map((action) => <button key={action} className="rounded-full border border-neutral-200 px-2 py-1 text-xs" onClick={() => void submit(action)} type="button">{action}</button>)}</div>
            <textarea className="min-h-16 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" onChange={(event) => setDraft(event.target.value)} placeholder={config.placeholder} value={draft} />
            <Button className="w-full" disabled={!draft.trim() || sending} size="sm" type="submit">??</Button>
          </form>
        </section>
      ) : null}
      <button
        className={`relative min-h-12 rounded-full bg-gradient-to-r ${config.accent} px-4 text-sm font-semibold text-white shadow-md ring-4 ring-primary-100 transition-transform duration-500 [animation:tq-assistant-pulse_2s_ease-in-out_infinite] hover:scale-105`}
        draggable
        onClick={() => { setOpen((value) => !value); setUnread(0); }}
        onDragEnd={(event) => persist({ x: Math.max(12, window.innerWidth - event.clientX - 24), y: Math.max(12, window.innerHeight - event.clientY - 24) })}
        type="button"
      >
        <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-white/20">{config.icon}</span>{config.title}
        {unread > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger-500 px-1 text-xs text-white">{unread}</span> : null}
      </button>
    </div>
  );
}

export function ReputationGauge({ className, level, score }: { className?: string; level: ReputationScore['level']; score: number }): ReactNode {
  return <div className={cn('flex items-center gap-4 rounded-lg border border-border bg-background p-4', className)}><ProgressRing className="h-32 w-32" value={score} /><div className="space-y-2"><LevelBadge level={level} /><Progress value={(score / 1000) * 100} /></div></div>;
}

export function CheckinCalendar({ className, days = 30 }: { className?: string; days?: number }): ReactNode {
  return <div className={cn('grid grid-cols-10 gap-1 rounded-md border border-border bg-background p-3', className)}>{Array.from({ length: days }).map((_, index) => <span key={index} className={cn('h-4 rounded-sm', index % 6 === 0 ? 'bg-accent-500' : 'bg-primary-100')} />)}</div>;
}

export function LotteryWheel({ className, label = '抽点奖励' }: { className?: string; label?: ReactNode }): ReactNode {
  return <div className={cn('grid aspect-square w-40 place-items-center rounded-full border-8 border-primary-100 bg-white text-center text-sm font-semibold text-primary-700 shadow-sm [animation:tq-wheel-decelerate_800ms_cubic-bezier(0.12,0.74,0.24,1)_both]', className)}>{label}</div>;
}

export function GrowthBuildingLevel({ className, level = 1 }: { className?: string; level?: number }): ReactNode {
  const heights = ['h-8', 'h-11', 'h-14', 'h-16', 'h-20'];
  return <div className={cn('grid grid-cols-5 items-end gap-2 rounded-md border border-border bg-background p-4', className)}>{heights.map((height, index) => <span key={height} className={cn('rounded-t bg-primary-100 transition-all duration-500 [animation:tq-building-unlock_600ms_cubic-bezier(0.2,0.8,0.2,1)_both]', height, index < level ? 'bg-primary-500' : '')} />)}</div>;
}

export function AiReportH5Card({ className, title }: { className?: string; title: ReactNode }): ReactNode {
  return <Card className={cn('mx-auto max-w-[375px] overflow-hidden', className)}><div className="bg-primary-900 p-4 text-white"><h1 className="text-xl font-bold">{title}</h1><TierBadge className="mt-2" tier={2} /></div><CardContent className="space-y-4 pt-4"><ContractRiskItem level="yellow" text="发现需要复核的关键风险。" /><ConfidenceDots score={3} /><p className="text-xs text-neutral-400">AI 生成内容仅供经营决策参考。</p></CardContent></Card>;
}

export function TenderEligibilityCheck({ className, score = 86 }: { className?: string; score?: number }): ReactNode {
  return <Card className={className}><CardHeader><h3 className="text-base font-semibold">投标资格检查</h3></CardHeader><CardContent className="space-y-3"><Progress value={score} /><Badge tone={score >= 80 ? 'success' : 'warning'}>{score}% 匹配</Badge></CardContent></Card>;
}

export function RiskMonitorCard({ className, level = 'yellow' }: { className?: string; level?: 'green' | 'red' | 'yellow' }): ReactNode {
  return <Card className={cn('border-l-4', level === 'red' ? 'border-l-danger-500' : level === 'yellow' ? 'border-l-warning-500' : 'border-l-success-500', className)}><CardHeader><h3 className="text-base font-semibold">风险监控</h3></CardHeader><CardContent className="flex items-center gap-3"><TrafficLight value={level} /><span className="text-sm text-neutral-600">已开启月度红线监控</span></CardContent></Card>;
}

export function DispatchQuoteCard({ className, quote }: { className?: string; quote: number }): ReactNode {
  const value = quote <= 1800 ? 'green' : quote <= 3600 ? 'yellow' : 'red';
  return <div className={cn('space-y-2 rounded-md border border-border bg-background p-4', className)}><Input type="number" value={quote} readOnly /><div className="flex items-center gap-2 text-sm"><TrafficLight value={value} />报价健康度</div></div>;
}
