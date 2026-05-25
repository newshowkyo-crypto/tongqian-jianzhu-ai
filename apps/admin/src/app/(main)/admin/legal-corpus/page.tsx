'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { zhCN } from '../../../../i18n/zh-CN';

interface CorpusItem {
  clauseCount: number;
  code: string;
  corpusId?: string;
  docType: string;
  expectedClauseCount: number;
  issuer: string;
  sourceUrl: string;
  status: string;
  title: string;
  version: string;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as T;
}

export default function LegalCorpusPage(): ReactNode {
  const copy = zhCN.legalCorpus;
  const statusCopy: Record<string, string> = copy.status;
  const queryClient = useQueryClient();
  const [active, setActive] = useState<CorpusItem | null>(null);
  const [filePath, setFilePath] = useState('');
  const query = useQuery({
    queryFn: () => requestJson<{ data: { items: CorpusItem[] } }>('/api/v1/admin/legal-corpus'),
    queryKey: ['admin', 'legal-corpus'],
  });
  const upload = useMutation({
    mutationFn: (item: CorpusItem) => requestJson('/api/v1/admin/legal-corpus', { body: JSON.stringify({ ...item, filePath, ossObjectKey: `legal-corpus/${item.code}` }), method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'legal-corpus'] }),
  });

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{copy.description}</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {(query.data?.data.items ?? []).map((item) => (
          <article className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4" key={item.code}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.code} · {item.issuer}</p>
              </div>
              <span className="rounded-md border border-[var(--border-silver)] px-3 py-1 text-xs">{statusCopy[item.status] ?? item.status}</span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div><dt className="text-[var(--text-secondary)]">{copy.version}</dt><dd>{item.version}</dd></div>
              <div><dt className="text-[var(--text-secondary)]">{copy.expected}</dt><dd>{item.expectedClauseCount}</dd></div>
              <div><dt className="text-[var(--text-secondary)]">{copy.parsed}</dt><dd>{item.clauseCount}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-4">
              <button className="rounded-md bg-[var(--accent-gold)] px-4 py-2 text-black" onClick={() => setActive(item)} type="button">{copy.upload}</button>
              {item.corpusId ? <Link className="rounded-md border border-[var(--border-silver)] px-4 py-2" href={`/admin/legal-corpus/${item.corpusId}`}>{copy.viewClauses}</Link> : null}
            </div>
          </article>
        ))}
      </div>
      {active ? (
        <aside className="fixed inset-y-0 right-0 w-full max-w-md border-l border-[var(--border-silver)] bg-primary-900 p-6 shadow">
          <h2 className="text-xl font-semibold">{active.title}</h2>
          <label className="mt-6 block text-sm">{copy.filePath}<input className="mt-2 w-full rounded-md border border-[var(--border-silver)] bg-black/20 p-4" onChange={(event) => setFilePath(event.target.value)} value={filePath} /></label>
          <button className="mt-6 rounded-md bg-[var(--accent-gold)] px-4 py-2 text-black" onClick={() => upload.mutate(active)} type="button">{copy.parse}</button>
          <button className="ml-3 rounded-md border border-[var(--border-silver)] px-4 py-2" onClick={() => setActive(null)} type="button">{copy.close}</button>
        </aside>
      ) : null}
    </section>
  );
}
