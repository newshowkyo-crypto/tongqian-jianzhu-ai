const changes = ['设计变更', '范围增加', '材料替代'];
const claims = ['业主供料延误', '现场条件变化', '设计错误'];

export default function ChangesClaimsPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-semibold">变更签证与索赔</h1><span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Tier 2</span></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="变更签证" items={changes} />
          <Panel title="索赔台账" items={claims} />
        </div>
      </section>
    </main>
  );
}

function Panel({ items, title }: { items: string[]; title: string }): JSX.Element {
  return <div className="rounded border bg-white p-4"><h2 className="font-semibold">{title}</h2>{items.map((item, index) => <div className="mt-3 rounded border p-3" key={item}><div>{item}</div><div className="mt-1 text-sm text-slate-500">时效倒计时 {7 - index * 2} 天 · AI成功率 {68 - index * 8}%</div></div>)}</div>;
}
