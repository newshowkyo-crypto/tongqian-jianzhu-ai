import type { RequiredElements } from '@tongqian/types';
import { ReputationLevel } from '@tongqian/types';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { AnimatedNumber } from '../animation/index.js';
import { Badge } from '../primitives/data.js';
import { Card, CardContent } from '../primitives/feedback.js';
import { cn } from '../utils.js';

export interface StatCardProps extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode;
  icon?: ReactNode;
  label: ReactNode;
  trend?: ReactNode;
  value: ReactNode;
}

export function StatCard({ children, className, icon, label, trend, value, ...props }: StatCardProps): ReactNode {
  return (
    <Card className={cn('tq-glass-card transition-shadow duration-200 hover:shadow-md', className)} {...props}>
      <CardContent className="flex items-start justify-between gap-3 pt-4">
        <div className="space-y-1">
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-2xl font-semibold tabular-nums text-neutral-900">{value}</p>
          {trend ? <div className="text-xs text-neutral-500">{trend}</div> : null}
        </div>
        {icon ? <div className="rounded-md bg-primary-50 p-2 text-primary-700">{icon}</div> : null}
      </CardContent>
      {children}
    </Card>
  );
}

export interface KpiCardProps extends Omit<StatCardProps, 'value'> {
  value: number;
}

export function KpiCard({ value, ...props }: KpiCardProps): ReactNode {
  return <StatCard value={<AnimatedNumber end={value} />} {...props} />;
}

export interface TrendCardProps extends StatCardProps {
  chart?: ReactNode;
}

export function TrendCard({ chart, ...props }: TrendCardProps): ReactNode {
  return (
    <StatCard {...props}>
      {chart ? <div className="mt-3 h-16">{chart}</div> : null}
    </StatCard>
  );
}

export type RiskLevel = 'green' | 'red' | 'yellow';

const riskClassName: Record<RiskLevel, string> = {
  green: 'border-success-100 bg-success-50 text-success-700',
  red: 'border-danger-100 bg-danger-50 text-danger-700',
  yellow: 'border-warning-100 bg-warning-50 text-warning-700',
};

export function RiskBadge({ className, level }: { className?: string; level: RiskLevel }): ReactNode {
  return <span className={cn('inline-flex rounded-md border px-2 py-1 text-xs font-medium', riskClassName[level], className)}>{level}</span>;
}

const levelClassName: Record<ReputationLevel, string> = {
  [ReputationLevel.LV1]: 'bg-neutral-100 text-neutral-600',
  [ReputationLevel.LV2]: 'bg-primary-50 text-primary-700',
  [ReputationLevel.LV3]: 'bg-info-50 text-info-700',
  [ReputationLevel.LV4]: 'border border-rose-main bg-rose-main/10 text-rose-deep',
  [ReputationLevel.LV5]: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm',
};

export function LevelBadge({ className, level }: { className?: string; level: ReputationLevel }): ReactNode {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-semibold', levelClassName[level], className)}>{level}</span>;
}

export const AgentLevelBadge = LevelBadge;

export function StatusBadge({ className, status }: { className?: string; status: 'active' | 'canceled' | 'completed' | 'failed' | 'pending' | 'processing' }): ReactNode {
  const tone = status === 'completed' || status === 'active' ? 'success' : status === 'failed' ? 'danger' : status === 'pending' ? 'warning' : 'neutral';
  return <Badge className={className} tone={tone}>{status}</Badge>;
}

export function TierBadge({ className, tier }: { className?: string; tier: RequiredElements['tier'] }): ReactNode {
  return <Badge className={className} tone="info">Tier {tier}</Badge>;
}

export function ConfidenceIndicator({
  className,
  confidence,
}: {
  className?: string;
  confidence: RequiredElements['confidence'];
}): ReactNode {
  const tone = confidence === 'low' ? 'warning' : confidence === 'high' ? 'success' : 'neutral';
  return <Badge className={className} tone={tone}>{confidence}</Badge>;
}

export function ConfidenceDots({ className, score = 3 }: { className?: string; score?: 1 | 2 | 3 | 4 }): ReactNode {
  return (
    <span className={cn('inline-flex gap-1 text-primary-700', className)} aria-label={`confidence ${score} of 4`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} className={cn('h-2 w-2 rounded-full', index < score ? 'bg-primary-600' : 'bg-neutral-200')} />
      ))}
    </span>
  );
}

export function CreditDisplay({ className, credits, verbose = false }: { className?: string; credits: number; verbose?: boolean }): ReactNode {
  return (
    <span className={cn('tabular-nums font-medium', className)}>
      {credits.toLocaleString('zh-CN')}
      {verbose ? <span className="ml-1 text-xs text-neutral-500">({(credits / 100).toFixed(2)})</span> : null}
    </span>
  );
}

export function MoneyDisplay({ amount, className, currency = 'CNY' }: { amount: number; className?: string; currency?: string }): ReactNode {
  const display = Math.abs(amount) >= 100000000 ? `${(amount / 100000000).toFixed(2)} 亿` : Math.abs(amount) >= 10000 ? `${(amount / 10000).toFixed(2)} 万` : new Intl.NumberFormat('zh-CN', { currency, style: 'currency' }).format(amount);
  return <span className={cn('tabular-nums font-medium', className)}>{display}</span>;
}

export function RelativeTime({ className, date }: { className?: string; date: Date | string }): ReactNode {
  const value = typeof date === 'string' ? new Date(date) : date;
  return <time className={cn('text-sm text-neutral-500', className)} dateTime={value.toISOString()} title={value.toLocaleString('zh-CN')}>{value.toLocaleString('zh-CN')}</time>;
}

export function TrafficLight({ className, value }: { className?: string; value: 'green' | 'red' | 'yellow' }): ReactNode {
  return <span className={cn('inline-flex h-3 w-3 rounded-full', value === 'green' ? 'bg-success-500' : value === 'yellow' ? 'bg-warning-500' : 'bg-danger-500', className)} />;
}

export function CountdownTimer({ className, deadline }: { className?: string; deadline: Date | string }): ReactNode {
  const end = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const hours = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 3600000));
  return <span className={cn('tabular-nums text-sm font-medium text-warning-700', className)}>{hours} 小时</span>;
}

export function ProgressRing({ className, max = 1000, value }: { className?: string; max?: number; value: number }): ReactNode {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const dash = `${pct} ${100 - pct}`;
  return (
    <div className={cn('relative grid aspect-square place-items-center text-center tabular-nums', className)}>
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 42 42">
        <circle cx="21" cy="21" fill="none" r="15.9" stroke="#e4e4e7" strokeWidth="4" />
        <circle cx="21" cy="21" fill="none" r="15.9" stroke="url(#tq-ring-gradient)" strokeDasharray={dash} strokeLinecap="round" strokeWidth="4" style={{ animation: 'tq-ring-draw 1.5s cubic-bezier(0.2,0.8,0.2,1) both' }} />
        <defs><linearGradient id="tq-ring-gradient" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#4a8eff" /><stop offset="1" stopColor="#d99880" /></linearGradient></defs>
      </svg>
      <div className="relative grid h-[72%] w-[72%] place-items-center rounded-full bg-white text-xl font-bold text-neutral-900">{value}</div>
    </div>
  );
}
