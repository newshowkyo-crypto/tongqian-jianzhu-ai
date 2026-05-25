import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const orders = [
  ['湖北宏建工程', '合同风险现场协助', '4,800'],
  ['西安城投项目部', '投标材料窗口跑办', '2,600'],
  ['苏州建安集团', '资质升级材料预审', '1,200'],
] as const;

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-gradient-to-br from-steward-start via-steward-mid to-steward-end text-white">
      <PageContent>
        <PageHeader
          actions={<button className="rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white">刷新派单</button>}
          breadcrumbs="智能管家 / 派单大厅"
          description="高价值派单、客户头像、报价输入和接单动作保持清晰可读。"
          title="派单大厅"
        />
        <section className="grid gap-4 md:grid-cols-3">
          {orders.map(([customer, need, quote]) => (
            <SectionCard className="border-white/20 bg-white/10 text-white" key={customer}>
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-sm font-semibold">{customer.slice(0, 1)}</div>
                <div>
                  <div className="text-sm font-semibold">{customer}</div>
                  <div className="text-xs text-white/75">{need}</div>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-white/20 bg-white/10 p-4">
                <div className="text-xs text-white/70">建议报价</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">¥{quote}</div>
              </div>
              <button className="mt-4 w-full rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white">立即接单</button>
            </SectionCard>
          ))}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="加载派单池" rows={2} />
          <EmptyState title="暂无新派单" description="请关注跨域池和公开抢单机会。" />
          <ErrorState title="派单加载失败" description="网络异常时请稍后刷新，不影响已接订单。" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
