import type { ReactNode } from 'react';

const jobs = ['agent-reputation-decay', 'ai-cost-monitor', 'audit-archive', 'backup', 'credit-expiry', 'monthly-report', 'morning-briefing', 'opportunity-radar-scan', 'qualification-alert', 'subscription-renewal', 'legal-regulation', 'tender-announcement', 'policy-fund', 'mohurd-standards', 'doc-template', 'industry-news', 'wenshu-csv', 'tianyancha', 'ocr-paper', 'friend-circle'];

export default function JobsPage(): ReactNode {
  return <section className="space-y-4 text-white"><h1 className="text-2xl font-semibold">Worker 任务中心</h1><div className="overflow-hidden rounded-md border border-[var(--border-silver)]"><table className="w-full text-sm"><thead className="bg-white/10"><tr><th className="p-3 text-left">jobName</th><th>类型</th><th>上次运行</th><th>耗时</th><th>状态</th></tr></thead><tbody>{jobs.map((job, index) => <tr className="border-t border-[var(--border-silver)]" key={job}><td className="p-3">{job}</td><td>{index < 10 ? 'cron' : 'collector'}</td><td>2026-05-21 22:{String(index).padStart(2, '0')}</td><td>{900 + index * 41}ms</td><td>completed</td></tr>)}</tbody></table></div></section>;
}
