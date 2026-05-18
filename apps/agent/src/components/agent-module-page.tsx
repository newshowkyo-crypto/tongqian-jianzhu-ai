'use client';

import {
  Alert,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  SectionCard,
  StatCard,
  StatusBadge,
} from '@tongqian/ui';

import { zhCN } from '../i18n/zh-CN';
import type { AgentModulePageCopy } from '../m3-pages';

export function AgentModulePage({ copy }: { copy: AgentModulePageCopy }) {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout>
      <PageHeader
        actions={<Button className="min-h-11">{copy.action}</Button>}
        description={copy.description}
        title={copy.title}
      />
      <PageContent className="space-y-6">
        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? (
          <ErrorState
            actionLabel={zhCN.states.retry}
            description={zhCN.states.errorDescription}
            title={zhCN.states.errorTitle}
          />
        ) : null}
        {isEmpty ? <EmptyState description={copy.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

        <div className="grid gap-4 md:grid-cols-3">
          {copy.metrics.map((metric) => (
            <StatCard key={metric.label} label={metric.label} trend={metric.trend} value={metric.value} />
          ))}
        </div>

        <SectionCard description="平台会保留关键动作审计，并在客户保护期、退款扣回、越权风险发生时提醒您。" title="本页重点">
          <div className="grid gap-3 md:grid-cols-3">
            {copy.highlights.map((item) => (
              <div key={item} className="rounded-md border border-primary-100 bg-primary-50 p-4 text-sm font-medium text-primary-700">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="当前事项">
          <div className="space-y-3">
            {copy.primaryList.map((item) => (
              <article key={item.title} className="flex min-h-16 flex-col gap-2 rounded-md border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-neutral-900">{item.title}</p>
                  <p className="mt-1 text-sm text-neutral-500">{item.meta}</p>
                </div>
                <StatusBadge status={item.status} />
              </article>
            ))}
          </div>
        </SectionCard>

        <Alert tone="info">
          不喜欢此类推送或节奏提醒时，可在设置中心关闭或提交反馈；平台不会用焦虑、误导或隐藏成本推动您接单。
        </Alert>
      </PageContent>
    </PageLayout>
  );
}
