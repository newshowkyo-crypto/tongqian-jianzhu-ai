import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  ServicePremiumCard,
  Sparkles,
} from '@tongqian/ui';

import { zhCN } from '../../../i18n/zh-CN';

const copy = zhCN.services;

export default function PremiumServicesPage() {
  const isLoading = false;
  const isError = false;
  const isEmpty = false;

  return (
    <PageLayout>
      <PageHeader description={copy.description} title={copy.title} />
      <PageContent className="space-y-6">
        <section className="rounded-lg border border-primary-100 bg-primary-900 p-6 text-white shadow-card">
          <div className="flex items-center gap-3">
            <span className="h-10 w-1 rounded-full bg-accent-500" />
            <div>
              <p className="text-sm text-accent-500">{zhCN.brand.name}</p>
              <h2 className="text-xl font-semibold">{copy.title}</h2>
            </div>
          </div>
        </section>

        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
        {isEmpty ? <EmptyState description={zhCN.states.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {copy.items.map((service) => (
            <ServicePremiumCard
              key={service.title}
              className="border-accent-50 transition-all duration-200 hover:-translate-y-1 hover:border-accent-500 hover:shadow-md"
              cta={copy.cta}
              description={
                <span className="space-y-3">
                  <span className="block text-2xl font-bold tabular-nums text-accent-500">{service.price}</span>
                  <span className="block space-y-1 text-sm text-neutral-600">
                    {service.deliverables.map((item) => (
                      <span key={item} className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent-500" />
                        {item}
                      </span>
                    ))}
                  </span>
                </span>
              }
              title={service.title}
            />
          ))}
        </section>
      </PageContent>
    </PageLayout>
  );
}
