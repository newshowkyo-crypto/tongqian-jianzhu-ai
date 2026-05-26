import { AiDisclaimer } from '@tongqian/ui';

const rows = [
  { amount: '1,280,000', name: 'Structure crew A', scope: 'Structure', score: '4.2' },
  { amount: '420,000', name: 'MEP team B', scope: 'MEP', score: '3.6' },
];

export default function SubcontractsPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Project subcontract ledger</p><h1 className="text-2xl font-semibold">Subcontracts</h1><p className="max-w-3xl text-sm text-neutral-600">Register subcontract scope, reuse M14 contract review, and keep five-dimension performance evidence.</p></section>
      <section className="grid gap-4 md:grid-cols-3">{['Create subcontract', 'Upload contract for M14 review', 'Check blacklist'].map((label) => <button className="rounded-md border border-outline-variant p-4 text-left text-sm" key={label} type="button">{label}</button>)}</section>
      <section className="overflow-hidden rounded-md border border-outline-variant">{rows.map((row) => <div className="grid gap-4 border-b border-outline-variant p-4 text-sm md:grid-cols-4" key={row.name}><span>{row.name}</span><span>{row.scope}</span><span>{row.amount}</span><span>{row.score}</span></div>)}</section>
      <AiDisclaimer variant="banner" customText="AI subcontract warnings support review. Final payment or blacklist actions require verified records and approval." />
    </main>
  );
}
