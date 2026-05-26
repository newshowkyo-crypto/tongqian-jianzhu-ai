import { AiDisclaimer, VoiceInputButton, PageContent, PageHeader, PageLayout, SectionCard } from '@tongqian/ui';

const chips = ['Last month profit', 'Province peer rank', 'Cash inflow trend', 'Renewal risk accounts'];
const rows = [
  { label: 'current', value: '128.6' },
  { label: 'previous', value: '96.4' },
];

export default function BiChatPage(): JSX.Element {
  return (
    <PageLayout className="bg-stitch-surface text-stitch-on-surface">
      <PageContent>
        <PageHeader breadcrumbs="Dashboard / BI chat" description="Ask business questions through approved SQL templates with tenant guard." title="Conversational BI" />
        <SectionCard title="Ask data">
          <VoiceInputButton className="mb-4" />
        <input className="w-full rounded-md border border-stitch-outline-variant bg-transparent px-4 py-3 text-sm" placeholder="Ask profit, cashflow, ranking, renewal risk..." />
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => <button className="rounded-md border border-stitch-outline-variant px-3 py-2 text-xs" key={chip}>{chip}</button>)}
          </div>
        </SectionCard>
        <SectionCard className="mt-4" title="Template result">
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((row) => <div className="rounded-lg border border-stitch-outline-variant p-4" key={row.label}><span className="text-sm">{row.label}</span><strong className="block text-2xl">{row.value}</strong></div>)}
          </div>
          <AiDisclaimer variant="footer" />
        </SectionCard>
      </PageContent>
    </PageLayout>
  );
}
