import { EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function Page(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader title="招标文件解析" description="招标文件 AI 解析与要点提取。" breadcrumbs="招投标 / 招标文件解析" />
        <section className="mt-4">
          <SectionCard title="功能即将上线">
            <EmptyState title="招标文件 AI 解析即将上线" description="该模块将提供招标文件的 AI 解析、要点提取与风险提示。" />
          </SectionCard>
        </section>
      </PageContent>
    </PageLayout>
  );
}
