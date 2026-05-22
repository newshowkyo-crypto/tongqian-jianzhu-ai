import { type ReactNode } from 'react';

import { ConfidenceDots, TierBadge } from '../data-display/index.js';
import { Badge } from '../primitives/data.js';
import { cn } from '../utils.js';

export type AiReportAudience = 'agent' | 'employee' | 'gov' | 'owner';

const audienceActions: Record<AiReportAudience, string[]> = {
  agent: ['按方案执行', '推荐给同乾方略', '平台客服'],
  employee: ['自己执行', '上报 OWNER'],
  gov: ['自己执行', '申请同乾方略', '专家小时咨询'],
  owner: ['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'],
};

export function AiReportFooter({
  audience,
  className,
  confidence,
  disclaimer,
  tier,
}: {
  audience: AiReportAudience;
  className?: string;
  confidence: 'high' | 'low' | 'medium';
  disclaimer: ReactNode;
  tier: 1 | 2 | 3 | 4;
}): ReactNode {
  const score: 2 | 3 | 4 = confidence === 'high' ? 4 : confidence === 'medium' ? 3 : 2;
  return (
    <footer className={cn('space-y-4 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] p-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <TierBadge tier={tier} />
        <Badge tone="info">AI 信心度</Badge>
        <ConfidenceDots score={score} />
      </div>
      <div className="flex flex-wrap gap-2">
        {audienceActions[audience].map((action) => (
          <button key={action} className="rounded-md border border-[var(--outline-variant)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]" type="button">
            {action}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-[var(--text-secondary)]">{disclaimer}</p>
    </footer>
  );
}
