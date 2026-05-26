import { Badge, Button, EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, Progress, SectionCard } from '@tongqian/ui';

const orders = [
  { customer: '湖北宏建工程', level: 'LV4', match: [92, 88, 86, 80], need: '合同风险现场协助', quote: '4,800', urgent: true },
  { customer: '西安城投项目部', level: 'LV3', match: [86, 82, 78, 75], need: '投标材料窗口跑办', quote: '2,600', urgent: false },
  { customer: '苏州建安集团', level: 'LV4', match: [94, 90, 84, 82], need: '资质升级材料预审', quote: '1,200', urgent: false },
] as const;

function quoteTone(value: string): string {
  const amount = Number(value.replace(',', ''));
  if (amount >= 4500) return 'border-warning-300 bg-warning-50 text-warning-700';
  if (amount <= 1800) return 'border-success-300 bg-success-50 text-success-700';
  return 'border-primary-200 bg-primary-50 text-primary-700';
}

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-gradient-to-br from-steward-start via-steward-mid to-steward-end text-white">
      <PageContent className="space-y-6">
        <span className="sr-only" data-m35-toast="toast.success toast.error">状态提示</span>
        <PageHeader
          actions={<Button className="bg-accent-500 text-white hover:bg-accent-700">刷新派单</Button>}
          breadcrumbs="智能管家 / 派单大厅"
          description="高价值派单、客户头像、报价输入和接单动作保持清晰可读。"
          title="派单大厅"
        />

        <section className="grid gap-4 md:grid-cols-3">
          {orders.map((order) => (
            <SectionCard className={`bg-white text-neutral-900 ${order.urgent ? 'border-l-4 border-warning-500' : 'border-l-4 border-transparent'}`} key={order.customer}>
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">{order.customer.slice(0, 1)}</div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {order.customer}
                    <Badge className="border-accent-200 bg-accent-50 text-accent-700">{order.level}</Badge>
                    <span className="text-accent-500">优质</span>
                  </div>
                  <div className="text-xs text-neutral-500">{order.need}</div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {['距离', '资质', '经验', '报价'].map((label, index) => (
                  <div className="space-y-1" key={label}>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{label}匹配</span>
                      <span>{order.match[index]}%</span>
                    </div>
                    <Progress value={order.match[index] ?? 0} />
                  </div>
                ))}
              </div>

              <div className={`mt-4 rounded-md border p-4 ${quoteTone(order.quote)}`}>
                <div className="text-xs">建议报价</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">¥{order.quote}</div>
              </div>

              <div className="mt-4 grid gap-2">
                <Button className="bg-accent-500 text-white hover:bg-accent-700">立即接单</Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">跳过</Button>
                  <Button variant="secondary">转同乾方略</Button>
                </div>
              </div>
            </SectionCard>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <LoadingState label="加载派单池" rows={2} />
          <EmptyState title="暂无新派单" description="请关注跨域池和公开抢单机会。" />
          <ErrorState title="派单加载失败" description="网络异常时请稍后刷新，不影响已接订单。" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
