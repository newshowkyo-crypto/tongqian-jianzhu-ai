import { AiDisclaimer } from '@tongqian/ui';

const rows = [
  { actual: '870', loss: '6.8%', name: 'Cement P.O 42.5', planned: '1,000', unit: 'bags' },
  { actual: '184', loss: '2.1%', name: 'Rebar HRB400', planned: '188', unit: 'tons' },
];

export default function ProjectMaterialsPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2">
        <p className="text-sm text-neutral-500">Project ledger</p>
        <h1 className="text-2xl font-semibold">Material stock account</h1>
        <p className="max-w-3xl text-sm text-neutral-600">Record inbound, outbound, and monthly checks so actual consumption can flow into project cost control.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {['Inbound today', 'Outbound today', 'Monthly check'].map((label) => <button className="rounded-md border border-outline-variant p-4 text-left text-sm font-medium" key={label} type="button">{label}</button>)}
      </section>
      <section className="overflow-hidden rounded-md border border-outline-variant">
        {rows.map((row) => <div className="grid gap-4 border-b border-outline-variant p-4 text-sm md:grid-cols-5" key={row.name}><span>{row.name}</span><span>{row.planned} {row.unit}</span><span>{row.actual} {row.unit}</span><span>{row.loss}</span><span>Ready for monthly check</span></div>)}
      </section>
      <AiDisclaimer variant="banner" customText="AI loss suggestions are decision aids. Verify receiving slips, outbound records, and site evidence before deduction." />
    </main>
  );
}
