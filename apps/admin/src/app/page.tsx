import Link from 'next/link';

import { zhCN } from '../i18n/zh-CN';

const quickLinks: Array<[title: string, href: string, description: string]> = [
  ['凭证管理', '/admin/credentials', '替换 P1/P2 外部凭证，测试连通后切换 Real。'],
  ['数据采集', '/ingest', '查看采集大盘、运行审计和目标表写入情况。'],
  ['Prompt 管理', '/admin/prompts', '维护版本、价值密度和输出 4 要素。'],
];

export default function Page() {
  return (
    <section className="space-y-6 text-white">
        <div className="border-b border-[var(--border-silver)] pb-4">
          <h1 className="text-2xl font-semibold tracking-normal">{zhCN.home.title}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">业务运营首页聚合关键指标与高频入口，左侧导航保持唯一入口。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['今日采集', '32', '10 个采集任务已写审计'],
            ['AI 调用', '186', '单点成本低于红线'],
            ['在线租户', '95', '含建筑企业与政企演示租户'],
            ['异常告警', '2', '待运营复核'],
          ].map(([label, value, hint]) => (
            <div key={label} className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4 shadow-card">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">{hint}</p>
            </div>
          ))}
        </div>
        <section className="grid gap-4 md:grid-cols-3">
          {quickLinks.map(([title, href, desc]) => (
            <Link key={href} className="rounded-md border border-[var(--border-silver)] bg-white/5 p-6 shadow-card transition-shadow hover:shadow-md" href={href}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{desc}</p>
              <span className="mt-4 inline-block rounded-md border border-[var(--border-silver)] px-3 py-2 text-sm">打开</span>
            </Link>
          ))}
        </section>
        <section className="rounded-md border border-[var(--border-silver)] bg-white/5 p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{zhCN.home.credentials.title}</h2>
            <Link className="rounded-md border border-[var(--border-silver)] px-3 py-2 text-sm" href="/admin/credentials">{zhCN.home.credentials.new}</Link>
          </div>
          <div className="grid grid-cols-4 border-b border-[var(--border-silver)] py-2 text-sm font-semibold text-[var(--text-secondary)]">
            <span>Provider</span>
            <span>Key</span>
            <span>{zhCN.home.credentials.mode}</span>
            <span>{zhCN.home.credentials.approval}</span>
          </div>
          <div className="grid grid-cols-4 py-3 text-sm">
            <span>wechat_pay</span>
            <span>WECHAT_PAY_MCH_ID</span>
            <span>Mock</span>
            <span>启用</span>
          </div>
        </section>
    </section>
  );
}
