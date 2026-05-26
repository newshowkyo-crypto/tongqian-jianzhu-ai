import { zhCN } from '../i18n/zh-CN';

export default function Page() {
  const modules = [
    { key: 'policy', title: zhCN.home.modules.policy, meta: zhCN.home.meta.policy },
    { key: 'docs', title: zhCN.home.modules.docs, meta: zhCN.home.meta.docs },
    { key: 'projects', title: zhCN.home.modules.projects, meta: zhCN.home.meta.projects },
    { key: 'sourcing', title: zhCN.home.modules.sourcing, meta: zhCN.home.meta.sourcing },
    { key: 'consult', title: zhCN.home.modules.consult, meta: zhCN.home.meta.consult },
  ];

  return (
    <section className="text-neutral-950">
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
      <aside className="fixed bottom-5 right-5 w-[min(340px,calc(100vw-40px))] rounded-md border border-neutral-300 bg-white p-4 shadow-card">
        <h2 className="text-sm font-semibold text-neutral-950">{zhCN.chat.title}</h2>
        <textarea className="mt-3 h-20 w-full resize-none rounded-md border border-neutral-300 p-4 text-sm outline-none focus:border-primary-500" placeholder={zhCN.chat.input} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <button className="rounded-md border border-neutral-300 px-2 py-2 font-medium">{zhCN.chat.actions.execute}</button>
          <button className="rounded-md border border-neutral-300 px-2 py-2 font-medium">{zhCN.chat.actions.tongqian}</button>
          <button className="rounded-md border border-neutral-300 px-2 py-2 font-medium">{zhCN.chat.actions.consult}</button>
        </div>
      </aside>
    </section>
  );
}
