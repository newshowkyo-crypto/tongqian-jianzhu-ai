import type { ReactNode } from 'react';

export default function NotificationsPage(): ReactNode {
  return <section className="space-y-4 text-white"><h1 className="text-2xl font-semibold">通知通道监控</h1><div className="grid gap-3 md:grid-cols-3">{['站内信 real', '公众号 mock', '企微 mock', '短信 mock', '邮件 mock', '桌面 real'].map((item, index) => <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={item}><div className="font-medium">{item}</div><p className="mt-2 text-sm text-[var(--text-secondary)]">今日发送 {42 + index * 8}，失败率 {(index * 0.4).toFixed(1)}%</p><button className="mt-3 rounded-md border border-[var(--border-silver)] px-3 py-2 text-sm">发送测试消息</button></div>)}</div></section>;
}
