import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const stats = [
  ['项目申报', '18', '本周新增 4 个'],
  ['资金日历', '6', '30 天内截止'],
  ['合规提醒', '2', '需要人工复核'],
] as const;

export default function Page(): JSX.Element {
  return (
    <PageLayout className="border-t-4 border-danger-500 bg-stitch-surface text-stitch-on-surface text-base">
      <PageContent>
        <PageHeader
          actions={<button className="rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white">查看政策清单</button>}
          breadcrumbs="政企端 / 工作台"
          description="以项目、资金、合规三个视角汇总政府和央国企协作事项。"
          title="政企服务工作台"
        />
        <section className="grid gap-4 md:grid-cols-3">
          {stats.map(([label, value, hint]) => (
            <SectionCard className="border-stitch-outline-variant bg-white shadow-none" key={label}>
              <div className="text-sm text-stitch-on-surface-variant">{label}</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums text-stitch-on-surface">{value}</div>
              <p className="mt-2 text-xs text-stitch-on-surface-variant">{hint}</p>
            </SectionCard>
          ))}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="加载政企事项" rows={2} />
          <EmptyState title="暂无新提醒" description="当前资金日历和项目清单均已同步。" />
          <ErrorState title="数据加载失败" description="请稍后刷新，已保存的申报材料不会丢失。" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
