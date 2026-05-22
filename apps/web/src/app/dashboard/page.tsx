'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import { AlertTriangle, Bell, Button, CreditDisplay, EmptyState, ErrorState, LoadingState, OpportunityCard, PageContent, PageLayout, Radar, RiskBadge, SectionCard, StatCard, Wallet } from '@tongqian/ui';
import Link from 'next/link';

const reportCards = ['合同付款节点风险复核', '政策资金窗口 3 条', '资质证书到期提醒'];
const journeySteps = [
  { href: '/opportunities', text: '看 18 条今日机会，匹配 80 分以上优先跟进' },
  { href: '/tenders', text: '选定 3 个机会，进入招标中心做资格自查' },
  { href: '/contracts', text: '资格通过后，上传合同草稿做付款与违约风险审查' },
  { href: '/dispatch', text: '红灯风险解决不了，进入派单大厅找智能管家线下跑腿' },
  { href: '/reports', text: '完成后在报告中心生成本周经营复盘' },
];

export default function DashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.owner(), queryKey: ['dashboard', 'owner-kpi'] });
  const data = query.data;
  const now = new Date();

  return (
    <PageLayout className="tq-product-surface">
      <PageContent className="relative z-[1] space-y-6">
        <section className="overflow-hidden rounded-xl border border-[var(--border-silver)] bg-[var(--surface)] p-6 text-[var(--text-primary)] shadow-md">
          <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">同乾方略 · 建筑 AI 经营管家</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-3xl">早安，今日先看机会、风险和现金流</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{data?.greeting ?? '正在整理今日经营简报，AI 会把机会、风险、审批和点数余额压缩到一个首屏。'}</p>
            </div>
            <div className="rounded-xl border border-[var(--border-silver)] bg-[var(--surface-muted)] p-4 text-right">
              <p className="text-xs text-[var(--text-secondary)]">当前时间</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{now.toLocaleDateString('zh-CN')} · 今日 3 个经营节点</p>
            </div>
          </div>
        </section>

        {query.isLoading ? <LoadingState label="正在载入经营数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无经营数据。" title="暂无数据" /> : null}

        {data ? (
          <>
            <SectionCard
              actions={<Link href="/opportunities"><Button>立即开始第 1 步</Button></Link>}
              className="tq-glass-card"
              title="今日推荐路径：从“机会雷达”开始"
            >
              <div className="grid gap-4 md:grid-cols-5">
                {journeySteps.map((step, index) => (
                  <Link
                    key={step.href}
                    className="rounded-md border border-[var(--border-silver)] bg-[var(--surface)] p-4 text-sm text-[var(--text-primary)] transition hover:border-[var(--accent-rose)] hover:shadow-md"
                    href={step.href}
                  >
                    <span className="block text-xs font-semibold text-[var(--accent)]">第 {index + 1} 步</span>
                    <span className="mt-2 block leading-6">{step.text}</span>
                  </Link>
                ))}
              </div>
            </SectionCard>

            <section className="grid gap-4 md:grid-cols-4">
              <StatCard icon={<Radar />} label="今日机会" trend={<span className="text-success-700">{data.kpis.opportunities.trend}</span>} value={data.kpis.opportunities.value} />
              <StatCard className="tq-pulse-danger" icon={<AlertTriangle />} label="风险红灯" trend={<span className="text-danger-700">{data.kpis.riskRed.trend}</span>} value={data.kpis.riskRed.value} />
              <StatCard icon={<Bell />} label="待办审批" trend={<span>{data.kpis.approvals.trend}</span>} value={data.kpis.approvals.value} />
              <StatCard icon={<Wallet />} label="点数余额" trend={<span>{data.kpis.credits.trend}</span>} value={<CreditDisplay credits={data.kpis.credits.value} />} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              <SectionCard className="tq-glass-card" title="今日机会推荐">
                <div className="space-y-4">
                  {data.opportunities.map((item) => (
                    <OpportunityCard key={item.title} className="group border-l-4 border-l-rose-main" deadline={item.deadline} meta={item.meta} title={<span className="flex items-center justify-between gap-4">{item.title}<Button className="opacity-0 transition-opacity group-hover:opacity-100" size="sm">一键申请</Button></span>} />
                  ))}
                </div>
              </SectionCard>
              <SectionCard className="tq-glass-card bg-gradient-to-br from-red-50 to-white" title="风险红灯">
                <div className="space-y-4">
                  {data.risks.map((risk) => (
                    <article key={risk.title} className="tq-pulse-danger rounded-xl border border-danger-100 bg-gradient-to-r from-danger-50 to-white p-4">
                      <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-navy-deepest">{risk.title}</h3><p className="mt-1 text-sm text-neutral-600">{risk.detail}</p></div><RiskBadge level={risk.level} /></div>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </section>

            <SectionCard className="tq-glass-card" title="昨日 AI 报告速览">
              <div className="tq-snap-row pb-2">
                {[...data.reports, ...reportCards].map((report) => (
                  <article key={report} className="min-w-[260px] rounded-xl border border-silver-light bg-white/80 p-4 text-sm text-neutral-700 shadow-sm">
                    <p className="font-semibold text-navy-deepest">{report}</p>
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
