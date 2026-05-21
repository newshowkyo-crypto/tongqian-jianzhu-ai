'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { AlertTriangle, AnimatedNumber, Bell, Button, CreditDisplay, EmptyState, ErrorState, LoadingState, OpportunityCard, PageContent, PageLayout, Radar, RiskBadge, SectionCard, StatCard, Wallet } from '@tongqian/ui';

const reportCards = ['合同付款节点风险复核', '政策资金窗口 3 条', '资质证书到期提醒'];

export default function DashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.owner(), queryKey: ['dashboard', 'owner-kpi'] });
  const data = query.data;
  const now = new Date();

  return (
    <PageLayout className="tq-product-surface">
      <PageContent className="relative z-[1] space-y-6">
        <section className="tq-particles overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0a1d3d,#142a52_58%,#1e3a6f)] p-6 text-white shadow-2xl">
          <div className="relative z-[1] flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-[#d8dde5]">同乾方略 · 建筑 AI 经营管家</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-5xl">早安，今日先看机会、风险和现金流</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d8dde5]">{data?.greeting ?? '正在整理今日经营简报，AI 会把机会、风险、审批和点数余额压缩到一个首屏。'}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-right backdrop-blur">
              <p className="text-xs text-[#b5bcc8]">当前时间</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="mt-1 text-xs text-[#d8dde5]">{now.toLocaleDateString('zh-CN')} · 今日 3 个经营节点</p>
            </div>
          </div>
        </section>

        {query.isLoading ? <LoadingState label="正在载入经营数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无经营数据。" title="暂无数据" /> : null}

        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard icon={<Radar />} label="今日机会" trend={<span className="text-success-700">{data.kpis.opportunities.trend}</span>} value={<AnimatedNumber end={data.kpis.opportunities.value} />} />
              <StatCard className="tq-pulse-danger" icon={<AlertTriangle />} label="风险红灯" trend={<span className="text-danger-700">{data.kpis.riskRed.trend}</span>} value={<AnimatedNumber end={data.kpis.riskRed.value} />} />
              <StatCard icon={<Bell />} label="待办审批" trend={<span>{data.kpis.approvals.trend}</span>} value={<AnimatedNumber end={data.kpis.approvals.value} />} />
              <StatCard icon={<Wallet />} label="点数余额" trend={<span>{data.kpis.credits.trend}</span>} value={<CreditDisplay credits={data.kpis.credits.value} />} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              <SectionCard className="tq-glass-card" title="今日机会推送">
                <div className="space-y-3">
                  {data.opportunities.map((item) => (
                    <OpportunityCard key={item.title} className="group border-l-4 border-l-[#d99880]" deadline={item.deadline} meta={item.meta} title={<span className="flex items-center justify-between gap-3">{item.title}<Button className="opacity-0 transition-opacity group-hover:opacity-100" size="sm">一键申请</Button></span>} />
                  ))}
                </div>
              </SectionCard>
              <SectionCard className="tq-glass-card bg-gradient-to-br from-red-50 to-white" title="风险红灯">
                <div className="space-y-3">
                  {data.risks.map((risk) => (
                    <article key={risk.title} className="tq-pulse-danger rounded-xl border border-danger-100 bg-gradient-to-r from-danger-50 to-white p-4">
                      <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-[#0a1d3d]">{risk.title}</h3><p className="mt-1 text-sm text-neutral-600">{risk.detail}</p></div><RiskBadge level={risk.level} /></div>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard className="tq-glass-card" title="昨日 AI 报告速览">
              <div className="tq-snap-row pb-2">
                {[...data.reports, ...reportCards].map((report) => (
                  <article key={report} className="min-w-[260px] rounded-2xl border border-[#d8dde5] bg-white/80 p-4 text-sm text-neutral-700 shadow-sm">
                    <p className="font-semibold text-[#0a1d3d]">{report}</p>
                    <p className="mt-3 text-xs text-neutral-500">已生成可执行建议、证据缺口和下一步按钮。</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </>
        ) : null}
      </PageContent>
    </PageLayout>
  );
}
