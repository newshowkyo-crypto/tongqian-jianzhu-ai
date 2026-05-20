import type { DispatchOrderRef, ReputationScore, RequiredElements } from '@tongqian/types';
import { type ReactNode } from 'react';

import { ConfidenceDots, ConfidenceIndicator, LevelBadge, ProgressRing, TierBadge, TrafficLight } from '../data-display/index.js';
import { Badge, Progress } from '../primitives/data.js';
import { Card, CardContent, CardHeader } from '../primitives/feedback.js';
import { Button, Input } from '../primitives/form.js';
import { cn } from '../utils.js';

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

export function AiAssistantBubble({ className, label = 'AI 助理' }: { className?: string; label?: ReactNode }): ReactNode {
  return <Button className={cn('fixed bottom-6 right-6 min-h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-5 shadow-md transition-transform duration-500 [animation:tq-assistant-pulse_2s_ease-in-out_infinite] hover:scale-105', className)}>{label}</Button>;
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
