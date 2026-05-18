import {
  Badge,
  Button,
  CreditDisplay,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  Progress,
  SectionCard,
  Wallet,
} from '@tongqian/ui';

import { zhCN } from '../../i18n/zh-CN';

const copy = zhCN.billing;

export default function BillingPage() {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout>
      <PageHeader description={copy.description} title={copy.title} />
      <PageContent className="space-y-6">
        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
        {isEmpty ? <EmptyState description={zhCN.states.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

        <section className="rounded-lg border border-primary-100 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">{copy.currentCredits}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-900">
                <CreditDisplay credits={12860} />
              </p>
            </div>
            <div className="rounded-md bg-primary-50 p-3 text-primary-700">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </section>

        <SectionCard description={copy.discount} title={copy.subscriptionTitle}>
          <div className="grid gap-4 md:grid-cols-5">
            {copy.plans.map((plan) => {
              const recommended = 'recommended' in plan && plan.recommended === true;

              return (
                <article
                  key={plan.name}
                  className={`relative rounded-lg border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${
                    recommended ? 'border-primary-500 ring-2 ring-primary-100' : 'border-neutral-200'
                  }`}
                >
                  {recommended ? <Badge className="absolute right-3 top-3" tone="info">{copy.recommended}</Badge> : null}
                  <h3 className="text-base font-semibold text-neutral-900">{plan.name}</h3>
                  <p className="mt-4 text-2xl font-bold tabular-nums text-neutral-900">¥{plan.price}</p>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-neutral-600">{plan.summary}</p>
                  <Button className="mt-4 min-h-11 w-full" variant={recommended ? 'primary' : 'outline'}>
                    {copy.selectPlan}
                  </Button>
                </article>
              );
            })}
          </div>
        </SectionCard>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title={copy.rechargeTitle}>
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.packs.map((pack) => (
                <button
                  key={pack.credits}
                  className="min-h-24 rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm transition-shadow duration-200 hover:border-primary-500 hover:shadow-md"
                  type="button"
                >
                  <p className="text-2xl font-bold tabular-nums text-neutral-900">{pack.credits} 点</p>
                  <p className="mt-2 text-sm text-success-700">{pack.bonus}</p>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title={copy.statusTitle}>
            <div className="space-y-4">
              {copy.status.map((status, index) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-700">{status}</span>
                    <Badge tone={index === 1 ? 'success' : 'neutral'}>{index === 1 ? copy.current : copy.switchable}</Badge>
                  </div>
                  <Progress max={100} value={index === 1 ? 76 : 20 + index * 12} />
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
