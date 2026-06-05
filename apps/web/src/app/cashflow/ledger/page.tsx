import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="现金流台账" description="项目应收应付与现金流台账，支持账期预警与回款跟踪。" breadcrumbs="现金流财务 / 现金流台账" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="现金流台账即将上线" description="该模块将汇总项目应收应付、回款计划与账期预警。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
