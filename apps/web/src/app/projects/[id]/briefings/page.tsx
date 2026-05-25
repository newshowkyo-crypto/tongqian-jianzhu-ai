'use client';

import { type ReactNode } from 'react';

export default function BriefingsPage(): ReactNode {
  return <main className="min-h-screen bg-primary-900 p-6 text-white"><h1 className="text-2xl font-semibold">交底文档</h1><button className="mt-4 rounded-md bg-accent-500 px-4 py-2 text-black">生成新交底</button><section className="mt-6 rounded-md border border-white/15 p-4">安全交底 / 技术交底 / 二维码签到 / PDF 导出</section></main>;
}
