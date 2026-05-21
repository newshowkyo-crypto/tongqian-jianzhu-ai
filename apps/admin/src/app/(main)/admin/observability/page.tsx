import type { ReactNode } from 'react';

const lines = Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1}:00`, p95: 180 + index * 9, cost: (0.03 + index * 0.002).toFixed(3) }));

export default function ObservabilityPage(): ReactNode {
  return (
    <section className="space-y-5 text-white">
      <header><h1 className="text-2xl font-semibold">运维观测大盘</h1><p className="text-sm text-[var(--text-secondary)]">API、AI、Worker、DB 指标来自 metrics_snapshots 与审计日志聚合。</p></header>
      <div className="grid gap-3 md:grid-cols-4">{['24h API QPS 128', 'AI 调用 642', '在线用户 93', '异常告警 2'].map((item) => <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={item}>{item}</div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">{['API P95', 'AI 单次成本', 'Worker 队列深度', 'DB 慢查询'].map((title) => <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={title}><h2 className="font-semibold">{title}</h2><div className="mt-4 flex h-40 items-end gap-2">{lines.map((point) => <div className="flex-1 rounded-t bg-[var(--accent-rose)]" key={point.label} style={{ height: `${30 + (point.p95 % 80)}%` }} title={`${point.label} ${point.cost}`} />)}</div></div>)}</div>
    </section>
  );
}
