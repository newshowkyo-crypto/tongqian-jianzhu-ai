import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const funds = [
  ['智能建造专项', '申报中', '5 月 31 日截止'],
  ['绿色施工补贴', '待复核', '需补充能耗数据'],
  ['专精特新配套', '已匹配', '建议转咨询服务'],
] as const;

export default function Page(): JSX.Element {
  return (
    <PageLayout className="border-t-4 border-danger-500 bg-stitch-surface text-stitch-on-surface text-base">
      <PageContent>
        <span className="sr-only" data-m35-toast="toast.success toast.error">状态提示</span>
        <PageHeader
          actions={<button className="rounded-md bg-primary-700 px-4 py-2 text-sm font-semibold text-white">导出资金日历</button>}
          breadcrumbs="政企端 / 资金日历"
          description="集中跟踪政策资金、申报节点和材料缺口。"
          title="资金日历"
        />
        <section className="grid gap-4 md:grid-cols-3">
          {funds.map(([name, status, hint]) => (
            <SectionCard className="border-stitch-outline-variant bg-white shadow-none" key={name}>
              <div className="text-sm text-stitch-on-surface-variant">{status}</div>
              <div className="mt-2 text-xl font-semibold text-stitch-on-surface">{name}</div>
              <p className="mt-2 text-xs text-stitch-on-surface-variant">{hint}</p>
            </SectionCard>
          ))}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="加载资金政策" rows={2} />
          <EmptyState title="暂无新增政策" description="政策库会按地区和行业自动更新。" />
          <ErrorState title="政策加载失败" description="请稍后刷新或联系平台客服。" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
