import type { ReactNode } from 'react';

const credentials = [
  'WECHAT_PAY_MCH_ID', 'WECHAT_PAY_API_KEY', 'WECHAT_PAY_CERT_PATH', 'WECHAT_MP_APP_ID', 'WECHAT_MP_APP_SECRET',
  'WECHAT_WORK_AGENT_ID', 'WECHAT_WORK_SECRET', 'ALIPAY_APP_ID', 'ALIPAY_PRIVATE_KEY', 'ALIYUN_OSS_ACCESS_KEY_ID',
  'ALIYUN_OSS_ACCESS_KEY_SECRET', 'ALIYUN_OSS_BUCKET', 'ALIYUN_OSS_REGION', 'ALIYUN_OCR_ENABLED', 'ALIYUN_DOCMIND_ENABLED',
  'ALIYUN_SLS_PROJECT', 'ALIYUN_SLS_LOGSTORE', 'ALIYUN_SLS_ENDPOINT', 'ALIYUN_SMS_ACCESS_KEY_ID', 'ALIYUN_SMS_ACCESS_KEY_SECRET',
  'ALIYUN_SMS_SIGN_NAME', 'DASHVECTOR_API_KEY', 'TIANYANCHA_API_KEY', 'ICP_RECORD_NO', 'ALIYUN_DASHSCOPE_API_KEY',
  'OPENROUTER_API_KEY', 'DEEPSEEK_API_KEY',
];

export default function CredentialsPage(): ReactNode {
  return (
    <section className="space-y-5 text-white">
      <header>
        <h1 className="text-2xl font-semibold">Credentials Console</h1>
        <p className="text-sm text-[var(--text-secondary)]">P1/P2 providers are editable, auditable, and switchable between mock and real mode.</p>
      </header>
      <div className="grid gap-3 md:grid-cols-5">
        {['Payment 5', 'Notify 8', 'Storage 7', 'AI 4', 'Collect 3'].map((item) => (
          <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4 shadow-card" key={item}>
            <div className="text-sm text-[var(--text-secondary)]">Credential Group</div>
            <div className="mt-2 text-xl font-semibold">{item}</div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--border-silver)] bg-white/5 shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr><th className="p-3 text-left">Key</th><th>Mode</th><th>Health</th><th>Last Switch</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {credentials.map((key, index) => (
              <tr className="border-t border-[var(--border-silver)]" key={key}>
                <td className="p-3 font-mono">{key}</td>
                <td>{index > 23 ? 'real' : 'mock'}</td>
                <td>{index > 23 ? 'ok' : 'mock-ready'}</td>
                <td>2026-05-21 23:{String(index).padStart(2, '0')}</td>
                <td className="space-x-2 py-2">
                  <button className="rounded-md border border-[var(--border-silver)] px-3 py-1.5">Edit</button>
                  <button className="rounded-md border border-[var(--border-silver)] px-3 py-1.5">Test</button>
                  <button className="rounded-md border border-[var(--border-silver)] px-3 py-1.5">Real</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
