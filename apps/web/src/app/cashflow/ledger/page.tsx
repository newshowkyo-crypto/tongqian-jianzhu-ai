const summary = [
  ['已签合同', 12800000],
  ['已完工', 7600000],
  ['已开票', 5200000],
  ['已收款', 4100000],
  ['滞收', 1100000],
];

const rows = [
  ['厂房一期', '2026-06', 'contract_signed', 6800000, 'confirmed'],
  ['厂房一期', '2026-06', 'work_completed', 2600000, 'confirmed'],
  ['厂房一期', '2026-06', 'invoice_issued', 1800000, 'pending'],
  ['厂房一期', '2026-06', 'payment_received', 900000, 'confirmed'],
  ['厂房一期', '2026-06', 'invoice_issued', 1100000, 'overdue'],
];

export default function LedgerPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-xl font-semibold">进度款与结算台账</h1>
        <div className="grid gap-4 md:grid-cols-5">{summary.map(([label, value]) => <div className="rounded border bg-white p-4" key={label}><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-lg font-semibold">{Number(value).toLocaleString()}</div></div>)}</div>
        <table className="mt-4 w-full rounded border bg-white text-sm">
          <tbody>{rows.map((row) => <tr className="border-b" key={row.join('-')}><td className="p-4">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{Number(row[3]).toLocaleString()}</td><td className={row[4] === 'overdue' ? 'text-red-600' : ''}>{row[4]}</td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}
