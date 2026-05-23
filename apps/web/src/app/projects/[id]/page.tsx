'use client';

import { apiClient, type ProjectDetail } from '@tongqian/api-client';
import { AiReportFooter } from '@tongqian/ui';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const tabs = ['现场', '成本', '图纸', '风险'] as const;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('现场');
  const [detail, setDetail] = useState<ProjectDetail>();
  const [summary, setSummary] = useState('');
  useEffect(() => { void apiClient.projectSite.get(id).then(setDetail); }, [id]);
  if (!detail) return <main className="p-6">加载中</main>;
  async function aiSummarizeWeek() {
    const reply = await apiClient.projectSite.aiSummarizeWeek(id);
    setSummary(reply.summary);
  }
  async function costAnalysis() {
    await apiClient.projectSite.costAnalysis(id);
  }
  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl bg-navy-deepest p-6 text-white"><h1 className="text-2xl font-semibold">{detail.name}</h1><p>{detail.client} · {detail.amount} · {detail.startDate} 至 {detail.endDate}</p><p className="text-xl">{detail.progress}%</p></section>
      <section className="grid gap-4 md:grid-cols-4">{Object.entries(detail.kpis).map(([label, value]) => <div className="rounded-lg border p-4" key={label}>{label}: {value}</div>)}</section>
      <section className="flex gap-2">{tabs.map((tab) => <button className="rounded-md border px-3 py-2" key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>)}</section>
      {activeTab === '现场' ? <section className="rounded-lg border p-4"><button className="rounded-md border px-3 py-2">新增日志</button><button className="ml-2 rounded-md bg-rose-main px-3 py-2 text-navy-deepest" onClick={() => void aiSummarizeWeek()} type="button">AI 总结本周</button>{detail.siteLogs.map((log) => <p className="border-b py-2" key={log.at}>{log.at} {log.weather} {log.content}</p>)}<p>{summary}</p></section> : null}
      {activeTab === '成本' ? <section className="rounded-lg border p-4"><button className="rounded-md bg-rose-main px-3 py-2 text-navy-deepest" onClick={() => void costAnalysis()} type="button">AI 测算成本</button>{detail.costBreakdown.map((item) => <p key={item.label}>{item.label} 饼图数据 {item.value}%</p>)}</section> : null}
      {activeTab === '图纸' ? <section className="rounded-lg border p-4"><button className="rounded-md border px-3 py-2">上传新图纸</button><button className="ml-2 rounded-md border px-3 py-2">AI 识别错漏碰缺</button>{detail.drawings.map((drawing) => <p key={drawing.id}>{drawing.name} {drawing.version}</p>)}</section> : null}
      {activeTab === '风险' ? <section className="rounded-lg border p-4">{detail.risks.map((risk) => <p key={risk.title}>{risk.level} · {risk.title}</p>)}<AiReportFooter audience="owner" confidence="medium" disclaimer="AI 项目风险建议仅供现场管理参考，关键节点需项目经理和公司复核。" tier={detail.tier} /></section> : null}
    </main>
  );
}
