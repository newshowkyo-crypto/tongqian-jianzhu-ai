import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="凭证管理" description="第三方 API Key、ICP、OSS 等凭证的集中管理。" breadcrumbs="Admin / 凭证管理" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="凭证管理即将上线" description="该模块将集中管理第三方 API Key / ICP / OSS 等凭证。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
