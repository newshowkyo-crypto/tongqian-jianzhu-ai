const rows = [
  { name: 'Temporary crew X', reason: 'Repeated safety correction failures' },
  { name: 'Supplier linked team Y', reason: 'Unresolved settlement dispute' },
];

export default function SubcontractorBlacklistPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Admin risk control</p><h1 className="text-2xl font-semibold">Subcontractor blacklist</h1><p className="max-w-3xl text-sm text-neutral-600">Names are checked before new subcontract creation and shown as warnings to project owners.</p></section>
      <section className="overflow-hidden rounded-md border border-outline-variant">{rows.map((row) => <div className="grid gap-4 border-b border-outline-variant p-4 text-sm md:grid-cols-2" key={row.name}><span>{row.name}</span><span>{row.reason}</span></div>)}</section>
    </main>
  );
}
