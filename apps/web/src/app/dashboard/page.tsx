'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { AlertTriangle, Bell, CreditDisplay, EmptyState, ErrorState, LoadingState, OpportunityCard, PageContent, PageHeader, PageLayout, Radar, RiskBadge, SectionCard, StatCard, Wallet } from '@tongqian/ui';

export default function DashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.owner(), queryKey: ['dashboard', 'owner-kpi'] });
  const data = query.data;

  return (
    <PageLayout>
      <PageHeader description="同乾方略 · 建筑 AI 经营管家" title="老板首页" />
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-primary-100 bg-primary-900 p-6 text-white shadow-card">
          <p className="text-sm text-accent-500">同乾方略 · 建筑 AI 经营管家</p>
          <h2 className="mt-2 text-2xl font-bold">{data?.greeting ?? '早安，正在载入今日经营简报。'}</h2>
          <p className="mt-2 text-sm text-primary-100">{new Date(data?.generatedAt ?? Date.now()).toLocaleDateString('zh-CN')}</p>
        </section>
        {query.isLoading ? <LoadingState label="正在载入经营数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无经营数据。" title="暂无数据" /> : null}
        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard icon={<Radar />} label="今日机会" trend={<span className="text-success-700">{data.kpis.opportunities.trend}</span>} value={data.kpis.opportunities.value} />
              <StatCard icon={<AlertTriangle />} label="风险红灯" trend={<span className="text-danger-700">{data.kpis.riskRed.trend}</span>} value={data.kpis.riskRed.value} />
              <StatCard icon={<Bell />} label="待办审批" trend={<span>{data.kpis.approvals.trend}</span>} value={data.kpis.approvals.value} />
              <StatCard icon={<Wallet />} label="点数余额" trend={<span>{data.kpis.credits.trend}</span>} value={<CreditDisplay credits={data.kpis.credits.value} />} />
            </section>
            <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <SectionCard title="今日机会推送">
                <div className="space-y-3">{data.opportunities.map((item) => <OpportunityCard key={item.title} className="border-l-4 border-l-primary-500" deadline={item.deadline} meta={item.meta} title={item.title} />)}</div>
              </SectionCard>
              <SectionCard title="风险红灯">
                <div className="space-y-3">{data.risks.map((risk) => <article key={risk.title} className="rounded-lg border border-danger-100 bg-danger-50 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{risk.title}</h3><p className="mt-1 text-sm text-neutral-600">{risk.detail}</p></div><RiskBadge level={risk.level} /></div></article>)}</div>
              </SectionCard>
            </section>
            <SectionCard title="昨日 AI 报告速览">
              <ul className="grid gap-3 md:grid-cols-3">{data.reports.map((report) => <li key={report} className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-700 shadow-sm">{report}</li>)}</ul>
            </SectionCard>
          </>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
