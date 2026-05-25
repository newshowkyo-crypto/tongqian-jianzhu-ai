'use client';

import { useMemo, useState } from 'react';

const coefficients = { category: 1, quality: 1.15, region: 1.05, structure: 1.4, time: 1.02 };

export default function BudgetEstimatePage(): JSX.Element {
  const [area, setArea] = useState(3000);
  const result = useMemo(() => {
    const baseline = 2600;
    const product = Object.values(coefficients).reduce((total, factor) => total * factor, 1);
    const mid = Math.round(area * baseline * product);
    return { high: Math.round(mid * 1.15), low: Math.round(mid * 0.85), mid };
  }, [area]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[360px_1fr]">
        <form className="rounded border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">概算引擎</h1>
            <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Tier 2</span>
          </div>
          <label className="block text-sm">建筑面积</label>
          <input className="mt-1 w-full rounded border px-3 py-2" type="number" value={area} onChange={(event) => setArea(Number(event.target.value))} />
          {['厂房', '钢结构', '省会', '标准装修', '2026-06'].map((item) => <div className="mt-4 rounded border px-3 py-2 text-sm" key={item}>{item}</div>)}
        </form>
        <section className="rounded border bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="下限" value={result.low} />
            <Stat label="中值" value={result.mid} />
            <Stat label="上限" value={result.high} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-5">
            {Object.entries(coefficients).map(([name, value]) => <Stat key={name} label={name} value={value} />)}
          </div>
          <div className="mt-4 rounded border p-4 text-sm">AI概算仅作经营辅助，不替代造价师正式成果或审计结论。</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['自己执行', '申请智能管家', '申请同乾方略', '人工复核', '专家咨询'].map((label) => <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" key={label}>{label}</button>)}
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }): JSX.Element {
  return <div className="rounded border p-4"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>;
}
