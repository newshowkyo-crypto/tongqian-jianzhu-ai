'use client';

import { useMutation } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  return (await response.json()) as T;
}

export default function CustomerDdPage(): ReactNode {
  const [companyName, setCompanyName] = useState('');
  const query = useMutation({ mutationFn: () => requestJson<{ data: { recommendations: string[]; riskLevel: string; tier: number } }>('/api/v1/customer-dd', { body: JSON.stringify({ companyName }), method: 'POST' }) });
  return <main className="min-h-screen bg-[#101820] p-6 text-white"><h1 className="text-2xl font-semibold">客户尽调</h1><input className="mt-4 rounded-md p-3 text-black" onChange={(event) => setCompanyName(event.target.value)} placeholder="输入公司名称" value={companyName} /><button className="ml-3 rounded-md bg-[#d6ad60] px-4 py-3 text-black" onClick={() => query.mutate()}>查</button>{query.data ? <section className="mt-6 grid gap-3 md:grid-cols-5"><article>Tier {query.data.data.tier}</article><article>风险 {query.data.data.riskLevel}</article><article>基本信息</article><article>失信/处罚</article><article>{query.data.data.recommendations.join('；')}</article></section> : null}</main>;
}
