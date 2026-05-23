'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';

import { zhCN } from '../../../../../../i18n/zh-CN';

const sopMap = {
  'golden-tests': 'docs/sop/03-golden-test-for-expert.md',
  knowledge: 'docs/sop/02-knowledge-upload-for-expert.md',
  rules: 'docs/sop/01-rule-curation-for-lawyer.md',
} as const;

export default function SopPage({ params }: { params: { id: keyof typeof sopMap } }): ReactNode {
  const copy = zhCN.fuelOnboarding;
  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.sopTitle}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{sopMap[params.id] ?? sopMap.rules}</p>
      </header>
      <div className="rounded-md border border-[var(--border-silver)] bg-white/5 p-4">
        <p className="text-sm text-[var(--text-secondary)]">{copy.sopDescription}</p>
        <Link className="mt-4 inline-flex rounded-md bg-[var(--accent-gold)] px-4 py-2 text-sm text-black" href="/admin/onboarding/fuel">{copy.back}</Link>
      </div>
    </section>
  );
}
