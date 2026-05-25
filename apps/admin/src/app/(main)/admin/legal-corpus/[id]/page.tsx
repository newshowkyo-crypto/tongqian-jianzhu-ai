'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { type ReactNode } from 'react';

import { zhCN } from '../../../../../i18n/zh-CN';

interface ClauseItem {
  clauseNumber: string;
  clauseText: string;
  id: string;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function LegalCorpusDetailPage({ params }: { params: { id: string } }): ReactNode {
  const copy = zhCN.legalCorpus;
  const query = useQuery({
    queryFn: () => requestJson<{ data: { clauses: ClauseItem[]; corpus: { clauseCount: number; title: string } } }>(`/api/v1/admin/legal-corpus/${params.id}/clauses`),
    queryKey: ['admin', 'legal-corpus', params.id],
  });
  const generate = useMutation({ mutationFn: (clauseId: string) => requestJson(`/api/v1/admin/legal-corpus/${params.id}/clauses/${clauseId}/generate`, { method: 'POST' }) });
  const generateAll = useMutation({ mutationFn: () => requestJson<{ data: { jobId: string; status: string; total: number } }>(`/api/v1/admin/legal-corpus/${params.id}/generate-all`, { body: JSON.stringify({ confidenceThreshold: 0.85 }), method: 'POST' }) });
  const clauses = query.data?.data.clauses ?? [];

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{query.data?.data.corpus.title ?? copy.detail}</h1>
        <progress className="h-2 w-full" max={query.data?.data.corpus.clauseCount ?? 1} value={clauses.length} />
        <button className="rounded-md bg-[var(--accent-gold)] px-4 py-2 text-black" onClick={() => generateAll.mutate()} type="button">{copy.generateAll}</button>
      </header>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="space-y-4">
          {clauses.map((clause) => (
            <details className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={clause.id}>
              <summary className="cursor-pointer font-semibold">{clause.clauseNumber}</summary>
              <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{clause.clauseText}</p>
              <button className="mt-4 rounded-md border border-[var(--border-silver)] px-4 py-2" onClick={() => generate.mutate(clause.id)} type="button">{copy.generateOne}</button>
            </details>
          ))}
        </article>
        <aside className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
          <h2 className="font-semibold">{copy.progress}</h2>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">{copy.generated}: 0 / {clauses.length}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{copy.job}: {generateAll.data?.data.jobId ?? copy.waiting}</p>
        </aside>
      </div>
    </section>
  );
}
