import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader
          title="客户尽职调查"
          description="对潜在客户与交易对手进行经营、信用与风险尽调，辅助投标与签约决策。"
          breadcrumbs="经营风控 / 客户尽调"
        />
        <section className="mt-4">
          <SectionCard title="功能即将上线" description="客户尽职调查能力正在接入企业主风险雷达与工商信用数据源。">
            <EmptyState
              title="客户尽职调查即将上线"
              description="该模块将提供客户经营画像、关联关系、信用与涉诉风险一键尽调。上线前，您可先在「企业主风险雷达」对核心交易对手发起 AI 风险初筛。"
            />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
