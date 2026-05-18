import { zhCN } from '../../../i18n/zh-CN';

const credentialRows = [
  { approval: 'active', key: 'WECHAT_PAY_MCH_ID', mode: 'mock', provider: 'wechat_pay', updatedAt: 'mock seed' },
  { approval: 'pending_approval', key: 'ALIYUN_OSS_ACCESS_KEY_ID', mode: 'real', provider: 'aliyun_oss', updatedAt: 'after submit' },
  { approval: 'active', key: 'OPENROUTER_API_KEY', mode: 'real', provider: 'openrouter', updatedAt: 'P0 verified' },
];

export default function CredentialsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 border-b border-neutral-300 pb-4">
          <h1 className="text-2xl font-semibold tracking-normal">{zhCN.credentialsPage.title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{zhCN.credentialsPage.warning}</p>
        </div>

        <section className="rounded-md border border-neutral-300 bg-white p-5 shadow-card">
          <h2 className="text-base font-semibold">{zhCN.credentialsPage.form.submit}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.provider}
              <input className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2" defaultValue="wechat_pay" />
            </label>
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.key}
              <input className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2" defaultValue="WECHAT_PAY_MCH_ID" />
            </label>
            <fieldset className="rounded-md border border-neutral-300 p-3">
              <legend className="px-1 text-sm font-medium">{zhCN.credentialsPage.form.mode}</legend>
              <label className="mr-4 text-sm">
                <input className="mr-2" name="mode" type="radio" defaultChecked />
                {zhCN.credentialsPage.form.mock}
              </label>
              <label className="text-sm">
                <input className="mr-2" name="mode" type="radio" />
                {zhCN.credentialsPage.form.real}
              </label>
            </fieldset>
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.value}
              <input className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2" placeholder="[PLACEHOLDER_REAL_SECRET_INPUT]" type="password" />
            </label>
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.operator}
              <input className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2" defaultValue="platform-owner" />
            </label>
            <label className="text-sm font-medium">
              {zhCN.credentialsPage.form.reason}
              <input className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2" defaultValue="replace placeholder before launch" />
            </label>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <section className="rounded-md border border-neutral-300 bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold">{zhCN.credentialsPage.approval.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{zhCN.credentialsPage.approval.required}</p>
            <p className="mt-2 text-sm font-medium">{zhCN.credentialsPage.approval.approver}</p>
            <input className="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" placeholder={zhCN.credentialsPage.approval.field} />
          </section>
          <section className="rounded-md border border-neutral-300 bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold">{zhCN.credentialsPage.audit.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {zhCN.credentialsPage.audit.rows.map((row) => (
                <li key={row} className="rounded-sm bg-neutral-100 px-2 py-1">{row}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-md border border-neutral-300 bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold">{zhCN.credentialsPage.hotUpdate.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
              {zhCN.credentialsPage.hotUpdate.items.map((item) => (
                <li key={item} className="rounded-sm bg-neutral-100 px-2 py-1">{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-5 rounded-md border border-neutral-300 bg-white p-5 shadow-card">
          <div className="grid grid-cols-5 border-b border-neutral-200 pb-2 text-sm font-semibold text-neutral-600">
            <span>{zhCN.credentialsPage.table.provider}</span>
            <span>{zhCN.credentialsPage.table.key}</span>
            <span>{zhCN.credentialsPage.table.mode}</span>
            <span>{zhCN.credentialsPage.table.approval}</span>
            <span>{zhCN.credentialsPage.table.updatedAt}</span>
          </div>
          {credentialRows.map((row) => (
            <div key={row.key} className="grid grid-cols-5 py-3 text-sm">
              <span>{row.provider}</span>
              <span>{row.key}</span>
              <span>{row.mode}</span>
              <span>{row.approval}</span>
              <span>{row.updatedAt}</span>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
