'use client';

import { apiClient, type DispatchListItem } from '@tongqian/api-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const statusText: Record<DispatchListItem['status'], string> = {
  accepted: '已接单',
  completed: '已完成',
  confirmed: '已确认',
  in_progress: '服务中',
  pending: '待接单',
  quoted: '待确认报价',
  refunded: '已退款',
};

export default function DispatchPage() {
  const [rows, setRows] = useState<DispatchListItem[]>([]);
  useEffect(() => {
    void apiClient.dispatch.list('owner').then(setRows);
  }, []);
  const kpis = [
    ['进行中', rows.filter((item) => item.status === 'in_progress').length],
    ['待接单', rows.filter((item) => item.status === 'pending').length],
    ['已完成', rows.filter((item) => item.status === 'completed').length],
    ['总服务点数', '18,600'],
  ];
  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl bg-navy-deepest p-6 text-white">
        <p className="text-sm text-rose-main">同乾方略派单大厅</p>
        <h1 className="text-2xl font-semibold">客户发起，智能管家线下跑腿、关系协调、结果兜底</h1>
        <Link className="mt-4 inline-flex min-h-11 items-center rounded-md bg-rose-main px-4 text-sm font-semibold text-navy-deepest" href="/dispatch/new">发起派单</Link>
      </section>
      <section className="grid gap-4 md:grid-cols-4">{kpis.map(([label, value]) => <div className="rounded-lg border p-4" key={label}><p className="text-sm text-neutral-500">{label}</p><p className="text-xl font-semibold">{value}</p></div>)}</section>
      <section className="overflow-hidden rounded-lg border">
        {rows.map((row) => (
          <Link className="grid gap-4 border-b p-4 hover:bg-neutral-50 md:grid-cols-5" href={`/dispatch/${row.id}`} key={row.id}>
            <span>{row.type}</span>
            <span>{row.agent?.name ?? '公开池匹配中'}</span>
            <span className="w-fit rounded-md border px-2 py-1 text-sm">{statusText[row.status]}</span>
            <span>{row.amount ?? '待报价'}</span>
            <span>{row.createdAt}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
