import { zhCN } from '../i18n/zh-CN';

export default function Page() {
  return (
    <section className="text-neutral-950">
        <div className="mb-6 flex items-end justify-between border-b border-neutral-300 pb-4">
          <h1 className="text-2xl font-semibold tracking-normal">{zhCN.home.title}</h1>
          <p className="text-sm text-neutral-600">OPC console</p>
        </div>
        <div className="grid gap-3 md:grid-cols-7">
          {zhCN.home.modules.map((item) => (
            <div key={item} className="rounded-md border border-neutral-300 bg-white px-3 py-4 text-sm font-medium shadow-card">
              {item}
            </div>
          ))}
        </div>
        <section className="mt-6 rounded-md border border-neutral-300 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{zhCN.home.credentials.title}</h2>
            <button className="rounded-md border border-neutral-400 px-3 py-2 text-sm">{zhCN.home.credentials.new}</button>
          </div>
          <div className="grid grid-cols-4 border-b border-neutral-200 py-2 text-sm font-semibold text-neutral-600">
            <span>Provider</span>
            <span>Key</span>
            <span>{zhCN.home.credentials.mode}</span>
            <span>{zhCN.home.credentials.approval}</span>
          </div>
          <div className="grid grid-cols-4 py-3 text-sm">
            <span>wechat_pay</span>
            <span>WECHAT_PAY_MCH_ID</span>
            <span>mock</span>
            <span>active</span>
          </div>
        </section>
    </section>
  );
}
