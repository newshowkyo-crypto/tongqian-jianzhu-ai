import { AiDisclaimer } from '@tongqian/ui';

const rows = [
  { actual: '168,000', budget: '150,000', category: 'laborCost', rate: '+12.0%' },
  { actual: '310,000', budget: '280,000', category: 'materialCost', rate: '+10.7%' },
];

export default function ActualCostVariancePage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Tier 2 · confidence medium</p><h1 className="text-2xl font-semibold">Actual cost variance</h1><p className="max-w-3xl text-sm text-neutral-600">AI compares actual monthly costs with the M30 budget and highlights controllable categories.</p></section>
      <section className="overflow-hidden rounded-md border border-outline-variant">{rows.map((row) => <div className="grid gap-4 border-b border-outline-variant p-4 text-sm md:grid-cols-4" key={row.category}><span>{row.category}</span><span>{row.budget}</span><span>{row.actual}</span><span>{row.rate}</span></div>)}</section>
      <section className="grid gap-4 md:grid-cols-5">{['Lock new purchase', 'Check material loss', 'Review labor team', 'Adjust forecast', 'Ask steward fallback'].map((label) => <button className="rounded-md border border-outline-variant p-4 text-left text-sm" key={label} type="button">{label}</button>)}</section>
      <AiDisclaimer variant="banner" customText="AI cost control advice is not a settlement conclusion. Reconcile invoices, stock records, and approvals first." />
    </main>
  );
}
