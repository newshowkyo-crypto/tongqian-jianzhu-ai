import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="快速工程量估算" description="基于图纸与指标的快速工程量估算。" breadcrumbs="成本估算 / 工程量估算" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="快速工程量估算即将上线" description="该模块将提供基于指标库的快速工程量估算。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
