'use client';

import { apiClient, type DispatchDetail } from '@tongqian/api-client';
import { AiReportFooter } from '@tongqian/ui';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DispatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<DispatchDetail>();
  useEffect(() => { void apiClient.dispatch.get(id).then(setDetail); }, [id]);
  if (!detail) return <main className="p-6">加载中</main>;
  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl bg-navy-deepest p-6 text-white"><h1 className="text-2xl font-semibold">{detail.type}</h1><p>{detail.status}</p></section>
      <section className="rounded-lg border p-4"><h2 className="font-semibold">智能管家信息卡</h2><p>{detail.agent?.name ?? '等待接单'} · {detail.agent?.level ?? 'LV 待匹配'} · 信誉 {detail.agent?.reputation ?? detail.matchScore}</p></section>
      <section className="rounded-lg border p-4"><h2 className="font-semibold">报价 + 服务说明</h2><p>{detail.amount ?? detail.budget} · {detail.description}</p></section>
      <section className="grid gap-3 md:grid-cols-5">{detail.timeline.map((item) => <div className="rounded-md border p-3" key={item.milestone}><p className="font-semibold">{item.milestone}</p><p className="text-sm">{item.date} · {item.status}</p></div>)}</section>
      <section className="rounded-lg border p-4"><h2 className="font-semibold">沟通记录</h2>{detail.messages.slice(0, 10).map((msg) => <p className="border-b py-2" key={`${msg.from}-${msg.at}`}>{msg.from}: {msg.content}</p>)}</section>
      {detail.status === 'completed' ? <section className="rounded-lg border p-4"><h2>评价区</h2><p>5 星评分：{detail.rating} · {detail.review}</p><textarea className="mt-2 min-h-20 w-full rounded-md border p-2" /></section> : null}
      <section className="flex flex-wrap gap-2">{['催单', '申诉', '转同乾方略', '取消', '完成确认'].map((item) => <button className="rounded-md border px-3 py-2" key={item}>{item}</button>)}</section>
      <AiReportFooter audience="owner" confidence="medium" disclaimer="AI 派单建议仅供经营决策参考，线下执行以合同和服务确认单为准。" tier={2} />
    </main>
  );
}
