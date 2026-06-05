import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="历史成本对比" description="与历史同类项目成本数据进行横向对比分析。" breadcrumbs="成本估算 / 历史成本对比" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="历史成本对比即将上线" description="该模块将提供与历史同类项目的成本横向对比。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
