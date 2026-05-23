'use client';

import { Button, CyberCard } from '@tongqian/ui';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-8">
      <CyberCard className="max-w-md text-center">
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">404 找不到这个页面</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">链接可能已失效，或指向了其他子站。</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/dashboard"><Button>回到工作台</Button></Link>
          <Link href="/policies"><Button variant="outline">政策订阅</Button></Link>
        </div>
      </CyberCard>
    </main>
  );
}
