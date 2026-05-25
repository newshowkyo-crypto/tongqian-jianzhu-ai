const columns = [
  ['todo', '待办'],
  ['doing', '进行中'],
  ['blocked', '阻塞'],
  ['done', '完成'],
] as const;

const cards = [
  { column: 'todo', due: '06-03', priority: 'high', title: '复核钢结构工程量' },
  { column: 'doing', due: '06-05', priority: 'urgent', title: '业主供料延误索赔证据' },
  { column: 'blocked', due: '06-01', priority: 'normal', title: '等待设计变更确认' },
  { column: 'done', due: '05-28', priority: 'low', title: '上传安全交底签字' },
];

export default function ProjectTasksPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-semibold">项目任务</h1><div className="rounded border bg-white p-1 text-sm">看板 / 列表 / 时间线</div></div>
        <div className="grid gap-3 lg:grid-cols-4">
          {columns.map(([key, label]) => (
            <div className="min-h-[420px] rounded border bg-white p-3" key={key}>
              <div className="mb-3 font-medium">{label}</div>
              {cards.filter((card) => card.column === key).map((card) => (
                <article className="mb-3 rounded border p-3" draggable key={card.title}>
                  <div className="font-medium">{card.title}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{card.priority}</span><span>{card.due}</span></div>
                  <div className="mt-2 text-xs text-slate-500">关联进度 / 索赔 / 变更</div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
