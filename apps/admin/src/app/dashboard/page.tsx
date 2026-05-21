'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, Progress, SectionCard, StatCard } from '@tongqian/ui';

export default function AdminDashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.admin(), queryKey: ['dashboard', 'admin'] });
  const data = query.data;
  return (
    <PageLayout>
      <PageHeader description="AARRR、红线指标和模型路由健康。" title="平台运营看板" />
      <PageContent className="space-y-6">
        {query.isLoading ? <LoadingState label="正在载入运营数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="admin dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无运营数据。" title="暂无数据" /> : null}
        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="DAU" value={data.metrics.dau.toLocaleString('zh-CN')} />
              <StatCard label="WAU" value={data.metrics.wau.toLocaleString('zh-CN')} />
              <StatCard label="MAU" value={data.metrics.mau.toLocaleString('zh-CN')} />
            </section>
            <SectionCard title="AARRR 漏斗">
              <div className="grid gap-3 md:grid-cols-5">{data.aarrr.map((item) => <div key={item.label} className="rounded-md border border-neutral-200 p-4"><p className="text-sm text-neutral-500">{item.label}</p><p className="text-2xl font-bold">{item.value.toLocaleString('zh-CN')}</p><Progress className="mt-3" value={(item.value / (data.aarrr[0]?.value ?? 1)) * 100} /></div>)}</div>
            </SectionCard>
            <section className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="红线指标">{data.redLines.map((item) => <div key={item.code} className="mb-3 flex items-center justify-between rounded-md border border-neutral-200 p-3"><span>{item.code}</span><Badge tone={item.status === 'green' ? 'success' : 'warning'}>{item.value}</Badge></div>)}</SectionCard>
              <SectionCard title="AI 调用 / 模型路由健康"><p className="text-2xl font-bold">{data.ai.routeHealth}</p><p className="mt-2 text-sm text-neutral-500">DeepSeek: {data.ai.deepseek} / 延迟 {data.ai.latencyMs}ms / mock fallback {String(data.ai.mockFallback)}</p></SectionCard>
            </section>
          </>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
