'use client';

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageContent,
  PageHeader,
  PageLayout,
  SectionCard,
  Tabs,
  TabsList,
  TabsTrigger,
  UserCheck,
} from '@tongqian/ui';
import { useMemo, useState } from 'react';

import { zhCN } from '../../i18n/zh-CN';

const copy = zhCN.dispatch;

function quoteTone(value: number) {
  if (value <= 1800) return 'border-success-500 bg-success-50 text-success-700';
  if (value <= 3600) return 'border-warning-500 bg-warning-50 text-warning-700';
  return 'border-danger-500 bg-danger-50 text-danger-700';
}

function quoteLabel(value: number) {
  if (value <= 1800) return copy.traffic.green;
  if (value <= 3600) return copy.traffic.yellow;
  return copy.traffic.red;
}

export default function DispatchPage() {
  const [activeTab, setActiveTab] = useState<string>(copy.tabs[0]);
  const [quotes, setQuotes] = useState<Record<string, number>>(
    Object.fromEntries(copy.orders.map((order) => [order.id, order.quote])),
  );
  const isLoading = false;
  const isError = false;
  const visibleOrders = useMemo(() => copy.orders, []);

  return (
    <PageLayout>
      <PageHeader description={copy.description} title={copy.title} />
      <PageContent className="space-y-6">
        <Tabs>
          <TabsList className="flex h-auto w-full flex-wrap gap-1">
            {copy.tabs.map((tab) => (
              <TabsTrigger key={tab} active={activeTab === tab} className="min-h-11 flex-1" onClick={() => setActiveTab(tab)}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? <LoadingState label={zhCN.states.loading} /> : null}
        {isError ? <ErrorState actionLabel={zhCN.states.retry} description={zhCN.states.errorDescription} title={zhCN.states.errorTitle} /> : null}
        {!visibleOrders.length ? <EmptyState description={zhCN.states.emptyDescription} title={zhCN.states.emptyTitle} /> : null}

        <div className="grid gap-4">
          {visibleOrders.map((order) => {
            const quote = quotes[order.id] ?? order.quote;
            const urgent = 'urgent' in order && order.urgent === true;
            return (
              <SectionCard
                key={order.id}
                className={urgent ? 'border-l-4 border-l-warning-500' : ''}
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {order.need}
                    {urgent ? <Badge tone="warning">{copy.urgent}</Badge> : null}
                  </span>
                }
                description={`${order.id} · ${order.due} · ${activeTab}`}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar fallback={order.customer.slice(0, 1)} />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{order.customer}</p>
                        <p className="text-xs text-accent-700">{copy.premium}</p>
                      </div>
                      <UserCheck className="h-5 w-5 text-accent-500" />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-4">
                      {order.match.map((score) => (
                        <div key={score} className="rounded-md border border-primary-100 bg-primary-50 p-4 text-sm font-medium text-primary-700">
                          {score}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="space-y-2 text-sm font-medium text-neutral-700">
                      <span>{copy.quoteLabel}</span>
                      <Input
                        className={`min-h-11 tabular-nums ${quoteTone(quote)}`}
                        min={0}
                        onChange={(event) => setQuotes((current) => ({ ...current, [order.id]: Number(event.target.value) }))}
                        type="number"
                        value={quote}
                      />
                    </label>
                    <Badge className="w-fit" tone={quote <= 1800 ? 'success' : quote <= 3600 ? 'warning' : 'danger'}>
                      {quoteLabel(quote)}
                    </Badge>
                    <div className="grid gap-2">
                      {copy.actions.map((action, index) => (
                        <Button key={action} className="min-h-11 w-full" variant={index === 0 ? 'primary' : 'outline'}>
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      </PageContent>
    </PageLayout>
  );
}
