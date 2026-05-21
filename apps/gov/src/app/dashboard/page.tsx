'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, EmptyState, ErrorState, LoadingState, PageContent, PageLayout, Progress, SectionCard } from '@tongqian/ui';

export default function GovDashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.gov(), queryKey: ['dashboard', 'gov'] });
  const data = query.data;

  return (
    <PageLayout className="bg-[linear-gradient(180deg,#f8fafc,#eef3f9)]">
      <PageContent className="space-y-6 text-[18px]">
        <section className="rounded-[24px] border-l-4 border-l-[#8b1e2d] bg-[linear-gradient(135deg,#0a1d3d,#142a52)] p-7 text-white shadow-xl">
          <p className="text-base text-[#d8dde5]">政企工作台 · 国产模型专线</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">政策订阅、资金匹配、公文待写</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-[#d8dde5]">政企版统一使用阿里百炼 qwen3-max，材料不出境，输出报告自动保留水印和审计链路。</p>
        </section>

        {query.isLoading ? <LoadingState label="正在载入政企数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="政企 dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无政策订阅。" title="暂无数据" /> : null}

        {data ? (
          <section className="grid gap-4 lg:grid-cols-3">
            <SectionCard className="tq-glass-card border-t-4 border-t-[#8b1e2d]" title="政策时间线">
              <div className="space-y-4">
                {data.subscriptions.map((item, index) => <div key={item.title} className="relative pl-6"><span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-[#8b1e2d]" /><span className="absolute bottom-[-22px] left-[5px] top-5 w-px bg-[#d8dde5]" /><Badge tone="info">{item.level}</Badge><p className="mt-2 text-[19px] font-semibold text-[#0a1d3d]">{item.title}</p><p className="text-sm text-neutral-500">节点 0{index + 1} · 已纳入政策跟踪</p></div>)}
              </div>
            </SectionCard>
            <SectionCard className="tq-glass-card" title="资金匹配推送">
              {data.fundMatches.map((item) => <div key={item.title} className="mb-4 rounded-2xl border border-[#d8dde5] bg-white/80 p-4"><p className="font-semibold text-[#0a1d3d]">{item.title}</p><p className="text-base text-neutral-500">{item.amount}</p><Progress className="mt-3" value={item.score} /></div>)}
            </SectionCard>
            <SectionCard className="tq-glass-card bg-[linear-gradient(135deg,rgba(255,255,255,.9),rgba(216,221,229,.35))]" title="公文待写">
              {data.documents.map((item) => <div key={item.title} className="mb-3 rounded-2xl border border-[#d8dde5] bg-[repeating-linear-gradient(0deg,rgba(10,29,61,.04)_0_1px,transparent_1px_28px)] p-4"><p className="text-[19px] font-semibold text-[#0a1d3d]">✒ {item.title}</p><p className="mt-2 text-base text-[#8b1e2d]">{item.due}</p></div>)}
            </SectionCard>
          </section>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
