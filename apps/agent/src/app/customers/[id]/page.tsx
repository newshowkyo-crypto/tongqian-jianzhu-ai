import Link from 'next/link';
import { PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

export default function CustomerDetailPage({ params }: { params: { id: string } }): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs={`Customers / ${params.id}`} description="Customer profile and next actions." title="Customer detail" />
        <SectionCard title="Operations">
          <Link className="rounded-md bg-stitch-primary-container px-4 py-2 text-sm text-white" href={`/customers/${params.id}/ops`}>Open ops assistant</Link>
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
