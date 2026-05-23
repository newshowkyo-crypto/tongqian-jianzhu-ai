'use client';

import { apiClient, type DispatchDetail } from '@tongqian/api-client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AgentDispatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<DispatchDetail>();
  useEffect(() => { void apiClient.dispatch.get(id).then(setDetail); }, [id]);
  if (!detail) return <main className="p-6">加载中</main>;
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{detail.type} · 智能管家操作面板</h1>
      <section className="rounded-lg border p-4"><p>{detail.description}</p><p>{detail.amount ?? detail.budget}</p></section>
      <section className="grid gap-3 md:grid-cols-5">{detail.timeline.map((item) => <div className="rounded-md border p-3" key={item.milestone}>{item.milestone}</div>)}</section>
      <section className="flex gap-2">
        <button className="rounded-md bg-navy-deepest px-4 py-2 text-white" onClick={() => void apiClient.dispatch.quote(detail.id, '8800', '含窗口跑腿、材料补正、结果兜底')} type="button">提交报价</button>
        <button className="rounded-md border px-4 py-2" onClick={() => void apiClient.dispatch.accept(detail.id)} type="button">确认接单</button>
      </section>
    </main>
  );
}
