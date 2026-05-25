'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function RfpAnalysisPage({ params }: { params: { id: string } }): ReactNode {
  const [queryText, setQueryText] = useState('');
  const clauses = useQuery({
    queryFn: () => requestJson<{ data: { clauses: Array<{ category: string; pageNumber?: number; risk: string; suggestion: string }> } }>(`/api/v1/tender/projects/${params.id}/key-clauses`),
    queryKey: ['rfp-key-clauses', params.id],
  });
  const search = useMutation({ mutationFn: () => requestJson<{ data: { items: Array<{ content: string; docName: string; pageNumber?: number }> } }>(`/api/v1/tender/projects/${params.id}/rfp-search`, { body: JSON.stringify({ query: queryText }), method: 'POST' }) });

  return (
    <main className="grid min-h-screen gap-6 bg-primary-900 p-6 text-white lg:grid-cols-[240px_1fr_320px]">
      <aside className="space-y-4"><h1 className="text-xl font-semibold">RFP 多文件</h1><p className="text-sm text-white/60">招标文件 / 答疑 / 补遗</p></aside>
      <section className="grid gap-4 sm:grid-cols-2">
        {(clauses.data?.data.clauses ?? []).map((item) => <article className="rounded-md border border-white/15 p-4" key={item.category}><h2>{item.category}</h2><p className="mt-2 text-sm text-white/65">{item.suggestion}</p><span className="mt-4 inline-block text-xs">P{item.pageNumber ?? '-' } · {item.risk}</span></article>)}
      </section>
      <aside className="space-y-4">
        <textarea className="min-h-32 w-full rounded-md border border-white/15 bg-black/20 p-4" onChange={(event) => setQueryText(event.target.value)} placeholder="投标保证金多少？" value={queryText} />
        <button className="rounded-md bg-accent-500 px-4 py-2 text-black" onClick={() => search.mutate()} type="button">搜索原文</button>
        {(search.data?.data.items ?? []).map((item) => <p className="rounded-md border border-white/15 p-4 text-sm" key={`${item.docName}-${item.pageNumber}`}>{item.docName} P{item.pageNumber}: {item.content}</p>)}
      </aside>
    </main>
  );
}
