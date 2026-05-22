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
import type { GovModulePageCopy } from '../m3-pages';

export function GovModulePage({ copy }: { copy: GovModulePageCopy }) {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout>
      <PageHeader actions={<Button className="min-h-11">{copy.action}</Button>} description={copy.description} title={copy.title} />
      <PageContent className="space-y-6 text-base">
        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
        {isEmpty ? <EmptyState description={copy.emptyDescription} title="暂无数据" /> : null}

        <div className="grid gap-4 md:grid-cols-3">
          {copy.indicators.map((item) => (
            <StatCard key={item.label} className="border-neutral-300" label={item.label} trend={item.trend} value={item.value} />
          ))}
        </div>

        <SectionCard className="border-neutral-300" title="工作提示">
          <div className="grid gap-4 md:grid-cols-3">
            {copy.notices.map((item) => (
              <div key={item} className="rounded-md border border-neutral-300 bg-neutral-50 p-4 font-medium text-neutral-800">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="border-neutral-300" title="近期记录">
          <div className="space-y-4">
            {copy.records.map((item) => (
              <article key={item.title} className="flex min-h-16 flex-col gap-2 rounded-md border border-neutral-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-neutral-950">{item.title}</p>
                  <p className="mt-1 text-sm text-neutral-500">{item.meta}</p>
                </div>
                <StatusBadge status={item.status} />
              </article>
            ))}
          </div>
        </SectionCard>

        <Alert tone="info">
          本工作台输出仅用于政企服务辅助决策，重大事项请按单位制度完成线下核验、人工复核和审批留痕。
        </Alert>
      </PageContent>
    </PageLayout>
  );
}
