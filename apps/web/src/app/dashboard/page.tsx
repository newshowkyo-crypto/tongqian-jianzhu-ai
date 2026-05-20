'use client';

import {
  AlertTriangle,
  Bell,
  Button,
  CreditDisplay,
  EmptyState,
  ErrorState,
  LoadingState,
  OpportunityCard,
  PageContent,
  PageHeader,
  PageLayout,
  Radar,
  RiskBadge,
  SectionCard,
  StatCard,
  Wallet,
} from '@tongqian/ui';
import { useEffect, useState } from 'react';

import { zhCN } from '../../i18n/zh-CN';

const copy = zhCN.dashboard;

function AnimatedNumber({ end }: { end: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const duration = 800;
    let frameId = 0;

    function tick(now: number) {
      const progress = Math.min((now - startedAt) / duration, 1);
      setValue(Math.round(end * progress));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [end]);

  return <span>{value.toLocaleString('zh-CN')}</span>;
}

export default function DashboardPage() {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout>
      <PageHeader
        description={copy.bannerLine}
        title={copy.title}
        actions={<Button size="lg">{zhCN.chat.actions.trigger}</Button>}
      />
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-primary-100 bg-primary-900 p-6 text-white shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-100">{zhCN.brand.subBrand}</p>
              <h2 className="text-2xl font-bold">{copy.bannerGreeting}</h2>
              <p className="text-sm text-primary-100">{copy.bannerDate}</p>
            </div>
            <p className="rounded-md border border-accent-500/50 px-4 py-2 text-sm font-medium text-accent-500">
              {zhCN.brand.joint}
            </p>
          </div>
        </section>

        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
        {isEmpty ? <EmptyState description={zhCN.states.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

        <section className="grid gap-4 md:grid-cols-4">
          {copy.kpis.map((kpi, index) => {
            const icons = [<Radar key="radar" />, <AlertTriangle key="risk" />, <Bell key="bell" />, <Wallet key="wallet" />];
            return (
              <StatCard
                key={kpi.label}
                icon={icons[index]}
                label={kpi.label}
                trend={<span className={index === 1 ? 'text-danger-700' : 'text-success-700'}>{kpi.trend}</span>}
                value={
                  index === 3 ? (
                    <CreditDisplay credits={kpi.value} />
                  ) : (
                    <AnimatedNumber end={kpi.value} />
                  )
                }
              />
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <SectionCard title={copy.opportunityTitle}>
            <div className="space-y-3">
              {copy.opportunities.map((item) => (
                <OpportunityCard
                  key={item.title}
                  className="border-l-4 border-l-primary-500"
                  deadline={item.deadline}
                  meta={item.meta}
                  title={item.title}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title={copy.riskTitle}>
            <div className="space-y-3">
              {copy.risks.map((risk) => (
                <article
                  key={risk.title}
                  className="rounded-lg border border-danger-100 bg-danger-50 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-neutral-900">{risk.title}</h3>
                      <p className="text-sm text-neutral-600">{risk.detail}</p>
                    </div>
                    <RiskBadge level={risk.level as 'green' | 'red' | 'yellow'} />
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </section>

        <SectionCard title={copy.reportTitle}>
          <ul className="grid gap-3 md:grid-cols-3">
            {copy.reports.map((report) => (
              <li key={report} className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-700 shadow-sm">
                {report}
              </li>
            ))}
          </ul>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
