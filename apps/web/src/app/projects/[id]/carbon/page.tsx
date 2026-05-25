const materials = [
  ['钢材', 480, 2350],
  ['混凝土', 1200, 310],
  ['砌体', 2400, 220],
  ['玻璃', 300, 1800],
];

export default function CarbonPage(): JSX.Element {
  const total = materials.reduce((sum, row) => sum + Number(row[1]) * Number(row[2]), 0);
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-semibold">碳排放粗算</h1><span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Tier 2</span></div>
        <div className="rounded border bg-white p-4"><div className="text-sm text-slate-500">总碳排</div><div className="text-3xl font-semibold">{total.toLocaleString()} kg CO2e</div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">{['绿色建材替代', '提高装配式比例', '光伏屋顶评估'].map((item) => <div className="rounded border bg-white p-4" key={item}>{item}<div className="mt-2 text-sm text-slate-500">预计减排 4%-6%，需造价人员复核成本。</div></div>)}</div>
      </section>
    </main>
  );
}
