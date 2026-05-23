'use client';

import { apiClient, type DispatchListItem } from '@tongqian/api-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const tabs = ['全部派单', '我的归属', '跨域池', '公开抢单'];

export default function AgentDispatchPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [rows, setRows] = useState<DispatchListItem[]>([]);
  useEffect(() => { void apiClient.dispatch.list('agent').then(setRows); }, []);
  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl bg-navy-deepest p-6 text-white">
        <p className="text-sm text-rose-main">智能管家派单工作台</p>
        <h1 className="text-2xl font-semibold">公开池、归属客户、跨域协作一处处理</h1>
      </section>
      <section className="grid gap-4 md:grid-cols-4">{[['待接单', 7], ['进行中', 3], ['月收入', '¥42,600'], ['信誉分', 96]].map(([label, value]) => <div className="rounded-lg border p-4" key={label}><p className="text-sm text-neutral-500">{label}</p><p className="text-xl font-semibold">{value}</p></div>)}</section>
      <section className="flex flex-wrap gap-2">{tabs.map((tab) => <button className="rounded-md border px-3 py-2" key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>)}</section>
      <section className="space-y-3">
        {rows.map((row) => (
          <Link className="grid gap-3 rounded-lg border p-4 hover:bg-neutral-50 md:grid-cols-6" href={`/dispatch/${row.id}`} key={row.id}>
            <span className="rounded-md bg-warning-50 px-2 py-1 text-warning-700">紧急徽章</span>
            <span>客户匿名名 {row.id.slice(-3)}</span>
            <span>{row.type}</span>
            <span>4 维匹配分 地理/类型/信誉/活跃度 {row.matchScore}</span>
            <span>保护期倒计时 {row.protectionExpireAt ?? '3 天'}</span>
            <button className="rounded-md bg-rose-main px-3 py-2 text-navy-deepest" onClick={(event) => { event.preventDefault(); void apiClient.dispatch.accept(row.id); }} type="button">立即接单</button>
          </Link>
        ))}
      </section>
    </main>
  );
}
