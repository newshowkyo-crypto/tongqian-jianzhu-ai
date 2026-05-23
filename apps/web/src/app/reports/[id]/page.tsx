import {
  AlertTriangle,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
  Shield,
  TierBadge,
} from '@tongqian/ui';

import { zhCN } from '../../../i18n/zh-CN';

const copy = zhCN.report;

const findingClassName = {
  green: 'border-l-success-500 bg-success-50 text-success-700',
  red: 'border-l-danger-500 bg-danger-50 text-danger-700',
  yellow: 'border-l-warning-500 bg-warning-50 text-warning-700',
} as const;

export default function ReportPage({ params }: { params: { id: string } }) {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout className="bg-neutral-100">
      <main className="mx-auto min-h-screen w-full max-w-[375px] bg-neutral-50 shadow-card">
        <header className="relative bg-primary-900 px-4 py-4 text-white">
          <div className="space-y-1">
            <p className="text-xs font-medium text-accent-500">{zhCN.brand.name}</p>
            <h1 className="text-xl font-bold">{copy.title}</h1>
            <p className="text-xs text-primary-100">{copy.clientBrand}</p>
            <p className="text-xs text-primary-100">{copy.generatedAt} · #{params.id}</p>
          </div>
          <TierBadge className="absolute right-4 top-4 bg-warning-500 text-white" tier={2} />
        </header>

        <section className="space-y-4 px-4 py-4">
          {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
          {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
          {isEmpty ? <EmptyState description={zhCN.states.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

          <div className="flex h-20 items-center justify-between rounded-lg border border-warning-100 bg-warning-50 px-4 text-warning-700">
            <div>
              <p className="text-xs font-medium">{copy.overall}</p>
              <p className="text-2xl font-bold">{copy.riskName}</p>
            </div>
            <Shield className="h-8 w-8" />
          </div>
          <p className="text-sm leading-6 text-neutral-700">{copy.riskSummary}</p>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">{copy.findingsTitle}</h2>
            {copy.findings.map((finding, index) => (
              <article
                key={finding.text}
                className={`rounded-lg border border-neutral-200 border-l-4 bg-white p-4 shadow-sm ${findingClassName[finding.level as keyof typeof findingClassName]}`}
              >
                <div className="flex gap-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-900">#{index + 1} {finding.text}</p>
                    <p className="text-xs text-neutral-500">{finding.source}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900">{copy.confidence}</p>
              <p className="text-lg tracking-normal text-primary-700" aria-label={copy.confidence}>●●●○</p>
            </div>
          </section>

          <section className="space-y-4 pb-24">
            <h2 className="text-base font-semibold text-neutral-900">{copy.actionsTitle}</h2>
            <div className="grid gap-2">
              {copy.ownerActions.map((action, index) => (
                <Button key={action} className="min-h-11 w-full" variant={index === 0 ? 'primary' : 'outline'}>
                  {action}
                </Button>
              ))}
            </div>
            <p className="text-xs leading-5 text-neutral-400">{copy.disclaimer}</p>
          </section>
        </section>
      </main>
    </PageLayout>
  );
}
