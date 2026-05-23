import type { ReactNode } from 'react';

export default function AiMonitorPage(): ReactNode {
  const rows = ['contract.review', 'tender.summary', 'qualification.check', 'policy.interpret', 'chat.long'];
  return <section className="space-y-4 text-white"><h1 className="text-2xl font-semibold">AI 成本监控</h1><div className="grid gap-3 md:grid-cols-4">{['今日成本 ¥38.42', '今日调用 642', '缓存命中 31%', 'Provider 健康 3/3'].map((x) => <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={x}>{x}</div>)}</div><div className="rounded-md border border-[var(--border-silver)] p-4"><table className="w-full text-sm"><tbody>{rows.map((row, index) => <tr className="border-b border-[var(--border-silver)]" key={row}><td className="py-3">{row}</td><td>{120 - index * 11} calls</td><td>¥{(0.034 + index * 0.006).toFixed(3)}</td><td>{940 + index * 80}ms</td></tr>)}</tbody></table></div></section>;
}
