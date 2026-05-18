import type { RequiredElements } from '@tongqian/types';
import { ReputationLevel } from '@tongqian/types';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

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
    <Card className={cn('transition-shadow duration-200 hover:shadow-md', className)} {...props}>
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
  [ReputationLevel.LV4]: 'border border-accent-500 bg-accent-50 text-accent-700',
  [ReputationLevel.LV5]: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm',
};

export function LevelBadge({ className, level }: { className?: string; level: ReputationLevel }): ReactNode {
  return <span className={cn('inline-flex rounded-md px-2 py-1 text-xs font-semibold', levelClassName[level], className)}>{level}</span>;
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

export function CreditDisplay({ className, credits, verbose = false }: { className?: string; credits: number; verbose?: boolean }): ReactNode {
  return (
    <span className={cn('tabular-nums font-medium', className)}>
      {credits.toLocaleString('zh-CN')}
      {verbose ? <span className="ml-1 text-xs text-neutral-500">({(credits / 100).toFixed(2)})</span> : null}
    </span>
  );
}

export function MoneyDisplay({ amount, className, currency = 'CNY' }: { amount: number; className?: string; currency?: string }): ReactNode {
  return <span className={cn('tabular-nums font-medium', className)}>{new Intl.NumberFormat('zh-CN', { currency, style: 'currency' }).format(amount)}</span>;
}

export function RelativeTime({ className, date }: { className?: string; date: Date | string }): ReactNode {
  const value = typeof date === 'string' ? new Date(date) : date;
  return <time className={cn('text-sm text-neutral-500', className)} dateTime={value.toISOString()}>{value.toLocaleString('zh-CN')}</time>;
}
