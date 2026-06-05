import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="业务数据燃料进度" description="平台业务数据填充与就绪进度。" breadcrumbs="Admin / 业务燃料" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="业务数据燃料进度即将上线" description="该模块将展示平台业务数据填充与就绪进度。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
