import { Button, EmptyState, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

import { zhCN } from '../i18n/zh-CN';

export default function Page() {
  return (
    <PageLayout>
      <PageHeader
        actions={<Button size="sm">Demo</Button>}
        description="Design system layout smoke test"
        title={zhCN.home.title}
      />
      <PageContent>
        <SectionCard description="Shared UI package import path is active" title="Workspace">
          <EmptyState
            action={<Button variant="outline">Create</Button>}
            description="No business data is loaded in this placeholder view."
            title="Ready"
          />
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
