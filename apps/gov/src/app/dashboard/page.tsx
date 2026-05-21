'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, Progress, SectionCard } from '@tongqian/ui';

export default function GovDashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.gov(), queryKey: ['dashboard', 'gov'] });
  const data = query.data;
  return (
    <PageLayout>
      <PageHeader description="政策订阅、资金匹配和公文待办统一看板。" title="政企工作台" />
      <PageContent className="space-y-6 text-[18px]">
        {query.isLoading ? <LoadingState label="正在载入政企数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="政企 dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无政策订阅。" title="暂无数据" /> : null}
        {data ? (
          <section className="grid gap-4 lg:grid-cols-3">
            <SectionCard title="政策订阅">{data.subscriptions.map((item) => <div key={item.title} className="mb-3 rounded-md border border-neutral-200 p-4"><Badge tone="info">{item.level}</Badge><p className="mt-2 font-semibold">{item.title}</p></div>)}</SectionCard>
            <SectionCard title="资金匹配推送">{data.fundMatches.map((item) => <div key={item.title} className="mb-4 rounded-md border border-neutral-200 p-4"><p className="font-semibold">{item.title}</p><p className="text-sm text-neutral-500">{item.amount}</p><Progress className="mt-3" value={item.score} /></div>)}</SectionCard>
            <SectionCard title="公文待写">{data.documents.map((item) => <div key={item.title} className="mb-3 rounded-md border border-neutral-200 p-4"><p className="font-semibold">{item.title}</p><p className="text-sm text-red-800">{item.due}</p></div>)}</SectionCard>
          </section>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
