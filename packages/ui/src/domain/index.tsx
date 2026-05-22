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
    <Card className={cn('relative transition-shadow duration-200 hover:shadow-md', recommended && 'border-[var(--accent-rose)] ring-2 ring-[var(--accent-rose-glow)]', className)}>
      {recommended ? <Badge className="absolute right-3 top-3" tone="info">{'\u63a8\u8350'}</Badge> : null}
      <CardHeader><h3 className="text-base font-semibold">{name}</h3></CardHeader>
      <CardContent><div className="text-2xl font-bold tabular-nums text-[var(--accent-rose)]">{price}</div><Button className="mt-4 min-h-11 w-full" variant={recommended ? 'primary' : 'outline'}>{'\u9009\u62e9\u6863\u4f4d'}</Button></CardContent>
    </Card>
  );
}

export type AiAssistantRole = 'admin' | 'gov' | 'owner' | 'steward';

const assistantRoleConfig: Record<AiAssistantRole, { accent: string; fullPageHref: string; greeting: string; icon: string; placeholder: string; roleLabel: string; title: string }> = {
  admin: { accent: 'from-navy-deepest via-navy-mid to-cyber-blue', fullPageHref: '/assistant', greeting: '\u6211\u662f\u8fd0\u8425\u987e\u95ee\uff0c\u53ef\u4ee5\u534f\u52a9\u67e5\u770b\u7ea2\u7ebf\u544a\u8b66\u3001\u53cd\u8585\u7b56\u7565\u3001\u5ba2\u6237\u6210\u529f SOP \u548c\u6a21\u578b\u8def\u7531\u5065\u5eb7\u3002', icon: '\u8fd0', placeholder: '\u8f93\u5165\u8fd0\u8425\u95ee\u9898', roleLabel: '\u5e73\u53f0\u8fd0\u8425', title: '\u8fd0\u8425\u987e\u95ee' },
  gov: { accent: 'from-[#4b0f1b] via-navy-deep to-[#0a1d3d]', fullPageHref: '/assistant', greeting: '\u6211\u662f\u653f\u7b56\u667a\u5e93\u3002\u653f\u4f01\u6750\u6599\u8d70\u56fd\u4ea7\u6a21\u578b\u4e0e\u72ec\u7acb\u5ba1\u8ba1\uff0c\u6570\u636e\u4e0d\u51fa\u5883\u3002', icon: '\u653f', placeholder: '\u8f93\u5165\u653f\u7b56\u6216\u516c\u6587\u95ee\u9898', roleLabel: '\u653f\u4f01\u4e13\u5c5e', title: '\u653f\u7b56\u667a\u5e93' },
  owner: { accent: 'from-navy-deepest via-navy-mid to-rose-main', fullPageHref: '/chat-hub', greeting: '\u6211\u662f\u7ba1\u5bb6\u5c0f\u540c\u3002\u5408\u540c\u3001\u62db\u6807\u3001\u8d44\u8d28\u3001\u8d44\u91d1\u548c\u7ecf\u8425\u98ce\u9669\u90fd\u53ef\u4ee5\u5148\u95ee\u6211\u3002', icon: '\u540c', placeholder: '\u95ee\u6211\u4e00\u4e2a\u7ecf\u8425\u95ee\u9898', roleLabel: '\u5efa\u7b51\u8001\u677f AI \u7ecf\u8425\u7ba1\u5bb6', title: '\u7ba1\u5bb6\u5c0f\u540c' },
  steward: { accent: 'from-navy-deep via-cyber-blue to-rose-main', fullPageHref: '/assistant', greeting: '\u6211\u662f\u6d3e\u5355\u8001\u53f8\u673a\u3002\u62a5\u4ef7\u3001\u8bdd\u672f\u3001\u8dd1\u529e\u548c\u5e73\u53f0\u89c4\u5219\u90fd\u53ef\u4ee5\u95ee\uff0c\u79c1\u4e0b\u7ed5\u5e73\u53f0\u7684\u505a\u6cd5\u4e0d\u63d0\u4f9b\u3002', icon: '\u5355', placeholder: '\u8f93\u5165\u6d3e\u5355\u6216\u62a5\u4ef7\u95ee\u9898', roleLabel: '\u667a\u80fd\u7ba1\u5bb6\u52a9\u624b', title: '\u6d3e\u5355\u8001\u53f8\u673a' },
};

