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
      <aside className="fixed bottom-5 right-5 w-[min(360px,calc(100vw-40px))] rounded-md border border-neutral-300 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-neutral-950">{zhCN.chat.title}</h2>
          <span className="rounded-sm bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">web</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-neutral-600">{zhCN.chat.status}</p>
        <textarea className="mt-3 h-20 w-full resize-none rounded-md border border-neutral-300 p-3 text-sm outline-none focus:border-primary-500" placeholder={zhCN.chat.input} />
        <div className="mt-3 flex justify-end gap-2">
          <Button size="sm" variant="outline">
            {zhCN.chat.actions.trigger}
          </Button>
          <Button size="sm">{zhCN.chat.actions.send}</Button>
        </div>
      </aside>
    </PageLayout>
  );
}
