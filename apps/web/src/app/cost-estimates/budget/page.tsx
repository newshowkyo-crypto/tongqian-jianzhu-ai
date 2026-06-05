import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="成本预算" description="基于清单与历史数据的工程成本预算编制。" breadcrumbs="成本估算 / 成本预算" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="成本预算即将上线" description="该模块将提供分部分项成本预算编制与对比。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
