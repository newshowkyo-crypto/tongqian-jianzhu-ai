import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="平台引导配置" description="新客户引导与初始化配置。" breadcrumbs="Admin / 引导配置" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="平台引导配置即将上线" description="该模块将提供新客户引导与平台初始化配置。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
