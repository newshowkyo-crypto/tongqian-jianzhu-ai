import { EmptyState, ErrorState, LoadingState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const services = [
  { deliverables: ['方案书', '路线图'], name: '化债策略咨询', priceRange: '50万起' },
  { deliverables: ['框架图', '评估报告'], name: 'ABS / REITs 框架', priceRange: '100万起' },
  { deliverables: ['路径图', '材料清单'], name: '央国企融资路径', priceRange: '30-100万' },
  { deliverables: ['申报书', '反馈追踪'], name: '专项债申报', priceRange: '30万起' },
  { deliverables: ['资产包', '券商对接'], name: '工程款 ABS 包装', priceRange: '50-150万' },
  { deliverables: ['整体方案', '券商引荐'], name: '上市辅导（建工）', priceRange: '200万起' },
  { deliverables: ['人员清单', '业绩材料'], name: '资质升级一级', priceRange: '80万起' },
  { deliverables: ['升级路径', '业绩布局'], name: '特级资质规划', priceRange: '300万起' },
  { deliverables: ['估值模型', '交易方案'], name: '混改 / 国资入股', priceRange: '100万起' },
  { deliverables: ['招商方案', '资源对接'], name: '产业园招商配套', priceRange: '50万起' },
] as const;

export default function ServicesPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader
          actions={<button className="rounded-md bg-stitch-tertiary-container px-4 py-2 text-sm font-semibold text-white">预约咨询</button>}
          breadcrumbs="首页 / 服务货架"
          description="10 项高客单价咨询服务，承接 AI 报告后的线下关系、跑腿和兜底。"
          title="同乾方略服务货架"
        />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((item) => (
            <SectionCard key={item.name} title={item.name}>
              <div className="text-2xl font-semibold text-stitch-tertiary-container">¥{item.priceRange}</div>
              <ul className="mt-4 space-y-2 text-sm text-stitch-on-surface-variant">
                {item.deliverables.map((deliverable) => <li key={deliverable}>- {deliverable}</li>)}
              </ul>
              <button className="mt-4 rounded-md border border-stitch-outline-variant px-4 py-2 text-sm">查看服务</button>
            </SectionCard>
          ))}
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-3">
          <LoadingState label="正在加载服务报价" rows={2} />
          <EmptyState title="暂无匹配服务" description="可先生成 AI 报告，再由智能管家推荐服务。" />
          <ErrorState title="服务加载失败" description="请稍后刷新，或联系同乾方略客户成功。" />
        </section>
      </PageContent>
    </PageLayout>
  );
}
