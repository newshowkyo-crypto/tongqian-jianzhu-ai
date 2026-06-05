import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="法规语料库" description="法律法规语料库的导入、版本与检索管理。" breadcrumbs="Admin / 法规语料库" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="法规语料库管理即将上线" description="该模块将提供法规语料库的导入、版本与检索管理。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
