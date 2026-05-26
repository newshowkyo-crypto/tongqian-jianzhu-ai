import { AiDisclaimer } from '@tongqian/ui';

const rows = [
  { location: 'Tower A 8F', result: 'open', standardRef: 'GB50204-2015' },
  { location: 'Basement B2', result: 'closed', standardRef: 'GB50300-2013' },
];

export default function ProjectQualityPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Project quality</p><h1 className="text-2xl font-semibold">Quality acceptance loop</h1><p className="max-w-3xl text-sm text-neutral-600">Record checkpoints, create rectification orders, and close hazards with evidence.</p></section>
      <section className="overflow-hidden rounded-md border border-outline-variant">{rows.map((row) => <div className="grid gap-4 border-b border-outline-variant p-4 text-sm md:grid-cols-3" key={row.location}><span>{row.location}</span><span>{row.standardRef}</span><span>{row.result}</span></div>)}</section>
      <AiDisclaimer variant="banner" customText="AI quality suggestions must be checked against project standards, photos, and signed inspection records." />
    </main>
  );
}
