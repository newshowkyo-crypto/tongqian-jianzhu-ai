import { AiDisclaimer } from '@tongqian/ui';

const rows = [{ direction: 'gov_to_company', title: 'Sanitized renewal project' }, { direction: 'company_to_gov', title: 'Sanitized capability proposal' }];

export default function SourcingListPage(): JSX.Element {
  return <main className="space-y-6 p-6"><section className="space-y-2"><p className="text-sm text-neutral-500">Two-way sanitized sourcing</p><h1 className="text-2xl font-semibold">Project sourcing</h1></section><section className="overflow-hidden rounded-md border border-neutral-300">{rows.map((row) => <div className="grid gap-4 border-b border-neutral-300 p-4 text-sm md:grid-cols-2" key={row.direction}><span>{row.direction}</span><span>{row.title}</span></div>)}</section><AiDisclaimer variant="banner" /></main>;
}
