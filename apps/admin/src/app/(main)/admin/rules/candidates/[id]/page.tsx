'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { zhCN } from '../../../../../../i18n/zh-CN';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function RuleCandidateDetailPage({ params }: { params: { id: string } }): ReactNode {
  const copy = zhCN.ruleCandidates;
  const query = useQuery({
    queryFn: () => requestJson<{ data: { items: Array<{ id: string; reasoning: string; sourceText: string; title: string }> } }>('/api/v1/admin/rule-candidates'),
    queryKey: ['admin', 'rule-candidates', params.id],
  });
  const item = query.data?.data.items.find((row) => row.id === params.id);
  const approve = useMutation({ mutationFn: () => requestJson(`/api/v1/admin/rule-candidates/${params.id}/approve`, { body: JSON.stringify({ edits: { title: item?.title } }), method: 'POST' }) });
  const reject = useMutation({ mutationFn: () => requestJson(`/api/v1/admin/rule-candidates/${params.id}/reject`, { body: JSON.stringify({ reason: copy.rejectReason }), method: 'POST' }) });

  return (
    <section className="space-y-6 text-white">
      <h1 className="text-2xl font-semibold">{item?.title ?? copy.detailTitle}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{copy.rawText}</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{item?.sourceText}</p>
        </article>
        <form className="space-y-4 rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
          <h2 className="text-lg font-semibold">{copy.aiExtract}</h2>
          <textarea className="min-h-52 w-full rounded-md border border-[var(--border-silver)] bg-black/20 p-4" defaultValue={item?.reasoning} />
        </form>
      </div>
      <div className="flex flex-wrap gap-4">
        <button className="rounded-md bg-[var(--accent-gold)] px-4 py-2 text-black" onClick={() => approve.mutate()} type="button">{copy.approve}</button>
        <button className="rounded-md border border-[var(--border-silver)] px-4 py-2" onClick={() => reject.mutate()} type="button">{copy.reject}</button>
        <button className="rounded-md border border-[var(--border-silver)] px-4 py-2" onClick={() => approve.mutate()} type="button">{copy.approveWithEdits}</button>
        <button className="rounded-md border border-[var(--border-silver)] px-4 py-2" type="button">{copy.recheck}</button>
        <button className="rounded-md border border-[var(--border-silver)] px-4 py-2" type="button">{copy.escalate}</button>
      </div>
    </section>
  );
}
