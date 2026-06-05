import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="项目经营简报" description="项目经营关键指标的定期 AI 简报。" breadcrumbs="项目管理 / 经营简报" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="项目经营简报即将上线" description="该模块将定期生成项目经营关键指标 AI 简报。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
