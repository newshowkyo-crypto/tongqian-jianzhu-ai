import type { ReactNode } from 'react';

const credentials = [
  'WECHAT_PAY_MCH_ID',
  'WECHAT_PAY_API_KEY',
  'WECHAT_PAY_CERT_PATH',
  'WECHAT_MP_APP_ID',
  'WECHAT_MP_APP_SECRET',
  'WECHAT_WORK_AGENT_ID',
  'WECHAT_WORK_SECRET',
  'ALIPAY_APP_ID',
  'ALIPAY_PRIVATE_KEY',
  'ALIYUN_OSS_ACCESS_KEY_ID',
  'ALIYUN_OSS_ACCESS_KEY_SECRET',
  'ALIYUN_OSS_BUCKET',
  'ALIYUN_OSS_REGION',
  'ALIYUN_OCR_ENABLED',
  'ALIYUN_DOCMIND_ENABLED',
  'ALIYUN_SLS_PROJECT',
  'ALIYUN_SLS_LOGSTORE',
  'ALIYUN_SLS_ENDPOINT',
  'ALIYUN_SMS_ACCESS_KEY_ID',
  'ALIYUN_SMS_ACCESS_KEY_SECRET',
  'ALIYUN_SMS_SIGN_NAME',
  'DASHVECTOR_API_KEY',
  'TIANYANCHA_API_KEY',
  'ICP_RECORD_NO',
  'ALIYUN_DASHSCOPE_API_KEY',
  'OPENROUTER_API_KEY',
  'DEEPSEEK_API_KEY',
];

const groups = [
  ['支付', 5],
  ['通知', 8],
  ['存储', 7],
  ['AI 模型', 4],
  ['数据采集', 3],
] as const;

export default function CredentialsPage(): ReactNode {
  return (
    <section className="space-y-6 text-white">
      <header>
        <h1 className="text-2xl font-semibold">凭证管理控制台</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          平台所有外部凭证可视化管理：编辑、测试连通、切换模拟模式与真实模式，全流程审计。
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-5">
        {groups.map(([label, count]) => (
          <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4 shadow-card" key={label}>
            <div className="text-sm text-[var(--text-secondary)]">凭证分组</div>
            <div className="mt-2 text-xl font-semibold">{label}</div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{count} 项</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--border-silver)] bg-white/5 shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="p-4 text-left">键名</th>
              <th>模式</th>
              <th>健康</th>
              <th>最后切换</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((key, index) => {
              const isLive = index > 23;
              return (
                <tr className="border-t border-[var(--border-silver)]" key={key}>
                  <td className="p-4 font-mono">{key}</td>
                  <td>{isLive ? '真实模式' : '模拟模式'}</td>
                  <td>{isLive ? '真实环境已就绪' : '模拟环境已就绪'}</td>
                  <td>{index + 1} 小时前</td>
                  <td className="space-x-2 py-2">
                    <button className="rounded-md border border-[var(--border-silver)] px-3 py-1.5" type="button">
                      编辑
                    </button>
                    <button className="rounded-md border border-[var(--border-silver)] px-3 py-1.5" type="button">
                      测试连通
                    </button>
                    <button className="rounded-md border border-[var(--border-silver)] px-3 py-1.5" type="button">
                      切到真实模式
                    </button>
                    <button className="rounded-md border border-[var(--border-silver)] px-3 py-1.5" type="button">
                      回退模拟模式
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
          <h2 className="text-base font-semibold">凭证字段</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            敏感字段只写入加密存储，不在前端回显明文。
          </p>
        </section>
        <section className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
          <h2 className="text-base font-semibold">切换审计</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            每次测试、审批、切换和回退都会写入审计日志。
          </p>
          <button className="mt-3 rounded-md border border-[var(--border-silver)] px-3 py-2 text-sm" type="button">
            测试连通性
          </button>
        </section>
      </div>
    </section>
  );
}
