const rows = ['Confirm owner decision', 'Send project follow-up', 'Check material loss evidence'];

export default function PersonalTodosPage(): JSX.Element {
  return (
    <main className="space-y-6 p-6">
      <section className="space-y-2"><p className="text-sm text-neutral-500">Personal office</p><h1 className="text-2xl font-semibold">My todos</h1><p className="max-w-3xl text-sm text-neutral-600">Meeting action items and daily follow-ups in one queue.</p></section>
      <section className="overflow-hidden rounded-md border border-neutral-300">{rows.map((row) => <div className="border-b border-neutral-300 p-4 text-sm" key={row}>{row}</div>)}</section>
    </main>
  );
}
