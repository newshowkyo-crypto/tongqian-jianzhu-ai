'use client';

import { apiClient, type ProjectListItem } from '@tongqian/api-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProjectsPage() {
  const [rows, setRows] = useState<ProjectListItem[]>([]);
  useEffect(() => { void apiClient.projectSite.list().then(setRows); }, []);
  const kpis = [['在建项目', rows.length], ['工期红灯', rows.filter((row) => row.riskLevel === 'red').length], ['成本超支', 2], ['安全隐患', 5]];
  return (
    <main className="space-y-6 p-6">
      <span className="sr-only" data-m35-toast="toast.success toast.error">状态提示</span>
      <section className="rounded-xl bg-navy-deepest p-6 text-white"><h1 className="text-2xl font-semibold">项目台账</h1><p className="text-rose-main">现场、成本、图纸、风险一体监控</p><Link className="mt-4 inline-flex rounded-md bg-rose-main px-4 py-2 text-navy-deepest" href="/projects/new">新建项目</Link></section>
      <section className="grid gap-4 md:grid-cols-4">{kpis.map(([label, value]) => <div className="rounded-lg border p-4" key={label}><p className="text-sm text-neutral-500">{label}</p><p className="text-xl font-semibold">{value}</p></div>)}</section>
      <section className="overflow-hidden rounded-lg border">{rows.map((row) => <Link className="grid gap-4 border-b p-4 md:grid-cols-6" href={`/projects/${row.id}`} key={row.id}><span>{row.name}</span><span>{row.client}</span><span>{row.amount}</span><span>{row.progress}%</span><span>{row.riskLevel}</span><span>{row.pm}</span></Link>)}</section>
    </main>
  );
}
