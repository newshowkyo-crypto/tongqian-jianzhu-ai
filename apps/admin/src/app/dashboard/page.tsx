'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, EmptyState, ErrorState, LoadingState, PageContent, PageLayout, SectionCard, StatCard } from '@tongqian/ui';

export default function AdminDashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.admin(), queryKey: ['dashboard', 'admin'] });
  const data = query.data;

  return (
    <PageLayout className="tq-product-surface">
      <PageContent className="relative z-[1] space-y-6">
        <section className="rounded-[28px] bg-[linear-gradient(135deg,#0a1d3d,#142a52)] p-6 text-white shadow-2xl">
          <p className="text-sm text-[#b5bcc8]">平台后台 · 运营健康</p>
          <h1 className="mt-2 text-4xl font-semibold">AARRR、红线指标、模型路由心跳</h1>
        </section>

        {query.isLoading ? <LoadingState label="正在载入运营数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="admin dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无运营数据。" title="暂无数据" /> : null}

        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard label="DAU" value={data.metrics.dau.toLocaleString('zh-CN')} />
              <StatCard label="WAU" value={data.metrics.wau.toLocaleString('zh-CN')} />
              <StatCard label="MAU" value={data.metrics.mau.toLocaleString('zh-CN')} />
              <StatCard label="AI 延迟" value={`${data.ai.latencyMs}ms`} />
            </section>

            <SectionCard className="tq-glass-card" title="AARRR 漏斗动画">
              <div className="grid gap-3 md:grid-cols-5">
                {data.aarrr.map((item, index) => {
                  const pct = (item.value / (data.aarrr[0]?.value ?? 1)) * 100;
                  return <div key={item.label} className="rounded-2xl border border-[#d8dde5] bg-white/80 p-4"><p className="text-sm text-neutral-500">{item.label}</p><p className="text-2xl font-bold text-[#0a1d3d]">{item.value.toLocaleString('zh-CN')}</p><div className="mt-4 h-28 origin-bottom rounded-xl bg-[#d8dde5]/50"><div className="h-full origin-bottom rounded-xl bg-[linear-gradient(180deg,#4a8eff,#d99880)]" style={{ animation: `tq-funnel-fill .7s ${index * 120}ms ease both`, transformOrigin: 'bottom', height: `${Math.max(10, pct)}%` }} /></div></div>;
                })}
              </div>
            </SectionCard>

            <section className="grid gap-4 lg:grid-cols-2">
              <SectionCard className="tq-glass-card" title="红线告警条">
                {data.redLines.map((item, index) => <div key={item.code} className={`mb-3 flex items-center justify-between rounded-2xl border p-3 ${item.status === 'green' ? 'border-success-100 bg-success-50' : 'tq-pulse-danger border-danger-100 bg-danger-50'}`} style={{ animationDelay: `${index * 120}ms` }}><span className="font-semibold text-[#0a1d3d]">{item.code}</span><Badge tone={item.status === 'green' ? 'success' : 'warning'}>{item.value}</Badge></div>)}
              </SectionCard>
              <SectionCard className="tq-glass-card" title="模型路由健康">
                {['deepseek-reasoner', 'qwen3-max', 'qwen3-vl-max'].map((model) => <div key={model} className="mb-3 flex items-center justify-between rounded-2xl border border-[#d8dde5] bg-white/80 p-3"><span className="font-semibold text-[#0a1d3d]">{model}</span><span className="flex items-center gap-2 text-sm text-success-700"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-success-500" />healthy</span></div>)}
                <p className="mt-3 text-sm text-neutral-500">{data.ai.routeHealth}</p>
              </SectionCard>
            </section>
          </>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
