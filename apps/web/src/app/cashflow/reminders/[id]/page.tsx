'use client';

import { apiClient, type ReminderDetail } from '@tongqian/api-client';
import { AiReportFooter } from '@tongqian/ui';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ReminderPage() {
  const { id } = useParams<{ id: string }>();
  const [active, setActive] = useState<'formal' | 'legal' | 'soft'>('formal');
  const [detail, setDetail] = useState<ReminderDetail>();
  useEffect(() => { void apiClient.cashflow.getReminder(id).then(setDetail); }, [id]);
  if (!detail) return <main className="p-6">加载中</main>;
  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl bg-navy-deepest p-6 text-white"><h1 className="text-2xl font-semibold">催款函 {detail.id}</h1><p>{detail.receivable.client} · {detail.receivable.amount} · 逾期 {detail.receivable.aging} 天</p></section>
      <section className="flex gap-2">{(['soft', 'formal', 'legal'] as const).map((level) => <button className="rounded-md border px-3 py-2" key={level} onClick={() => setActive(level)} type="button">{level}</button>)}</section>
      <article className="whitespace-pre-wrap rounded-lg border p-4">{detail.body.replace(detail.level, active)}</article>
      <section className="flex flex-wrap gap-2">{['下载 Word', '邮寄给客户', '升级到同乾方略人工催收'].map((item) => <button className="rounded-md border px-3 py-2" key={item}>{item}</button>)}</section>
      <AiReportFooter audience="owner" confidence={detail.confidence} disclaimer={detail.disclaimer} tier={detail.tier} />
    </main>
  );
}
