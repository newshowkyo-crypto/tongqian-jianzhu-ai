import type { ReactNode } from 'react';

export default function HealthPage(): ReactNode {
  return <section className="space-y-4 text-white"><h1 className="text-2xl font-semibold">健康总览</h1><div className="grid gap-3 md:grid-cols-3">{['PostgreSQL ok', 'Redis ok', 'OSS mock', '站内信 ok', '公众号 mock', '企微 mock', '短信 mock', 'DeepSeek ok', 'DashScope ok'].map((item) => <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={item}><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />{item}</div>)}</div></section>;
}