const roleQuickActions: Record<AiAssistantRole, string[]> = {
  admin: ['BR-901 \u544a\u8b66', '\u53cd\u8585\u8c03\u4f18', '\u5ba2\u6237\u6210\u529f SOP'],
  gov: ['\u81ea\u5df1\u6267\u884c', '\u7533\u8bf7\u540c\u4e7e\u65b9\u7565', '\u4e13\u5bb6\u5c0f\u65f6\u54a8\u8be2'],
  owner: ['\u5408\u540c\u98ce\u9669', '\u4eca\u65e5\u673a\u4f1a', '\u8d44\u8d28\u5347\u7ea7'],
  steward: ['\u6309\u65b9\u6848\u6267\u884c', '\u63a8\u8350\u540c\u4e7e\u65b9\u7565', '\u5e73\u53f0\u5ba2\u670d'],
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
  const quickActions = useMemo(() => roleQuickActions[role], [role]);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    if (!raw) return;
    try { setPosition(JSON.parse(raw) as { x: number; y: number }); } catch { setPosition({ x: 24, y: 24 }); }
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
      const reply = onSend ? await onSend(next) : { content: `${config.title}\u5df2\u6536\u5230\uff1a${trimmed}\u3002\u6211\u4f1a\u6309\u540c\u4e7e\u65b9\u7565\u89c4\u5219\u7ed9\u51fa\u53ef\u6267\u884c\u5efa\u8bae\uff0c\u5e76\u9644\u514d\u8d23\u58f0\u660e\u3001Tier \u548c\u4fe1\u5fc3\u5ea6\u3002`, confidence: 'medium' as const, tier: 2 as const };
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
        <section className="tq-cyber-panel mb-3 h-[min(520px,calc(100vh-40px))] w-[min(92vw,340px)] overflow-hidden sm:w-[340px]">
          <header className={`flex items-center justify-between bg-gradient-to-r ${config.accent} px-4 py-3 text-white tq-cyber-scan`}>
            <div><p className="text-sm font-semibold">{config.title}</p><p className="text-xs text-white/75">{config.roleLabel}</p></div>
            <a className="rounded-md border border-white/30 px-2 py-1 text-xs hover:bg-white/10" href={config.fullPageHref}>{'\u5c55\u5f00'}</a>
          </header>
          <div className="h-[310px] space-y-3 overflow-y-auto bg-[rgba(10,29,61,0.42)] p-3">
            {messages.map((message, index) => <article key={`${message.role}-${index}`} className={cn('rounded-md border px-3 py-2 text-sm leading-6 shadow-sm', message.role === 'user' ? 'ml-6 border-[var(--cyber-blue)] bg-[rgba(74,142,255,0.12)] text-white' : 'mr-6 border-[var(--border-silver)] bg-white/5 text-[var(--text-secondary)]')}>{message.content}</article>)}
            {sending ? <p className="text-xs text-[var(--text-secondary)]">{'\u601d\u8003\u4e2d'}...</p> : null}
          </div>
          <form className="space-y-2 border-t border-[var(--border-silver)] p-3" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-1">{quickActions.map((action) => <button key={action} className="rounded-full border border-[var(--border-silver)] bg-white/5 px-2 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent-rose)] hover:text-white" onClick={() => void submit(action)} type="button">{action}</button>)}</div>
            <textarea className="min-h-16 w-full rounded-md border border-[var(--border-silver)] bg-[rgba(10,29,61,0.56)] px-3 py-2 text-sm text-white placeholder:text-[var(--text-tertiary)]" onChange={(event) => setDraft(event.target.value)} placeholder={config.placeholder} value={draft} />
            <Button className="w-full" disabled={!draft.trim() || sending} size="sm" type="submit">{'\u53d1\u9001'}</Button>
          </form>
        </section>
      ) : null}
      <button className={`relative min-h-12 rounded-full bg-gradient-to-r ${config.accent} px-4 text-sm font-semibold text-white shadow-[var(--shadow-cyber-glow)] ring-1 ring-[var(--border-silver-hover)] transition-transform duration-500 [animation:tq-assistant-pulse_2s_ease-in-out_infinite] hover:scale-105`} draggable onClick={() => { setOpen((value) => !value); setUnread(0); }} onDragEnd={(event) => persist({ x: Math.max(12, window.innerWidth - event.clientX - 24), y: Math.max(12, window.innerHeight - event.clientY - 24) })} type="button">
        <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full border border-white/25 bg-white/15 text-xs">{config.icon}</span>{config.title}
        {unread > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger-500 px-1 text-xs text-white">{unread}</span> : null}
      </button>
    </div>
  );
}

export function ReputationGauge({ className, level, score }: { className?: string; level: ReputationScore['level']; score: number }): ReactNode {
  return <div className={cn('flex items-center gap-4 rounded-lg border border-[var(--border-silver)] bg-white/5 p-4', className)}><ProgressRing className="h-32 w-32" value={score} /><div className="space-y-2"><LevelBadge level={level} /><Progress value={(score / 1000) * 100} /></div></div>;
}

