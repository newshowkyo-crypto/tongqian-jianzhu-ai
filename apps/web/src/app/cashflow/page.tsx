'use client';

import { apiClient, type CashflowOverview } from '@tongqian/api-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CashflowPage() {
  const [data, setData] = useState<CashflowOverview>();
  useEffect(() => { void apiClient.cashflow.overview().then(setData); }, []);
  const kpis = data ? [['应收总额', data.totalReceivable], ['90 天逾期', data.overdue90], ['现金缺口', data.cashGap], ['融资额度', data.financingCapacity]] : [];
  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl bg-navy-deepest p-6 text-white"><p className="text-sm text-rose-main">现金流财务</p><h1 className="text-2xl font-semibold">应收、预警、催款函、融资诊断闭环</h1></section>
      <section className="grid gap-4 md:grid-cols-4">{kpis.map(([label, value]) => <div className="rounded-lg border p-4" key={label}><p className="text-sm text-neutral-500">{label}</p><p className="text-xl font-semibold">{value}</p></div>)}</section>
      <section className="rounded-lg border p-4"><h2 className="font-semibold">未来 30/60/90 天现金流预测曲线</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{data ? Object.entries(data.forecast).map(([day, value]) => <div className="rounded-md bg-neutral-50 p-4" key={day}>{day}: {value}</div>) : null}</div></section>
      <section className="flex gap-2"><Link className="rounded-md bg-navy-deepest px-4 py-2 text-white" href="/cashflow/receivables">新增应收</Link><button className="rounded-md border px-4 py-2" type="button">生成预测报告</button></section>
      <section className="flex flex-wrap gap-2">{['应收', '应付', '银行流水', '预警'].map((tab) => <span className="rounded-md border px-3 py-2" key={tab}>{tab}</span>)}</section>
    </main>
  );
}
