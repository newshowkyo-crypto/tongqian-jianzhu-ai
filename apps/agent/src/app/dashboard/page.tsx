'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { Badge, Button, EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, ProgressRing, SectionCard } from '@tongqian/ui';
import Link from 'next/link';

export default function AgentDashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.agent(), queryKey: ['dashboard', 'agent'] });
  const data = query.data;
  return (
    <PageLayout>
      <PageHeader description="派单、信誉、分润和收益日历实时汇总。" title="智能管家工作台" />
      <PageContent className="space-y-6">
        {query.isLoading ? <LoadingState label="正在载入信誉数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="智能管家 dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无信誉和收益数据。" title="暂无数据" /> : null}
        {data ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <SectionCard title="信誉分">
                <div className="flex items-center gap-5">
                  <ProgressRing className="h-36 w-36" value={data.score / 10} />
                  <div><Badge tone="success">{data.level}</Badge><p className="mt-3 text-3xl font-bold">{data.score}</p><p className="text-sm text-neutral-500">距下一级 {data.nextLevelGap} 分</p></div>
                </div>
              </SectionCard>
              <SectionCard title="当月分润">
                <p className="text-4xl font-bold text-amber-700">¥{data.monthCommission.toLocaleString('zh-CN')}</p>
                <p className="mt-2 text-sm text-neutral-500">可接派单 {data.dispatch.available} 个，其中紧急 {data.dispatch.urgent} 个。</p>
                <Link href="/dispatch"><Button className="mt-4">进入派单大厅</Button></Link>
              </SectionCard>
            </section>
            <SectionCard title="收益日历">
              <div className="grid grid-cols-10 gap-2">{data.calendar.days.map((day) => <span key={day.day} className={`rounded-md px-2 py-3 text-center text-xs ${day.settled ? 'bg-amber-50 text-amber-800' : 'bg-neutral-100 text-neutral-500'}`}>{day.day}<br />¥{day.amount}</span>)}</div>
            </SectionCard>
            <SectionCard title="加减分明细">
              <div className="space-y-2">{data.scoreChanges.map((item) => <div key={item.reason} className="flex justify-between rounded-md border border-neutral-200 p-3 text-sm"><span>{item.reason}</span><span className={item.type === 'plus' ? 'text-success-700' : 'text-danger-700'}>{item.amount > 0 ? '+' : ''}{item.amount}</span></div>)}</div>
            </SectionCard>
          </>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
