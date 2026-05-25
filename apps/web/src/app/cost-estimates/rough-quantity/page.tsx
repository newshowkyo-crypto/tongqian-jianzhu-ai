const rows = [
  ['钢结构主体', 480, 't', 6200],
  ['混凝土基础', 1200, 'm3', 560],
  ['砌体', 2400, 'm3', 420],
  ['屋面金属板', 3150, 'm2', 180],
  ['防水', 4500, 'm2', 85],
  ['地坪硬化', 2850, 'm2', 120],
  ['门窗', 540, 'm2', 580],
  ['消防机电', 3000, 'm2', 260],
];

export default function RoughQuantityPage(): JSX.Element {
  const total = rows.reduce((sum, row) => sum + Number(row[1]) * Number(row[3]), 0);
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">粗算量</h1>
          <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Tier 2</span>
        </div>
        <div className="rounded border bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-3">工程项</th><th>工程量</th><th>单位</th><th>单价</th><th>合价</th></tr></thead>
            <tbody>{rows.map((row) => <tr className="border-b" key={row[0]}><td className="p-3">{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{Number(row[1]) * Number(row[3])}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="mt-4 rounded border bg-white p-4">合计 {total.toLocaleString()} 元。工程量粗算仅供经营辅助，不替代正式清单。</div>
        <div className="mt-4 flex flex-wrap gap-2">{['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'].map((label) => <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" key={label}>{label}</button>)}</div>
      </section>
    </main>
  );
}
