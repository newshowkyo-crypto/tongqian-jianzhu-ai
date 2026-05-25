import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const stats = [
  ['信誉分', '860', '距 LV5 还差 88 分'],
  ['本周派单', '12', '4 单高价值客户'],
  ['客户满意度', '98%', '保持优秀'],
] as const;

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-gradient-to-br from-steward-start via-steward-mid to-steward-end text-white">
      <PageContent>
        <PageHeader
          actions={<button className="rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white">查看信誉规则</button>}
          breadcrumbs="智能管家 / 信誉看板"
          description="rose-gold 激励风格，聚焦信誉分、派单权重和服务质量。"
          title="智能管家信誉看板"
        />
        <section className="grid gap-4 md:grid-cols-3">
          {stats.map(([label, value, hint]) => (
            <SectionCard className="border-white/20 bg-white/10 text-white" key={label}>
              <div className="text-sm text-white/80">{label}</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
              <p className="mt-2 text-xs text-white/75">{hint}</p>
            </SectionCard>
          ))}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="加载派单动态" rows={2} />
          <EmptyState title="暂无新的扣分记录" description="当前信誉状态稳定，请继续保持按时响应。" />
          <ErrorState title="服务记录加载失败" description="请稍后刷新，平台不会影响已确认的服务凭证。" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
