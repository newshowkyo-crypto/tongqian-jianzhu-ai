import { zhCN } from '../i18n/zh-CN';

export default function Page() {
  return (
    <section className="text-neutral-900">
      <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-card">
        <p className="text-sm font-medium text-primary-700">{zhCN.home.title}</p>
      </section>
      <aside className="fixed bottom-5 right-5 w-[min(340px,calc(100vw-40px))] rounded-md border border-neutral-300 bg-white p-4 shadow-card">
        <h2 className="text-sm font-semibold text-neutral-950">{zhCN.chat.title}</h2>
        <textarea className="mt-3 h-20 w-full resize-none rounded-md border border-neutral-300 p-3 text-sm outline-none focus:border-primary-500" placeholder={zhCN.chat.input} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <button className="rounded-md border border-neutral-300 px-2 py-2 font-medium">{zhCN.chat.actions.execute}</button>
          <button className="rounded-md border border-neutral-300 px-2 py-2 font-medium">{zhCN.chat.actions.tongqian}</button>
          <button className="rounded-md border border-neutral-300 px-2 py-2 font-medium">{zhCN.chat.actions.service}</button>
        </div>
      </aside>
    </section>
  );
}
