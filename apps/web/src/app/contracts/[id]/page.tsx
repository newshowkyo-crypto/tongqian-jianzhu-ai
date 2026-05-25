'use client';

import { type ReactNode } from 'react';

const categories = ['付款', '工期', '违约', '担保', '索赔', '不可抗力', '知识产权', '争议解决'];

export default function ContractDetailPage(): ReactNode {
  return (
    <main className="min-h-screen bg-primary-900 p-6 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">合同审查</h1>
        <div className="flex gap-4 text-sm"><span className="rounded-md bg-white/10 px-3 py-2">AI 风险点</span><span className="rounded-md bg-accent-500 px-3 py-2 text-black">38 项强制扫描</span></div>
      </header>
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {categories.map((category) => <article className="rounded-md border border-white/15 p-4" key={category}><h2>{category}</h2><p className="mt-2 text-sm text-white/65">显示命中/未命中，并支持导出补救建议。</p></article>)}
      </section>
    </main>
  );
}
