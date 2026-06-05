import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="变更与索赔" description="工程变更与索赔事项的登记、跟踪与策略建议。" breadcrumbs="项目管理 / 变更与索赔" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="变更与索赔管理即将上线" description="该模块将提供工程变更与索赔的登记、跟踪与 AI 策略建议。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
