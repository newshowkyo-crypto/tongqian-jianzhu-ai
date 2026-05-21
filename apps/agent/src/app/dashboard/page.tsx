'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, Button, EmptyState, ErrorState, LoadingState, PageContent, PageLayout, ProgressRing, SectionCard } from '@tongqian/ui';
import Link from 'next/link';

const dispatchCards = ['市政道路合同复核', '学校维修报价协助', '园区厂房资料跑办'];

export default function AgentDashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.agent(), queryKey: ['dashboard', 'agent'] });
  const data = query.data;

  return (
    <PageLayout className="tq-product-surface">
      <PageContent className="relative z-[1] space-y-6">
        <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="tq-glass-card rounded-[28px] p-6">
            <p className="text-sm text-neutral-500">智能管家工作台</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#0a1d3d]">信誉、收益和派单一屏掌控</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">平台展示的是可交付、可审计、可复盘的接单能力。</p>
          </div>
          <div className="tq-particles rounded-[28px] bg-[linear-gradient(135deg,#0a1d3d,#1e3a6f)] p-6 text-white shadow-2xl">
            <div className="relative z-[1] grid gap-4 md:grid-cols-3">
              {dispatchCards.map((item, index) => <article key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><p className="text-xs text-[#d8dde5]">高匹配派单 0{index + 1}</p><h2 className="mt-2 font-semibold">{item}</h2><p className="mt-4 text-xs text-[#b5bcc8]">匹配分 {92 - index * 4} · 5s 轮播</p></article>)}
            </div>
          </div>
        </section>

        {query.isLoading ? <LoadingState label="正在载入信誉数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="智能管家 dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无信誉和收益数据。" title="暂无数据" /> : null}

        {data ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <SectionCard className="tq-glass-card" title="信誉分">
                <div className="flex items-center gap-5">
                  <ProgressRing className="h-40 w-40" value={data.score} />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#1e3a6f,#d99880)] text-sm font-bold text-white shadow-lg">{data.level}</span>
                      <Badge tone="info">{data.level}</Badge>
                    </div>
                    <p className="mt-3 text-4xl font-bold text-[#0a1d3d]">{data.score}</p>
                    <p className="text-sm text-neutral-500">距下一级 {data.nextLevelGap} 分</p>
                  </div>
                </div>
              </SectionCard>
              <SectionCard className="tq-glass-card" title="当月分润">
                <p className="text-5xl font-bold tabular-nums text-[#d99880]">¥{data.monthCommission.toLocaleString('zh-CN')}</p>
                <p className="mt-2 text-sm text-neutral-500">可接派单 {data.dispatch.available} 个，其中紧急 {data.dispatch.urgent} 个。</p>
                <Link href="/dispatch"><Button className="mt-5">进入派单大厅</Button></Link>
              </SectionCard>
            </section>

            <SectionCard className="tq-glass-card" title="收益日历">
              <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
                {data.calendar.days.map((day) => <span key={day.day} className="group relative rounded-xl border border-[#d8dde5] bg-white/80 px-2 py-3 text-center text-xs tabular-nums hover:border-[#d99880]"><span>{day.day}</span><br />¥{day.amount}<span className="pointer-events-none absolute bottom-full left-1/2 hidden -translate-x-1/2 rounded-lg bg-[#0a1d3d] px-3 py-2 text-white shadow-lg group-hover:block">当日{day.settled ? '已结算' : '待结算'}</span></span>)}
              </div>
            </SectionCard>
          </>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
