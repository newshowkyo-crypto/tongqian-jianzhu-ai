import { zhCN } from '../i18n/zh-CN';

export default function Page() {
  const modules = [
    { key: 'policy', title: zhCN.home.modules.policy, meta: zhCN.home.meta.policy },
    { key: 'docs', title: zhCN.home.modules.docs, meta: zhCN.home.meta.docs },
    { key: 'sourcing', title: zhCN.home.modules.sourcing, meta: zhCN.home.meta.sourcing },
    { key: 'funds', title: zhCN.home.modules.funds, meta: zhCN.home.meta.funds },
    { key: 'consult', title: zhCN.home.modules.consult, meta: zhCN.home.meta.consult },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-neutral-300 pb-5">
          <p className="text-sm font-semibold text-neutral-600">{zhCN.home.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{zhCN.home.title}</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {modules.map((item) => (
            <article key={item.key} className="rounded-md border border-neutral-300 bg-white p-4 shadow-card">
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.meta}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
