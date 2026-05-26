const queries = ['施工消防要求', '混凝土验收依据', '清单计价口径'];

export default function MobileRegulationPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-stitch-surface px-4 py-6 text-stitch-on-surface">
      <h1 className="text-2xl font-semibold">法规快查</h1>
      <div className="mt-6 space-y-4">
        {queries.map((query) => <div className="rounded-lg border border-stitch-outline-variant p-4" key={query}>{query}</div>)}
      </div>
    </main>
  );
}