export function CheckinCalendar({ className, days = 30 }: { className?: string; days?: number }): ReactNode {
  return <div className={cn('grid grid-cols-10 gap-1 rounded-md border border-[var(--border-silver)] bg-white/5 p-3', className)}>{Array.from({ length: days }).map((_, index) => <span key={index} className={cn('h-4 rounded-sm', index % 6 === 0 ? 'bg-[var(--accent-rose)]' : 'bg-[rgba(74,142,255,0.35)]')} />)}</div>;
}

export function LotteryWheel({ className, label = '\u62bd\u70b9\u5956\u52b1' }: { className?: string; label?: ReactNode }): ReactNode {
  return <div className={cn('grid aspect-square w-40 place-items-center rounded-full border-8 border-[rgba(74,142,255,0.25)] bg-white/5 text-center text-sm font-semibold text-[var(--accent-rose)] shadow-[var(--shadow-cyber-glow)] [animation:tq-wheel-decelerate_800ms_cubic-bezier(0.12,0.74,0.24,1)_both]', className)}>{label}</div>;
}

export function GrowthBuildingLevel({ className, level = 1 }: { className?: string; level?: number }): ReactNode {
  const heights = ['h-8', 'h-11', 'h-14', 'h-16', 'h-20'];
  return <div className={cn('grid grid-cols-5 items-end gap-2 rounded-md border border-[var(--border-silver)] bg-white/5 p-4', className)}>{heights.map((height, index) => <span key={height} className={cn('rounded-t bg-[rgba(74,142,255,0.2)] transition-all duration-500 [animation:tq-building-unlock_600ms_cubic-bezier(0.2,0.8,0.2,1)_both]', height, index < level ? 'bg-[var(--cyber-blue)]' : '')} />)}</div>;
}

export function AiReportH5Card({ className, title }: { className?: string; title: ReactNode }): ReactNode {
  return <Card className={cn('mx-auto max-w-[375px] overflow-hidden', className)}><div className="bg-navy-deepest p-4 text-white"><h1 className="text-xl font-bold">{title}</h1><TierBadge className="mt-2" tier={2} /></div><CardContent className="space-y-4 pt-4"><ContractRiskItem level="yellow" text={'\u53d1\u73b0\u9700\u8981\u590d\u6838\u7684\u5173\u952e\u98ce\u9669\u3002'} /><ConfidenceDots score={3} /><p className="text-xs text-[var(--text-secondary)]">AI {'\u751f\u6210\u5185\u5bb9\u4ec5\u4f9b\u7ecf\u8425\u51b3\u7b56\u53c2\u8003\u3002'}</p></CardContent></Card>;
}

export function TenderEligibilityCheck({ className, score = 86 }: { className?: string; score?: number }): ReactNode {
  return <Card className={className}><CardHeader><h3 className="text-base font-semibold">{'\u6295\u6807\u8d44\u683c\u68c0\u67e5'}</h3></CardHeader><CardContent className="space-y-3"><Progress value={score} /><Badge tone={score >= 80 ? 'success' : 'warning'}>{score}% {'\u5339\u914d'}</Badge></CardContent></Card>;
}

export function RiskMonitorCard({ className, level = 'yellow' }: { className?: string; level?: 'green' | 'red' | 'yellow' }): ReactNode {
  return <Card className={cn('border-l-4', level === 'red' ? 'border-l-danger-500' : level === 'yellow' ? 'border-l-warning-500' : 'border-l-success-500', className)}><CardHeader><h3 className="text-base font-semibold">{'\u98ce\u9669\u76d1\u63a7'}</h3></CardHeader><CardContent className="flex items-center gap-3"><TrafficLight value={level} /><span className="text-sm text-[var(--text-secondary)]">{'\u5df2\u5f00\u542f\u6708\u5ea6\u7ea2\u7ebf\u76d1\u63a7'}</span></CardContent></Card>;
}

export function DispatchQuoteCard({ className, quote }: { className?: string; quote: number }): ReactNode {
  const value = quote <= 1800 ? 'green' : quote <= 3600 ? 'yellow' : 'red';
  return <div className={cn('space-y-2 rounded-md border border-[var(--border-silver)] bg-white/5 p-4', className)}><Input type="number" value={quote} readOnly /><div className="flex items-center gap-2 text-sm"><TrafficLight value={value} />{'\u62a5\u4ef7\u5065\u5eb7\u5ea6'}</div></div>;
}
