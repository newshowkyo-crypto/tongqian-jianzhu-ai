import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  Progress,
  SectionCard,
} from '@tongqian/ui';

import { zhCN } from '../../i18n/zh-CN';

const copy = zhCN.reputation;
const score = 862;
const circumference = 2 * Math.PI * 82;
const progress = (score / 1000) * circumference;

export default function ReputationPage() {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout>
      <PageHeader description={copy.description} title={copy.title} actions={<Button variant="outline">{copy.appeal}</Button>} />
      <PageContent className="space-y-6">
        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
        {isEmpty ? <EmptyState description={zhCN.states.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <SectionCard>
            <div className="flex flex-col items-center gap-4">
              <div className="relative grid h-56 w-56 place-items-center">
                <svg aria-label={copy.scoreLabel} className="h-56 w-56 -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" fill="none" r="82" stroke="#e4e4e7" strokeWidth="14" />
                  <circle
                    cx="100"
                    cy="100"
                    fill="none"
                    r="82"
                    stroke="#d4953a"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    strokeWidth="14"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-sm text-neutral-500">{copy.scoreLabel}</p>
                  <p className="text-3xl font-bold tabular-nums text-neutral-900">{score}</p>
                  <span className="mt-2 inline-flex rounded-md border border-accent-500 bg-accent-50 px-2 py-1 text-xs font-semibold text-accent-700">
                    {copy.level}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={copy.next}>
            <div className="space-y-6">
              <Progress max={1000} value={score} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-neutral-500">{copy.referralCap}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-accent-500">18%</p>
                </div>
                <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-neutral-500">{copy.withdrawal}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-primary-700">T+3</p>
                </div>
              </div>
              <p className="rounded-md border border-success-100 bg-success-50 p-3 text-sm text-success-700">{copy.monthlyRecovery}</p>
            </div>
          </SectionCard>
        </section>

        <SectionCard actions={<Button variant="outline">{copy.appeal}</Button>} title={copy.eventsTitle}>
          <div className="space-y-3">
            {copy.events.map((event) => (
              <article
                key={`${event.date}-${event.reason}`}
                className={`flex items-center justify-between rounded-md border p-4 text-sm shadow-sm ${
                  event.delta > 0
                    ? 'border-success-100 bg-success-50 text-success-700'
                    : 'border-danger-100 bg-danger-50 text-danger-700'
                }`}
              >
                <div>
                  <p className="font-semibold">{event.reason}</p>
                  <p className="mt-1 text-xs text-neutral-500">{event.date}</p>
                </div>
                <Badge tone={event.delta > 0 ? 'success' : 'danger'}>{event.delta > 0 ? `+${event.delta}` : event.delta}</Badge>
              </article>
            ))}
          </div>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
