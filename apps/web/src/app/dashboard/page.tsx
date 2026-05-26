'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@tongqian/api-client';
import {
  AlertTriangle,
  Badge,
  Bell,
  Button,
  EmptyState,
  ErrorState,
  FileSearch,
  LoadingState,
  Megaphone,
  PageContent,
  PageLayout,
  Progress,
  Radar,
  RiskBadge,
  SectionCard,
  StatCard,
  Wallet,
} from '@tongqian/ui';
import Link from 'next/link';

const journeySteps = [
  { href: '/opportunities', label: '机会雷达', text: '筛出今日高匹配项目' },
  { href: '/tenders', label: '招标中心', text: '核对资格与废标条款' },
  { href: '/contracts', label: '合同审查', text: '复核付款和违约风险' },
  { href: '/dispatch', label: '派单大厅', text: '找智能管家线下跑腿' },
  { href: '/reports', label: '报告中心', text: '沉淀本周经营复盘' },
] as const;

const actionCards = [
  { label: '本周现金回款', progress: 72, value: '286万' },
  { label: '证照到期窗口', progress: 38, value: '27天' },
  { label: '重点项目履约', progress: 84, value: '安全' },
] as const;

export default function DashboardPage() {
  const query = useQuery({ queryFn: () => apiClient.dashboard.owner(), queryKey: ['dashboard', 'owner-kpi'] });
  const data = query.data;
  const now = new Date();

  return (
    <PageLayout className="bg-[var(--bg)]">
      <PageContent className="space-y-6">
        <section className="overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.45fr_0.75fr] lg:items-end">
            <div className="space-y-4">
              <Badge className="border-[var(--outline-variant)] bg-primary-50 text-primary-700">同乾方略 · 建筑 AI 经营管家</Badge>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Megaphone className="h-4 w-4 text-primary-500" />
                  {now.toLocaleDateString('zh-CN', { month: 'long', weekday: 'long', year: 'numeric' })}
                </p>
                <h1 className="max-w-3xl text-3xl font-semibold leading-9 tracking-normal text-[var(--text-primary)]">早安，先看机会、风险和现金流</h1>
                <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                  {data?.greeting ?? 'AI 已为您汇总今日经营节点，建议先处理红灯风险，再跟进高匹配机会。'}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6">
              <p className="text-xs text-[var(--text-secondary)]">当前时间</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--text-primary)]">{now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">今日 3 个经营节点需要确认</p>
            </div>
          </div>
        </section>

        {query.isLoading ? <LoadingState label="正在载入经营数据" /> : null}
        {query.isError ? <ErrorState actionLabel="重试" description="dashboard API 暂时不可用。" title="载入失败" /> : null}
        {!query.isLoading && !data ? <EmptyState description="暂无经营数据。" title="暂无数据" /> : null}

        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard icon={<Radar className="h-6 w-6" />} label="今日机会" trend={<span className="text-success-700">{data.kpis.opportunities.trend}</span>} value={data.kpis.opportunities.value} />
              <StatCard icon={<AlertTriangle className="h-6 w-6" />} label="风险红灯" trend={<span className="text-danger-700">{data.kpis.riskRed.trend}</span>} value={data.kpis.riskRed.value} />
              <StatCard icon={<Bell className="h-6 w-6" />} label="待办审批" trend={<span className="text-[var(--text-secondary)]">{data.kpis.approvals.trend}</span>} value={data.kpis.approvals.value} />
              <StatCard icon={<Wallet className="h-6 w-6" />} label="点数余额" trend={<span className="text-[var(--text-secondary)]">{data.kpis.credits.trend}</span>} value={data.kpis.credits.value} />
            </section>

            <SectionCard actions={<Link href="/opportunities"><Button>立即开始第 1 步</Button></Link>} className="border-[var(--outline-variant)] bg-[var(--surface)]" title="今日推荐路径：从机会雷达开始">
              <div className="grid gap-4 md:grid-cols-5">
                {journeySteps.map((step, index) => (
                  <Link key={step.href} className="group rounded-lg border border-primary-100 bg-primary-50 p-4 text-sm text-primary-900 transition hover:border-primary-300 hover:shadow-sm" href={step.href}>
                    <span className="flex items-center justify-between text-xs font-semibold text-primary-700">
                      第 {index + 1} 步
                      <Megaphone className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                    <strong className="mt-4 block text-base font-semibold">{step.label}</strong>
                    <span className="mt-2 block leading-5 text-primary-700">{step.text}</span>
                  </Link>
                ))}
              </div>
            </SectionCard>

            <section className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
              <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="今日机会推荐">
                <div className="space-y-4">
                  {data.opportunities.map((item) => (
                    <article key={item.title} className="border-l-4 border-primary-500 rounded-lg border border-[var(--outline-variant)] bg-white p-4 transition hover:shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <h2 className="text-base font-semibold text-[var(--text-primary)]">{item.title}</h2>
                          <p className="text-sm leading-5 text-[var(--text-secondary)]">{item.meta}</p>
                        </div>
                        <Badge className="bg-primary-50 text-primary-700">{item.deadline}</Badge>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button size="sm" variant="outline">进入资格自查</Button>
                      </div>
                    </article>
                  ))}
                </div>
              </SectionCard>

              <div className="space-y-4">
                <SectionCard className="border-danger-200 bg-danger-50" title="风险红灯">
                  <div className="space-y-4">
                    {data.risks.map((risk) => (
                      <article key={risk.title} className="rounded-lg border border-danger-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-base font-semibold text-danger-700">{risk.title}</h3>
                            <p className="text-sm leading-5 text-[var(--text-secondary)]">{risk.detail}</p>
                          </div>
                          <RiskBadge level={risk.level} />
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="经营动作">
                  <div className="space-y-4">
                    {actionCards.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">{item.label}</span>
                          <span className="font-semibold tabular-nums text-[var(--text-primary)]">{item.value}</span>
                        </div>
                        <Progress value={item.progress} />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </section>

            <SectionCard className="border-[var(--outline-variant)] bg-[var(--surface)]" title="AI 报告速览">
              <div className="grid gap-4 md:grid-cols-3">
                {data.reports.map((report) => (
                  <article key={report} className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                    <FileSearch className="h-5 w-5 text-primary-600" />
                    <p className="mt-4 text-sm leading-6 text-[var(--text-primary)]">{report}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </>
        ) : null}

        <button aria-label="AI 助手" className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg transition hover:scale-105">
          AI
        </button>
      </PageContent>
    </PageLayout>
  );
}
