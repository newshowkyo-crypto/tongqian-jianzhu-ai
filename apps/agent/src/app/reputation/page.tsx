import { Badge, Button, EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, Progress, SectionCard } from '@tongqian/ui';

import { zhCN } from '../../i18n/zh-CN';

const copy = zhCN.reputation;
const score = 862;
const radius = 82;
const circumference = 2 * Math.PI * radius;
const progress = (score / 1000) * circumference;

export default function ReputationPage() {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;
  const lv5Progress = Math.round((score / 1000) * 100);

  return (
    <PageLayout>
      <PageHeader description={copy.description} title={copy.title} actions={<Button variant="outline">{copy.appeal}</Button>} />
      <PageContent className="space-y-6">
        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
        {isEmpty ? <EmptyState description={zhCN.states.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <SectionCard className="bg-white">
            <div className="flex flex-col items-center gap-4">
              <div className="relative grid h-64 w-64 place-items-center">
                <svg aria-label={copy.scoreLabel} className="h-64 w-64 -rotate-90" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="reputation-progress" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#1e5fbf" />
                      <stop offset="100%" stopColor="#d4953a" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" fill="none" r={radius} stroke="#e4e4e7" strokeWidth="14" />
                  <circle cx="100" cy="100" fill="none" r={radius} stroke="url(#reputation-progress)" strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" strokeWidth="14" />
                </svg>
                <div className="absolute text-center">
                  <p className="text-sm text-neutral-500">{copy.scoreLabel}</p>
                  <p className="text-3xl font-bold tabular-nums text-neutral-900">{score}</p>
                  <span className="mt-2 inline-flex rounded-md border border-accent-500 bg-accent-50 px-2 py-1 text-xs font-semibold text-accent-700">
                    {copy.level}
                  </span>
                </div>
              </div>
              <Badge className="border-accent-500 bg-accent-50 text-accent-700">LV4 金牌智能管家</Badge>
            </div>
          </SectionCard>

          <SectionCard title={copy.next}>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">距离 LV5 首席智能管家</span>
                  <span className="font-semibold tabular-nums text-primary-700">{lv5Progress}%</span>
                </div>
                <Progress max={1000} value={score} />
              </div>
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
              <p className="rounded-md border border-success-100 bg-success-50 p-4 text-sm text-success-700">{copy.monthlyRecovery}</p>
            </div>
          </SectionCard>
        </section>

        <SectionCard actions={<Button variant="outline">{copy.appeal}</Button>} title={copy.eventsTitle}>
          <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-neutral-200">
            {copy.events.map((event) => (
              <article key={`${event.date}-${event.reason}`} className="relative flex items-center justify-between rounded-md border bg-white p-4 pl-12 text-sm shadow-sm">
                <span className={`absolute left-2 top-5 h-4 w-4 rounded-full ${event.delta > 0 ? 'bg-success-500' : 'bg-danger-500'}`} />
                <div>
                  <p className="font-semibold text-neutral-900">{event.reason}</p>
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
