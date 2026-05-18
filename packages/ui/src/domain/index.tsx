import type { DispatchOrderRef, ReputationScore, RequiredElements } from '@tongqian/types';
import { type ReactNode } from 'react';

import { ConfidenceIndicator, LevelBadge, TierBadge } from '../data-display/index.js';
import { Badge } from '../primitives/data.js';
import { Card, CardContent, CardHeader } from '../primitives/feedback.js';
import { Button } from '../primitives/form.js';
import { cn } from '../utils.js';

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
